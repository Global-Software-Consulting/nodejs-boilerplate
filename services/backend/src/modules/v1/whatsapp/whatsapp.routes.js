const express = require('express');
const { auth, validate, validateTwilioSignature } = require('../../../middlewares');
const whatsappController = require('./whatsapp.controller');
const whatsappValidation = require('./whatsapp.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: WhatsApp messaging via Twilio
 */

/**
 * @swagger
 * /v1/whatsapp/messages:
 *   post:
 *     summary: Send a WhatsApp message (text, media, or template)
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Message sent
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/messages', auth('sendWhatsapp'), validate(whatsappValidation.sendMessage), whatsappController.sendMessage);

/**
 * @swagger
 * /v1/whatsapp/messages:
 *   get:
 *     summary: List WhatsApp messages
 *     tags: [WhatsApp]
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
 *         name: conversationId
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
router.get('/messages', auth('manageWhatsapp'), validate(whatsappValidation.getMessages), whatsappController.getMessages);

/**
 * @swagger
 * /v1/whatsapp/messages/{messageId}:
 *   get:
 *     summary: Get a WhatsApp message
 *     tags: [WhatsApp]
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
router.get(
  '/messages/:messageId',
  auth('manageWhatsapp'),
  validate(whatsappValidation.getMessage),
  whatsappController.getMessage,
);

/**
 * @swagger
 * /v1/whatsapp/conversations:
 *   get:
 *     summary: List conversations
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/conversations',
  auth('manageWhatsapp'),
  validate(whatsappValidation.getConversations),
  whatsappController.getConversations,
);

/**
 * @swagger
 * /v1/whatsapp/conversations/{conversationId}:
 *   get:
 *     summary: Get conversation messages
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
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
router.get(
  '/conversations/:conversationId',
  auth('manageWhatsapp'),
  validate(whatsappValidation.getConversation),
  whatsappController.getConversation,
);

// Webhook routes (Twilio signature validation)
/**
 * @swagger
 * /v1/whatsapp/webhook/incoming:
 *   post:
 *     summary: Incoming WhatsApp message webhook
 *     tags: [WhatsApp]
 *     responses:
 *       "200":
 *         description: TwiML response
 */
router.post('/webhook/incoming', validateTwilioSignature, whatsappController.receiveMessage);

/**
 * @swagger
 * /v1/whatsapp/webhook/status:
 *   post:
 *     summary: WhatsApp message status webhook
 *     tags: [WhatsApp]
 *     responses:
 *       "200":
 *         description: OK
 */
router.post('/webhook/status', validateTwilioSignature, whatsappController.statusCallback);

module.exports = router;
