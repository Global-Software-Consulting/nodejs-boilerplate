const httpStatus = require('http-status');
const { catchAsync, pick } = require('../../../utils');
const stripeService = require('./stripe.service');
const webhookService = require('./stripe.webhook.service');

const createCustomer = catchAsync(async (req, res) => {
  const customer = await stripeService.createCustomer(req.user);
  res.status(httpStatus.CREATED).send(customer);
});

const updateCustomer = catchAsync(async (req, res) => {
  const customer = await stripeService.updateCustomer(req.user, req.body);
  res.send(customer);
});

const deleteCustomer = catchAsync(async (req, res) => {
  await stripeService.deleteCustomer(req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

const createPaymentIntent = catchAsync(async (req, res) => {
  const paymentIntent = await stripeService.createPaymentIntent(req.user, req.body);
  res.status(httpStatus.CREATED).send(paymentIntent);
});

const getPayments = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await stripeService.queryPayments(filter, options);
  res.send(result);
});

const getPayment = catchAsync(async (req, res) => {
  const payment = await stripeService.getPaymentIntent(req.params.paymentId, req.user.id);
  res.send(payment);
});

const createRefund = catchAsync(async (req, res) => {
  const refund = await stripeService.createRefund(req.params.paymentId, req.user.id, req.body);
  res.status(httpStatus.CREATED).send(refund);
});

const createCheckoutSession = catchAsync(async (req, res) => {
  const session = await stripeService.createCheckoutSession(req.user, req.body);
  res.status(httpStatus.CREATED).send(session);
});

const createSubscription = catchAsync(async (req, res) => {
  const subscription = await stripeService.createSubscription(req.user, req.body);
  res.status(httpStatus.CREATED).send(subscription);
});

const getSubscriptions = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await stripeService.querySubscriptions(filter, options);
  res.send(result);
});

const getSubscription = catchAsync(async (req, res) => {
  const subscription = await stripeService.getSubscription(req.params.subscriptionId, req.user.id);
  res.send(subscription);
});

const updateSubscription = catchAsync(async (req, res) => {
  const subscription = await stripeService.updateSubscription(req.params.subscriptionId, req.user.id, req.body);
  res.send(subscription);
});

const cancelSubscription = catchAsync(async (req, res) => {
  const subscription = await stripeService.cancelSubscription(req.params.subscriptionId, req.user.id);
  res.send(subscription);
});

const listInvoices = catchAsync(async (req, res) => {
  const result = await stripeService.listInvoices(req.user, req.query);
  res.send(result);
});

const getInvoice = catchAsync(async (req, res) => {
  const invoice = await stripeService.getInvoice(req.params.invoiceId);
  res.send(invoice);
});

const createPortalSession = catchAsync(async (req, res) => {
  const session = await stripeService.createPortalSession(req.user, req.body);
  res.status(httpStatus.CREATED).send(session);
});

const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = webhookService.constructEvent(req.body, sig);
    await webhookService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    res.status(httpStatus.BAD_REQUEST).send({ error: err.message });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createPaymentIntent,
  getPayments,
  getPayment,
  createRefund,
  createCheckoutSession,
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  listInvoices,
  getInvoice,
  createPortalSession,
  handleWebhook,
};
