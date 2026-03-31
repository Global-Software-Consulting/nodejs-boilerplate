const Joi = require('joi');
const { objectId } = require('../../../utils/customValidation');

const updateCustomer = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    address: Joi.object().keys({
      line1: Joi.string(),
      line2: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      postal_code: Joi.string(),
      country: Joi.string(),
    }),
  }),
};

const createPaymentIntent = {
  body: Joi.object().keys({
    amount: Joi.number().integer().min(50).required(),
    currency: Joi.string().length(3).required(),
    description: Joi.string(),
    metadata: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

const getPayments = {
  query: Joi.object().keys({
    status: Joi.string().valid(
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'succeeded',
      'failed',
      'canceled',
      'refunded',
      'partially_refunded',
    ),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPayment = {
  params: Joi.object().keys({
    paymentId: Joi.string().custom(objectId).required(),
  }),
};

const createCheckoutSession = {
  body: Joi.object().keys({
    lineItems: Joi.array()
      .items(
        Joi.object().keys({
          price: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
        }),
      )
      .min(1)
      .required(),
    successUrl: Joi.string().uri().required(),
    cancelUrl: Joi.string().uri().required(),
    mode: Joi.string().valid('payment', 'subscription', 'setup'),
    metadata: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

const createSubscription = {
  body: Joi.object().keys({
    priceId: Joi.string().required(),
    trialPeriodDays: Joi.number().integer().min(1),
    metadata: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

const getSubscriptions = {
  query: Joi.object().keys({
    status: Joi.string().valid(
      'active',
      'past_due',
      'unpaid',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'trialing',
      'paused',
    ),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().custom(objectId).required(),
  }),
};

const updateSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      priceId: Joi.string(),
      cancelAtPeriodEnd: Joi.boolean(),
    })
    .min(1),
};

const cancelSubscription = {
  params: Joi.object().keys({
    subscriptionId: Joi.string().custom(objectId).required(),
  }),
};

const listInvoices = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100),
    startingAfter: Joi.string(),
  }),
};

const getInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().required(),
  }),
};

const createRefund = {
  params: Joi.object().keys({
    paymentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    amount: Joi.number().integer().min(1),
    reason: Joi.string().valid('duplicate', 'fraudulent', 'requested_by_customer'),
  }),
};

const createPortalSession = {
  body: Joi.object().keys({
    returnUrl: Joi.string().uri().required(),
  }),
};

module.exports = {
  updateCustomer,
  createPaymentIntent,
  getPayments,
  getPayment,
  createCheckoutSession,
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  listInvoices,
  getInvoice,
  createRefund,
  createPortalSession,
};
