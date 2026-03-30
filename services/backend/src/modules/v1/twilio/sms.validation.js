const Joi = require('joi');
const { objectId } = require('../../../utils/customValidation');

const phoneNumber = (value, helpers) => {
  if (!/^\+[1-9]\d{1,14}$/.test(value)) {
    return helpers.message('"{{#label}}" must be a valid E.164 phone number');
  }
  return value;
};

const sendSms = {
  body: Joi.object().keys({
    to: Joi.string().custom(phoneNumber).required(),
    body: Joi.string().max(1600).required(),
  }),
};

const sendBulkSms = {
  body: Joi.object().keys({
    recipients: Joi.array().items(Joi.string().custom(phoneNumber)).min(1).max(100).required(),
    body: Joi.string().max(1600).required(),
  }),
};

const getMessages = {
  query: Joi.object().keys({
    status: Joi.string().valid('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received'),
    direction: Joi.string().valid('inbound', 'outbound'),
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

module.exports = {
  phoneNumber,
  sendSms,
  sendBulkSms,
  getMessages,
  getMessage,
};
