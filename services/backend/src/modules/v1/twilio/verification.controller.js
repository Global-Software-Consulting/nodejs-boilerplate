const httpStatus = require('http-status');
const { catchAsync } = require('../../../utils');
const twilioService = require('./twilio.service');

const sendCode = catchAsync(async (req, res) => {
  const result = await twilioService.sendVerificationCode(req.body.phoneNumber);
  res.status(httpStatus.OK).send(result);
});

const verifyCode = catchAsync(async (req, res) => {
  const result = await twilioService.checkVerificationCode(req.body.phoneNumber, req.body.code);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  sendCode,
  verifyCode,
};
