const express = require('express');
const { auth, validate } = require('../../../middlewares');
const stripeController = require('./stripe.controller');
const stripeValidation = require('./stripe.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe payment management
 */

/**
 * @swagger
 * /v1/stripe/customers:
 *   post:
 *     summary: Create a Stripe customer
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Customer created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/customers', auth('manageOwnPayments'), stripeController.createCustomer);

/**
 * @swagger
 * /v1/stripe/customers:
 *   patch:
 *     summary: Update Stripe customer
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Customer updated
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  '/customers',
  auth('manageOwnPayments'),
  validate(stripeValidation.updateCustomer),
  stripeController.updateCustomer,
);

/**
 * @swagger
 * /v1/stripe/customers:
 *   delete:
 *     summary: Delete Stripe customer
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "204":
 *         description: Customer deleted
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/customers', auth('manageOwnPayments'), stripeController.deleteCustomer);

/**
 * @swagger
 * /v1/stripe/payment-intents:
 *   post:
 *     summary: Create a payment intent
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Payment intent created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/payment-intents',
  auth('manageOwnPayments'),
  validate(stripeValidation.createPaymentIntent),
  stripeController.createPaymentIntent,
);

/**
 * @swagger
 * /v1/stripe/payments:
 *   get:
 *     summary: List payments
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
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
router.get('/payments', auth('manageOwnPayments'), validate(stripeValidation.getPayments), stripeController.getPayments);

/**
 * @swagger
 * /v1/stripe/payments/{paymentId}:
 *   get:
 *     summary: Get a payment
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
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
  '/payments/:paymentId',
  auth('manageOwnPayments'),
  validate(stripeValidation.getPayment),
  stripeController.getPayment,
);

/**
 * @swagger
 * /v1/stripe/payments/{paymentId}/refunds:
 *   post:
 *     summary: Create a refund
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "201":
 *         description: Refund created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/payments/:paymentId/refunds',
  auth('manageOwnPayments'),
  validate(stripeValidation.createRefund),
  stripeController.createRefund,
);

/**
 * @swagger
 * /v1/stripe/checkout-sessions:
 *   post:
 *     summary: Create a checkout session
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Checkout session created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/checkout-sessions',
  auth('manageOwnPayments'),
  validate(stripeValidation.createCheckoutSession),
  stripeController.createCheckoutSession,
);

/**
 * @swagger
 * /v1/stripe/subscriptions:
 *   post:
 *     summary: Create a subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Subscription created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/subscriptions',
  auth('manageOwnPayments'),
  validate(stripeValidation.createSubscription),
  stripeController.createSubscription,
);

/**
 * @swagger
 * /v1/stripe/subscriptions:
 *   get:
 *     summary: List subscriptions
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/subscriptions',
  auth('manageOwnPayments'),
  validate(stripeValidation.getSubscriptions),
  stripeController.getSubscriptions,
);

/**
 * @swagger
 * /v1/stripe/subscriptions/{subscriptionId}:
 *   get:
 *     summary: Get a subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
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
  '/subscriptions/:subscriptionId',
  auth('manageOwnPayments'),
  validate(stripeValidation.getSubscription),
  stripeController.getSubscription,
);

/**
 * @swagger
 * /v1/stripe/subscriptions/{subscriptionId}:
 *   patch:
 *     summary: Update a subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
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
router.patch(
  '/subscriptions/:subscriptionId',
  auth('manageOwnPayments'),
  validate(stripeValidation.updateSubscription),
  stripeController.updateSubscription,
);

/**
 * @swagger
 * /v1/stripe/subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Cancel a subscription
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Subscription canceled
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/subscriptions/:subscriptionId',
  auth('manageOwnPayments'),
  validate(stripeValidation.cancelSubscription),
  stripeController.cancelSubscription,
);

/**
 * @swagger
 * /v1/stripe/invoices:
 *   get:
 *     summary: List invoices
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/invoices', auth('manageOwnPayments'), validate(stripeValidation.listInvoices), stripeController.listInvoices);

/**
 * @swagger
 * /v1/stripe/invoices/{invoiceId}:
 *   get:
 *     summary: Get an invoice
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
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
  '/invoices/:invoiceId',
  auth('manageOwnPayments'),
  validate(stripeValidation.getInvoice),
  stripeController.getInvoice,
);

/**
 * @swagger
 * /v1/stripe/portal-sessions:
 *   post:
 *     summary: Create a billing portal session
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "201":
 *         description: Portal session created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/portal-sessions',
  auth('manageOwnPayments'),
  validate(stripeValidation.createPortalSession),
  stripeController.createPortalSession,
);

/**
 * @swagger
 * /v1/stripe/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Stripe]
 *     responses:
 *       "200":
 *         description: Webhook received
 *       "400":
 *         description: Invalid signature
 */
router.post('/webhook', stripeController.handleWebhook);

module.exports = router;
