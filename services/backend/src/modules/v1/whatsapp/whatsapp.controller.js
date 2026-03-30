const httpStatus = require('http-status');
const { catchAsync, pick } = require('../../../utils');
const { logger } = require('../../../config');
const whatsappService = require('./whatsapp.service');

const sendMessage = catchAsync(async (req, res) => {
  const { to, body, mediaUrls, templateName, templateVariables } = req.body;
  let message;
  if (templateName) {
    message = await whatsappService.sendTemplateMessage(req.user.id, { to, templateName, templateVariables });
  } else if (mediaUrls?.length) {
    message = await whatsappService.sendMediaMessage(req.user.id, { to, body, mediaUrls });
  } else {
    message = await whatsappService.sendTextMessage(req.user.id, { to, body });
  }
  res.status(httpStatus.CREATED).send(message);
});

const getMessages = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.direction) filter.direction = req.query.direction;
  if (req.query.conversationId) filter.conversationId = req.query.conversationId;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await whatsappService.queryMessages(filter, options);
  res.send(result);
});

const getMessage = catchAsync(async (req, res) => {
  const message = await whatsappService.getMessageById(req.params.messageId, req.user.id);
  res.send(message);
});

const getConversations = catchAsync(async (req, res) => {
  const conversations = await whatsappService.getConversations(req.user.id);
  res.send(conversations);
});

const getConversation = catchAsync(async (req, res) => {
  const messages = await whatsappService.getConversation(req.params.conversationId, req.user.id);
  res.send(messages);
});

const receiveMessage = async (req, res) => {
  try {
    await whatsappService.handleIncomingMessage(req.body);
    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    logger.error('Error handling incoming WhatsApp message:', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('<Response></Response>');
  }
};

const statusCallback = async (req, res) => {
  try {
    await whatsappService.handleStatusCallback(req.body);
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    logger.error('Error handling WhatsApp status callback:', err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessage,
  getConversations,
  getConversation,
  receiveMessage,
  statusCallback,
};
