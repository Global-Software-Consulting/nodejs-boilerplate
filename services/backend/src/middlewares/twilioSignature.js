const twilio = require('twilio');
const httpStatus = require('http-status');
const { CONFIG } = require('../config');

const validateTwilioSignature = (req, res, next) => {
  if (CONFIG.env.NODE_ENV === 'test') {
    return next();
  }

  const signature = req.headers['x-twilio-signature'];
  if (!signature) {
    return res.status(httpStatus.FORBIDDEN).json({ error: 'Missing Twilio signature' });
  }

  const url = `${CONFIG.env.TWILIO_WEBHOOK_URL}${req.originalUrl}`;
  const isValid = twilio.validateRequest(CONFIG.env.TWILIO_AUTH_TOKEN, signature, url, req.body);

  if (!isValid) {
    return res.status(httpStatus.FORBIDDEN).json({ error: 'Invalid Twilio signature' });
  }

  return next();
};

module.exports = validateTwilioSignature;
