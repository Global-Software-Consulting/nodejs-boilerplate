const httpStatus = require('http-status');
const { ApiError } = require('../../../utils');

// Mock Stripe
const mockStripe = {
  customers: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
  },
  invoices: {
    retrieve: jest.fn(),
    list: jest.fn(),
  },
  paymentIntents: { create: jest.fn() },
  refunds: { create: jest.fn() },
  subscriptions: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn(), cancel: jest.fn() },
  checkout: { sessions: { create: jest.fn() } },
  billingPortal: { sessions: { create: jest.fn() } },
};
jest.mock('stripe', () => jest.fn(() => mockStripe));

// Mock repositories
const mockUserRepo = { updateById: jest.fn() };
jest.mock('../../../repositories', () => ({
  getUserRepository: () => mockUserRepo,
}));

// Mock Mongoose models
jest.mock('./payment.model', () => {
  const mock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    paginate: jest.fn(),
  };
  return mock;
});

jest.mock('./subscription.model', () => {
  const mock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    paginate: jest.fn(),
  };
  return mock;
});

const stripeService = require('./stripe.service');
const Payment = require('./payment.model');

describe('Stripe Service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createCustomer', () => {
    test('should create a Stripe customer and update user record', async () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test User' };
      const customer = { id: 'cus_123' };
      mockStripe.customers.create.mockResolvedValue(customer);

      const result = await stripeService.createCustomer(user);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      expect(mockUserRepo.updateById).toHaveBeenCalledWith(user.id, { stripeCustomerId: 'cus_123' });
      expect(result).toEqual(customer);
    });
  });

  describe('getOrCreateCustomer', () => {
    test('should retrieve existing customer if stripeCustomerId exists', async () => {
      const user = { stripeCustomerId: 'cus_existing' };
      const customer = { id: 'cus_existing' };
      mockStripe.customers.retrieve.mockResolvedValue(customer);

      const result = await stripeService.getOrCreateCustomer(user);

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_existing');
      expect(result).toEqual(customer);
    });

    test('should create new customer if no stripeCustomerId', async () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test' };
      const customer = { id: 'cus_new' };
      mockStripe.customers.create.mockResolvedValue(customer);

      const result = await stripeService.getOrCreateCustomer(user);

      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(result).toEqual(customer);
    });
  });

  describe('getInvoice', () => {
    test('should return invoice if it belongs to the user', async () => {
      const user = { stripeCustomerId: 'cus_123' };
      const invoice = { id: 'inv_123', customer: 'cus_123' };
      mockStripe.invoices.retrieve.mockResolvedValue(invoice);

      const result = await stripeService.getInvoice('inv_123', user);

      expect(result).toEqual(invoice);
    });

    test('should throw 404 if invoice belongs to different customer', async () => {
      const user = { stripeCustomerId: 'cus_123' };
      const invoice = { id: 'inv_123', customer: 'cus_other' };
      mockStripe.invoices.retrieve.mockResolvedValue(invoice);

      await expect(stripeService.getInvoice('inv_123', user)).rejects.toThrow(ApiError);
      await expect(stripeService.getInvoice('inv_123', user)).rejects.toMatchObject({
        statusCode: httpStatus.NOT_FOUND,
      });
    });

    test('should throw 404 if user has no stripeCustomerId', async () => {
      const user = {};

      await expect(stripeService.getInvoice('inv_123', user)).rejects.toThrow(ApiError);
    });
  });

  describe('getPaymentIntent', () => {
    test('should return payment if found for user', async () => {
      const payment = { id: 'pay_123', user: 'user123' };
      Payment.findOne.mockResolvedValue(payment);

      const result = await stripeService.getPaymentIntent('pay_123', 'user123');

      expect(Payment.findOne).toHaveBeenCalledWith({ _id: 'pay_123', user: 'user123' });
      expect(result).toEqual(payment);
    });

    test('should throw 404 if payment not found for user', async () => {
      Payment.findOne.mockResolvedValue(null);

      await expect(stripeService.getPaymentIntent('pay_123', 'user123')).rejects.toThrow(ApiError);
    });
  });

  describe('listInvoices', () => {
    test('should return empty if user has no stripeCustomerId', async () => {
      const result = await stripeService.listInvoices({}, { limit: 10 });

      expect(result).toEqual({ data: [], has_more: false });
      expect(mockStripe.invoices.list).not.toHaveBeenCalled();
    });

    test('should list invoices for user with stripeCustomerId', async () => {
      const invoices = { data: [{ id: 'inv_1' }], has_more: false };
      mockStripe.invoices.list.mockResolvedValue(invoices);

      const result = await stripeService.listInvoices({ stripeCustomerId: 'cus_123' }, { limit: 5 });

      expect(mockStripe.invoices.list).toHaveBeenCalledWith({ customer: 'cus_123', limit: 5 });
      expect(result).toEqual(invoices);
    });
  });

  describe('deleteCustomer', () => {
    test('should throw if user has no stripeCustomerId', async () => {
      await expect(stripeService.deleteCustomer({})).rejects.toThrow(ApiError);
    });

    test('should delete customer and clear stripeCustomerId', async () => {
      const user = { id: 'user123', stripeCustomerId: 'cus_123' };
      mockStripe.customers.del.mockResolvedValue({});

      await stripeService.deleteCustomer(user);

      expect(mockStripe.customers.del).toHaveBeenCalledWith('cus_123');
      expect(mockUserRepo.updateById).toHaveBeenCalledWith('user123', { stripeCustomerId: null });
    });
  });
});
