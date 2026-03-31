const twilio = require('twilio');
const httpStatus = require('http-status');
const { CONFIG, logger } = require('../../../config');
const { ApiError } = require('../../../utils');
const WhatsAppMessage = require('./whatsapp.model');

const client = twilio(CONFIG.env.TWILIO_ACCOUNT_SID, CONFIG.env.TWILIO_AUTH_TOKEN);

const generateConversationId = (number1, number2) => {
  const sorted = [number1, number2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

const sendTextMessage = async (userId, { to, body }) => {
  const twilioMsg = await client.messages.create({
    body,
    to: `whatsapp:${to}`,
    from: `whatsapp:${CONFIG.env.TWILIO_WHATSAPP_NUMBER}`,
    statusCallback: `${CONFIG.env.TWILIO_WEBHOOK_BASE_URL}/v1/whatsapp/webhook/status`,
  });
  const message = await WhatsAppMessage.create({
    to,
    from: CONFIG.env.TWILIO_WHATSAPP_NUMBER,
    body,
    messageType: 'text',
    status: twilioMsg.status,
    direction: 'outbound',
    sid: twilioMsg.sid,
    conversationId: generateConversationId(to, CONFIG.env.TWILIO_WHATSAPP_NUMBER),
    user: userId,
  });
  return message;
};

const sendMediaMessage = async (userId, { to, body, mediaUrls }) => {
  const twilioMsg = await client.messages.create({
    body: body || '',
    to: `whatsapp:${to}`,
    from: `whatsapp:${CONFIG.env.TWILIO_WHATSAPP_NUMBER}`,
    mediaUrl: mediaUrls,
    statusCallback: `${CONFIG.env.TWILIO_WEBHOOK_BASE_URL}/v1/whatsapp/webhook/status`,
  });
  const message = await WhatsAppMessage.create({
    to,
    from: CONFIG.env.TWILIO_WHATSAPP_NUMBER,
    body: body || '',
    mediaUrl: mediaUrls,
    messageType: 'media',
    status: twilioMsg.status,
    direction: 'outbound',
    sid: twilioMsg.sid,
    conversationId: generateConversationId(to, CONFIG.env.TWILIO_WHATSAPP_NUMBER),
    user: userId,
  });
  return message;
};

const sendTemplateMessage = async (userId, { to, templateName, templateVariables }) => {
  const contentVariables = {};
  templateVariables.forEach((val, idx) => {
    contentVariables[String(idx + 1)] = val;
  });
  const twilioMsg = await client.messages.create({
    to: `whatsapp:${to}`,
    from: `whatsapp:${CONFIG.env.TWILIO_WHATSAPP_NUMBER}`,
    contentSid: templateName,
    contentVariables: JSON.stringify(contentVariables),
    statusCallback: `${CONFIG.env.TWILIO_WEBHOOK_BASE_URL}/v1/whatsapp/webhook/status`,
  });
  const message = await WhatsAppMessage.create({
    to,
    from: CONFIG.env.TWILIO_WHATSAPP_NUMBER,
    templateName,
    templateVariables,
    messageType: 'template',
    status: twilioMsg.status,
    direction: 'outbound',
    sid: twilioMsg.sid,
    conversationId: generateConversationId(to, CONFIG.env.TWILIO_WHATSAPP_NUMBER),
    user: userId,
  });
  return message;
};

const handleIncomingMessage = async ({ From, To, Body, MessageSid, NumMedia, MediaUrl0, MediaContentType0 }) => {
  const from = From.replace('whatsapp:', '');
  const to = To.replace('whatsapp:', '');
  const mediaUrl = [];
  const mediaContentType = [];
  const numMedia = parseInt(NumMedia || '0', 10);
  if (numMedia > 0 && MediaUrl0) {
    mediaUrl.push(MediaUrl0);
    if (MediaContentType0) mediaContentType.push(MediaContentType0);
  }
  // Look up the user by matching the WhatsApp number they sent TO
  const { getUserRepository } = require('../../../repositories');
  const recipient = await getUserRepository().findOne({ phone: to });

  const message = await WhatsAppMessage.findOneAndUpdate(
    { sid: MessageSid },
    {
      ...(recipient && { user: recipient.id }),
      to,
      from,
      body: Body || '',
      mediaUrl,
      mediaContentType,
      messageType: numMedia > 0 ? 'media' : 'text',
      status: 'received',
      direction: 'inbound',
      sid: MessageSid,
      conversationId: generateConversationId(from, to),
    },
    { upsert: true, new: true },
  );
  logger.info(`Incoming WhatsApp from ${from}: ${Body || '[media]'}`);
  return message;
};

const handleStatusCallback = async ({ MessageSid, MessageStatus, ErrorCode, ErrorMessage }) => {
  const update = { status: MessageStatus };
  if (ErrorCode) update.errorCode = parseInt(ErrorCode, 10);
  if (ErrorMessage) update.errorMessage = ErrorMessage;
  await WhatsAppMessage.findOneAndUpdate({ sid: MessageSid }, update, { new: true });
};

const getMessageById = async (messageId, userId) => {
  const message = await WhatsAppMessage.findOne({ _id: messageId, user: userId });
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  return message;
};

const queryMessages = async (filter, options) => WhatsAppMessage.paginate(filter, options);

const getConversation = async (conversationId, userId) => {
  const messages = await WhatsAppMessage.find({ conversationId, user: userId }).sort({ createdAt: 1 });
  if (!messages.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }
  return messages;
};

const getConversations = async (userId) => {
  const conversations = await WhatsAppMessage.aggregate([
    { $match: { user: userId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);
  return conversations;
};

module.exports = {
  client,
  generateConversationId,
  sendTextMessage,
  sendMediaMessage,
  sendTemplateMessage,
  handleIncomingMessage,
  handleStatusCallback,
  getMessageById,
  queryMessages,
  getConversation,
  getConversations,
};
