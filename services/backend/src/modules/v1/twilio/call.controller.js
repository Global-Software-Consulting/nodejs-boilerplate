const httpStatus = require('http-status');
const { catchAsync, pick } = require('../../../utils');
const twilioService = require('./twilio.service');

const makeCall = catchAsync(async (req, res) => {
  const call = await twilioService.makeCall(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(call);
});

const getCalls = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.direction) filter.direction = req.query.direction;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await twilioService.queryCalls(filter, options);
  res.send(result);
});

const getCall = catchAsync(async (req, res) => {
  const call = await twilioService.getCallById(req.params.callId, req.user.id);
  res.send(call);
});

module.exports = {
  makeCall,
  getCalls,
  getCall,
};
