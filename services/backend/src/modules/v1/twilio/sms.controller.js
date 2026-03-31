const httpStatus = require('http-status');
const { catchAsync, pick } = require('../../../utils');
const twilioService = require('./twilio.service');

const sendSms = catchAsync(async (req, res) => {
  const message = await twilioService.sendSms(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(message);
});

const sendBulkSms = catchAsync(async (req, res) => {
  const results = await twilioService.sendBulkSms(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(results);
});

const getMessages = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.direction) filter.direction = req.query.direction;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await twilioService.queryMessages(filter, options);
  res.send(result);
});

const getMessage = catchAsync(async (req, res) => {
  const message = await twilioService.getMessageById(req.params.messageId, req.user.id);
  res.send(message);
});

module.exports = {
  sendSms,
  sendBulkSms,
  getMessages,
  getMessage,
};
