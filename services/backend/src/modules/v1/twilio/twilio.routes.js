const express = require('express');
const { auth, validate, validateTwilioSignature } = require('../../../middlewares');
const smsController = require('./sms.controller');
const callController = require('./call.controller');
const verificationController = require('./verification.controller');
const webhookController = require('./webhook.controller');
const smsValidation = require('./sms.validation');
const callValidation = require('./call.validation');
const verificationValidation = require('./verification.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Twilio
 *   description: Twilio SMS, calls, and verification
 */

// SMS routes
/**
 * @swagger
 * /v1/twilio/sms/send:
 *   post:
 *     summary: Send an SMS
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: SMS sent
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/sms/send', auth('manageSms'), validate(smsValidation.sendSms), smsController.sendSms);

/**
 * @swagger
 * /v1/twilio/sms/send-bulk:
 *   post:
 *     summary: Send bulk SMS
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Bulk SMS sent
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/sms/send-bulk', auth('manageSms'), validate(smsValidation.sendBulkSms), smsController.sendBulkSms);

/**
 * @swagger
 * /v1/twilio/sms:
 *   get:
 *     summary: List SMS messages
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/sms', auth('manageSms'), validate(smsValidation.getMessages), smsController.getMessages);

/**
 * @swagger
 * /v1/twilio/sms/{messageId}:
 *   get:
 *     summary: Get an SMS message
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/sms/:messageId', auth('manageSms'), validate(smsValidation.getMessage), smsController.getMessage);

// Call routes
/**
 * @swagger
 * /v1/twilio/calls/make:
 *   post:
 *     summary: Make a phone call
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Call initiated
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/calls/make', auth('manageCalls'), validate(callValidation.makeCall), callController.makeCall);

/**
 * @swagger
 * /v1/twilio/calls:
 *   get:
 *     summary: List calls
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/calls', auth('manageCalls'), validate(callValidation.getCalls), callController.getCalls);

/**
 * @swagger
 * /v1/twilio/calls/{callId}:
 *   get:
 *     summary: Get a call
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/calls/:callId', auth('manageCalls'), validate(callValidation.getCall), callController.getCall);

// Verification routes
/**
 * @swagger
 * /v1/twilio/verify/send:
 *   post:
 *     summary: Send verification code
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Verification code sent
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/verify/send', auth(), validate(verificationValidation.sendCode), verificationController.sendCode);

/**
 * @swagger
 * /v1/twilio/verify/check:
 *   post:
 *     summary: Check verification code
 *     tags: [Twilio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Verification result
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/verify/check', auth(), validate(verificationValidation.verifyCode), verificationController.verifyCode);

// Webhook routes (Twilio signature validation)
/**
 * @swagger
 * /v1/twilio/webhooks/sms/incoming:
 *   post:
 *     summary: Incoming SMS webhook
 *     tags: [Twilio]
 *     responses:
 *       "200":
 *         description: TwiML response
 */
router.post('/webhooks/sms/incoming', validateTwilioSignature, webhookController.handleIncomingSms);

/**
 * @swagger
 * /v1/twilio/webhooks/sms/status:
 *   post:
 *     summary: SMS status callback webhook
 *     tags: [Twilio]
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/webhooks/sms/status', validateTwilioSignature, webhookController.handleSmsStatus);

/**
 * @swagger
 * /v1/twilio/webhooks/calls/status:
 *   post:
 *     summary: Call status callback webhook
 *     tags: [Twilio]
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/webhooks/calls/status', validateTwilioSignature, webhookController.handleCallStatus);

/**
 * @swagger
 * /v1/twilio/webhooks/calls/incoming:
 *   post:
 *     summary: Incoming call webhook
 *     tags: [Twilio]
 *     responses:
 *       "200":
 *         description: TwiML response
 */
router.post('/webhooks/calls/incoming', validateTwilioSignature, webhookController.handleIncomingCall);

module.exports = router;
