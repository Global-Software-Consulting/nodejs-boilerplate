const httpStatus = require('http-status');
const { logger } = require('../../../config');
const twilioService = require('./twilio.service');

const handleIncomingSms = async (req, res) => {
  try {
    await twilioService.handleIncomingSms(req.body);
    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    logger.error('Error handling incoming SMS:', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('<Response></Response>');
  }
};

const handleSmsStatus = async (req, res) => {
  try {
    await twilioService.updateMessageStatus(req.body);
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    logger.error('Error handling SMS status:', err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
};

const handleCallStatus = async (req, res) => {
  try {
    await twilioService.handleCallStatusUpdate(req.body);
    res.sendStatus(httpStatus.OK);
  } catch (err) {
    logger.error('Error handling call status:', err);
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
};

const handleIncomingCall = async (req, res) => {
  try {
    await twilioService.handleIncomingCall(req.body);
    const twiml = `<Response><Say>Thank you for calling. Please leave a message after the beep.</Say><Record maxLength="60" /></Response>`;
    res.type('text/xml').send(twiml);
  } catch (err) {
    logger.error('Error handling incoming call:', err);
    res.type('text/xml').send('<Response><Say>An error occurred.</Say></Response>');
  }
};

module.exports = {
  handleIncomingSms,
  handleSmsStatus,
  handleCallStatus,
  handleIncomingCall,
};
