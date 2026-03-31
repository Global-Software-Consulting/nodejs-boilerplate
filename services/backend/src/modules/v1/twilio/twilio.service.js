const twilio = require('twilio');
const httpStatus = require('http-status');
const { CONFIG, logger } = require('../../../config');
const { ApiError } = require('../../../utils');
const Message = require('./message.model');
const Call = require('./call.model');

const client = twilio(CONFIG.env.TWILIO_ACCOUNT_SID, CONFIG.env.TWILIO_AUTH_TOKEN);

const sendSms = async (userId, { to, body }) => {
  const twilioMsg = await client.messages.create({
    body,
    to,
    from: CONFIG.env.TWILIO_PHONE_NUMBER,
    statusCallback: `${CONFIG.env.TWILIO_WEBHOOK_URL}/v1/twilio/webhooks/sms/status`,
  });
  const message = await Message.create({
    user: userId,
    to,
    from: CONFIG.env.TWILIO_PHONE_NUMBER,
    body,
    status: twilioMsg.status,
    direction: 'outbound',
    sid: twilioMsg.sid,
    segments: twilioMsg.numSegments ? parseInt(twilioMsg.numSegments, 10) : 1,
  });
  return message;
};

const sendBulkSms = async (userId, { recipients, body }) => {
  const results = await Promise.all(
    recipients.map(async (to) => {
      try {
        const msg = await sendSms(userId, { to, body });
        return { to, status: 'sent', messageId: msg.id };
      } catch (err) {
        return { to, status: 'failed', error: err.message };
      }
    }),
  );
  return results;
};

const queryMessages = async (filter, options) => Message.paginate(filter, options);

const getMessageById = async (messageId, userId) => {
  const message = await Message.findOne({ _id: messageId, user: userId });
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  return message;
};

const getMessageBySid = async (sid) => Message.findOne({ sid });

const handleIncomingSms = async ({ From, To, Body, MessageSid, NumSegments }) => {
  // Look up the user by matching the Twilio phone number they sent TO
  const { getUserRepository } = require('../../../repositories');
  const recipient = await getUserRepository().findOne({ phone: To });

  const message = await Message.findOneAndUpdate(
    { sid: MessageSid },
    {
      ...(recipient && { user: recipient.id }),
      to: To,
      from: From,
      body: Body,
      status: 'received',
      direction: 'inbound',
      sid: MessageSid,
      segments: NumSegments ? parseInt(NumSegments, 10) : 1,
    },
    { upsert: true, new: true },
  );
  logger.info(`Incoming SMS from ${From}: ${Body}`);
  return message;
};

const updateMessageStatus = async ({ MessageSid, MessageStatus, ErrorCode, ErrorMessage }) => {
  const update = { status: MessageStatus };
  if (ErrorCode) update.errorCode = parseInt(ErrorCode, 10);
  if (ErrorMessage) update.errorMessage = ErrorMessage;
  await Message.findOneAndUpdate({ sid: MessageSid }, update, { new: true });
};

const makeCall = async (userId, { to, twimlUrl }) => {
  const twilioCall = await client.calls.create({
    to,
    from: CONFIG.env.TWILIO_PHONE_NUMBER,
    url: twimlUrl,
    statusCallback: `${CONFIG.env.TWILIO_WEBHOOK_URL}/v1/twilio/webhooks/calls/status`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  });
  const call = await Call.create({
    user: userId,
    to,
    from: CONFIG.env.TWILIO_PHONE_NUMBER,
    status: twilioCall.status,
    direction: 'outbound',
    sid: twilioCall.sid,
    twimlUrl,
  });
  return call;
};

const queryCalls = async (filter, options) => Call.paginate(filter, options);

const getCallById = async (callId, userId) => {
  const call = await Call.findOne({ _id: callId, user: userId });
  if (!call) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Call not found');
  }
  return call;
};

const getCallBySid = async (sid) => Call.findOne({ sid });

const handleCallStatusUpdate = async ({ CallSid, CallStatus, CallDuration, ErrorCode, ErrorMessage }) => {
  const update = { status: CallStatus };
  if (CallDuration) update.duration = parseInt(CallDuration, 10);
  if (ErrorCode) update.errorCode = parseInt(ErrorCode, 10);
  if (ErrorMessage) update.errorMessage = ErrorMessage;
  await Call.findOneAndUpdate({ sid: CallSid }, update, { new: true });
};

const handleIncomingCall = async ({ From, To, CallSid }) => {
  // Look up the user by matching the Twilio phone number they called
  const { getUserRepository } = require('../../../repositories');
  const recipient = await getUserRepository().findOne({ phone: To });

  await Call.findOneAndUpdate(
    { sid: CallSid },
    {
      ...(recipient && { user: recipient.id }),
      to: To,
      from: From,
      status: 'ringing',
      direction: 'inbound',
      sid: CallSid,
    },
    { upsert: true, new: true },
  );
  logger.info(`Incoming call from ${From}`);
};

const sendVerificationCode = async (to) => {
  const verification = await client.verify.v2.services(CONFIG.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
    to,
    channel: 'sms',
  });
  return { status: verification.status, to: verification.to };
};

const checkVerificationCode = async (to, code) => {
  const check = await client.verify.v2.services(CONFIG.env.TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
    to,
    code,
  });
  if (check.status !== 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification code');
  }
  return { status: check.status, to: check.to };
};

module.exports = {
  client,
  sendSms,
  sendBulkSms,
  queryMessages,
  getMessageById,
  getMessageBySid,
  handleIncomingSms,
  updateMessageStatus,
  makeCall,
  queryCalls,
  getCallById,
  getCallBySid,
  handleCallStatusUpdate,
  handleIncomingCall,
  sendVerificationCode,
  checkVerificationCode,
};
