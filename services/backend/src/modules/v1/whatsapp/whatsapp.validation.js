const Joi = require('joi');
const { objectId } = require('../../../utils/customValidation');

const phoneNumber = (value, helpers) => {
  if (!/^\+[1-9]\d{1,14}$/.test(value)) {
    return helpers.message('"{{#label}}" must be a valid E.164 phone number');
  }
  return value;
};

const sendMessage = {
  body: Joi.object()
    .keys({
      to: Joi.string().custom(phoneNumber).required(),
      body: Joi.string().max(4096),
      mediaUrls: Joi.array().items(Joi.string().uri()).max(10),
      templateName: Joi.string(),
      templateVariables: Joi.array().items(Joi.string()),
    })
    .or('body', 'mediaUrls', 'templateName'),
};

const getMessages = {
  query: Joi.object().keys({
    status: Joi.string().valid('queued', 'sending', 'sent', 'delivered', 'read', 'undelivered', 'failed', 'received'),
    direction: Joi.string().valid('inbound', 'outbound'),
    conversationId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId).required(),
  }),
};

const getConversations = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getConversation = {
  params: Joi.object().keys({
    conversationId: Joi.string().required(),
  }),
};

module.exports = {
  phoneNumber,
  sendMessage,
  getMessages,
  getMessage,
  getConversations,
  getConversation,
};
