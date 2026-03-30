const { CONFIG, logger } = require('../../../config');
const Payment = require('./payment.model');
const Subscription = require('./subscription.model');
const { stripe } = require('./stripe.service');

const constructEvent = (rawBody, signature) =>
  stripe.webhooks.constructEvent(rawBody, signature, CONFIG.env.STRIPE_WEBHOOK_SECRET);

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  await Payment.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, { status: 'succeeded' }, { new: true });
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    {
      status: 'failed',
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
    },
    { new: true },
  );
};

const handleCheckoutSessionCompleted = async (session) => {
  const update = { status: 'succeeded' };
  await Payment.findOneAndUpdate({ stripeCheckoutSessionId: session.id }, update, { new: true });
};

const handleSubscriptionCreated = async (subscription) => {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    { new: true },
  );
};

const handleSubscriptionUpdated = async (subscription) => {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    { new: true },
  );
};

const handleSubscriptionDeleted = async (subscription) => {
  await Subscription.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { status: 'canceled' }, { new: true });
};

const handleInvoicePaid = async (invoice) => {
  if (invoice.subscription) {
    await Subscription.findOneAndUpdate({ stripeSubscriptionId: invoice.subscription }, { status: 'active' }, { new: true });
  }
};

const handleInvoicePaymentFailed = async (invoice) => {
  if (invoice.subscription) {
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: invoice.subscription },
      { status: 'past_due' },
      { new: true },
    );
  }
};

const handleChargeRefunded = async (charge) => {
  if (charge.payment_intent) {
    const payment = await Payment.findOne({ stripePaymentIntentId: charge.payment_intent });
    if (payment) {
      payment.refundedAmount = charge.amount_refunded;
      payment.status = charge.amount_refunded >= charge.amount ? 'refunded' : 'partially_refunded';
      await payment.save();
    }
  }
};

const eventHandlers = {
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentIntentFailed,
  'checkout.session.completed': handleCheckoutSessionCompleted,
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.paid': handleInvoicePaid,
  'invoice.payment_failed': handleInvoicePaymentFailed,
  'charge.refunded': handleChargeRefunded,
};

const handleWebhookEvent = async (event) => {
  const handler = eventHandlers[event.type];
  if (handler) {
    await handler(event.data.object);
    logger.info(`Stripe webhook handled: ${event.type}`);
  } else {
    logger.info(`Unhandled Stripe webhook event: ${event.type}`);
  }
};

module.exports = {
  constructEvent,
  handleWebhookEvent,
};
