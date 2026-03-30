const Stripe = require('stripe');
const httpStatus = require('http-status');
const { CONFIG } = require('../../../config');
const { ApiError } = require('../../../utils');
const { getUserRepository } = require('../../../repositories');
const Payment = require('./payment.model');
const Subscription = require('./subscription.model');

const stripe = new Stripe(CONFIG.env.STRIPE_SECRET_KEY);

const createCustomer = async (user) => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  });
  await getUserRepository().updateById(user.id, { stripeCustomerId: customer.id });
  return customer;
};

const getOrCreateCustomer = async (user) => {
  if (user.stripeCustomerId) {
    return stripe.customers.retrieve(user.stripeCustomerId);
  }
  return createCustomer(user);
};

const updateCustomer = async (user, updateBody) => {
  if (!user.stripeCustomerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Stripe customer found for this user');
  }
  return stripe.customers.update(user.stripeCustomerId, updateBody);
};

const deleteCustomer = async (user) => {
  if (!user.stripeCustomerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Stripe customer found for this user');
  }
  await stripe.customers.del(user.stripeCustomerId);
  await getUserRepository().updateById(user.id, { stripeCustomerId: null });
};

const createPaymentIntent = async (user, { amount, currency, description, metadata }) => {
  const customer = await getOrCreateCustomer(user);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    description,
    metadata: { ...metadata, userId: user.id },
  });
  await Payment.create({
    user: user.id,
    stripePaymentIntentId: paymentIntent.id,
    type: 'one_time',
    status: paymentIntent.status,
    amount,
    currency,
    description,
    metadata,
  });
  return paymentIntent;
};

const getPaymentIntent = async (paymentId, userId) => {
  const payment = await Payment.findOne({ _id: paymentId, user: userId });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  return payment;
};

const queryPayments = async (filter, options) => Payment.paginate(filter, options);

const createCheckoutSession = async (user, { lineItems, successUrl, cancelUrl, mode, metadata }) => {
  const customer = await getOrCreateCustomer(user);
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: lineItems,
    mode: mode || 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { ...metadata, userId: user.id },
  });
  if (mode !== 'subscription') {
    await Payment.create({
      user: user.id,
      stripeCheckoutSessionId: session.id,
      type: 'checkout',
      status: 'processing',
      amount: session.amount_total,
      currency: session.currency,
      metadata,
    });
  }
  return session;
};

const createSubscription = async (user, { priceId, trialPeriodDays, metadata }) => {
  const customer = await getOrCreateCustomer(user);
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: trialPeriodDays,
    metadata: { ...metadata, userId: user.id },
  });
  await Subscription.create({
    user: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    stripeProductId: subscription.items.data[0]?.price?.product,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
  });
  return subscription;
};

const getSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  return subscription;
};

const querySubscriptions = async (filter, options) => Subscription.paginate(filter, options);

const updateSubscription = async (subscriptionId, userId, updateBody) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  const stripeUpdate = {};
  if (updateBody.priceId) {
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    stripeUpdate.items = [{ id: stripeSub.items.data[0].id, price: updateBody.priceId }];
  }
  if (updateBody.cancelAtPeriodEnd !== undefined) {
    stripeUpdate.cancel_at_period_end = updateBody.cancelAtPeriodEnd;
  }
  const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, stripeUpdate);
  subscription.status = updated.status;
  subscription.cancelAtPeriodEnd = updated.cancel_at_period_end;
  if (updateBody.priceId) {
    subscription.stripePriceId = updateBody.priceId;
    subscription.stripeProductId = updated.items.data[0]?.price?.product;
  }
  subscription.currentPeriodStart = new Date(updated.current_period_start * 1000);
  subscription.currentPeriodEnd = new Date(updated.current_period_end * 1000);
  await subscription.save();
  return subscription;
};

const cancelSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId });
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  subscription.status = 'canceled';
  await subscription.save();
  return subscription;
};

const listInvoices = async (user, { limit, startingAfter }) => {
  if (!user.stripeCustomerId) {
    return { data: [], has_more: false };
  }
  const params = { customer: user.stripeCustomerId, limit: limit || 10 };
  if (startingAfter) params.starting_after = startingAfter;
  return stripe.invoices.list(params);
};

const getInvoice = async (invoiceId) => {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  return invoice;
};

const createRefund = async (paymentId, userId, { amount, reason }) => {
  const payment = await Payment.findOne({ _id: paymentId, user: userId });
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  if (!payment.stripePaymentIntentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment cannot be refunded');
  }
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    amount,
    reason,
  });
  payment.refundedAmount += refund.amount;
  payment.stripeRefundIds.push(refund.id);
  payment.status = payment.refundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
  await payment.save();
  return refund;
};

const createPortalSession = async (user, { returnUrl }) => {
  if (!user.stripeCustomerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No Stripe customer found for this user');
  }
  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });
};

module.exports = {
  stripe,
  createCustomer,
  getOrCreateCustomer,
  updateCustomer,
  deleteCustomer,
  createPaymentIntent,
  getPaymentIntent,
  queryPayments,
  createCheckoutSession,
  createSubscription,
  getSubscription,
  querySubscriptions,
  updateSubscription,
  cancelSubscription,
  listInvoices,
  getInvoice,
  createRefund,
  createPortalSession,
};
