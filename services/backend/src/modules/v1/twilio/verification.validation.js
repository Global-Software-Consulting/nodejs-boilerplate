const Joi = require('joi');
const { phoneNumber } = require('./sms.validation');

const sendCode = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().custom(phoneNumber).required(),
  }),
};

const verifyCode = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().custom(phoneNumber).required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
};

module.exports = {
  sendCode,
  verifyCode,
};
