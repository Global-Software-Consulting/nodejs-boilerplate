const Joi = require('joi');
const { objectId } = require('../../../utils/customValidation');
const { phoneNumber } = require('./sms.validation');

const makeCall = {
  body: Joi.object().keys({
    to: Joi.string().custom(phoneNumber).required(),
    twimlUrl: Joi.string().uri().required(),
  }),
};

const getCalls = {
  query: Joi.object().keys({
    status: Joi.string().valid('queued', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'canceled', 'failed'),
    direction: Joi.string().valid('inbound', 'outbound'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCall = {
  params: Joi.object().keys({
    callId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  makeCall,
  getCalls,
  getCall,
};
