const { ApiError } = require('../../../utils');

// Mock Twilio client
const mockTwilioClient = {
  messages: { create: jest.fn() },
  calls: { create: jest.fn() },
  verify: { v2: { services: jest.fn() } },
};
jest.mock('twilio', () => jest.fn(() => mockTwilioClient));

// Mock repositories
const mockUserRepo = { findOne: jest.fn() };
jest.mock('../../../repositories', () => ({
  getUserRepository: () => mockUserRepo,
}));

// Mock Mongoose models
const mockMessage = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  paginate: jest.fn(),
};
jest.mock('./message.model', () => mockMessage);

const mockCall = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  paginate: jest.fn(),
};
jest.mock('./call.model', () => mockCall);

const twilioService = require('./twilio.service');

describe('Twilio Service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('sendSms', () => {
    test('should send SMS and create message record', async () => {
      const twilioMsg = { sid: 'SM123', status: 'queued', numSegments: '1' };
      const savedMsg = { id: 'msg123', ...twilioMsg };
      mockTwilioClient.messages.create.mockResolvedValue(twilioMsg);
      mockMessage.create.mockResolvedValue(savedMsg);

      const result = await twilioService.sendSms('user123', { to: '+1234567890', body: 'Hello' });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({ body: 'Hello', to: '+1234567890' }),
      );
      expect(mockMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user123',
          direction: 'outbound',
          sid: 'SM123',
        }),
      );
      expect(result).toEqual(savedMsg);
    });
  });

  describe('getMessageById', () => {
    test('should return message if found for user', async () => {
      const message = { id: 'msg123', user: 'user123' };
      mockMessage.findOne.mockResolvedValue(message);

      const result = await twilioService.getMessageById('msg123', 'user123');

      expect(mockMessage.findOne).toHaveBeenCalledWith({ _id: 'msg123', user: 'user123' });
      expect(result).toEqual(message);
    });

    test('should throw 404 if message not found', async () => {
      mockMessage.findOne.mockResolvedValue(null);

      await expect(twilioService.getMessageById('msg123', 'user123')).rejects.toThrow(ApiError);
    });
  });

  describe('handleIncomingSms', () => {
    test('should create inbound message and associate with user if found', async () => {
      const inboundData = { From: '+1111', To: '+2222', Body: 'Hi', MessageSid: 'SM456', NumSegments: '1' };
      const user = { id: 'user456' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockMessage.findOneAndUpdate.mockResolvedValue({ sid: 'SM456', user: 'user456' });

      await twilioService.handleIncomingSms(inboundData);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ phone: '+2222' });
      expect(mockMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'SM456' },
        expect.objectContaining({
          user: 'user456',
          direction: 'inbound',
          status: 'received',
        }),
        { upsert: true, new: true },
      );
    });

    test('should create inbound message without user if no match', async () => {
      const inboundData = { From: '+1111', To: '+2222', Body: 'Hi', MessageSid: 'SM789' };
      mockUserRepo.findOne.mockResolvedValue(null);
      mockMessage.findOneAndUpdate.mockResolvedValue({ sid: 'SM789' });

      await twilioService.handleIncomingSms(inboundData);

      expect(mockMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'SM789' },
        expect.not.objectContaining({ user: expect.anything() }),
        { upsert: true, new: true },
      );
    });
  });

  describe('handleIncomingCall', () => {
    test('should create inbound call and associate with user if found', async () => {
      const callData = { From: '+1111', To: '+2222', CallSid: 'CA123' };
      const user = { id: 'user789' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockCall.findOneAndUpdate.mockResolvedValue({ sid: 'CA123' });

      await twilioService.handleIncomingCall(callData);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ phone: '+2222' });
      expect(mockCall.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'CA123' },
        expect.objectContaining({ user: 'user789', direction: 'inbound' }),
        { upsert: true, new: true },
      );
    });
  });

  describe('getCallById', () => {
    test('should return call if found for user', async () => {
      const call = { id: 'call123', user: 'user123' };
      mockCall.findOne.mockResolvedValue(call);

      const result = await twilioService.getCallById('call123', 'user123');

      expect(result).toEqual(call);
    });

    test('should throw 404 if call not found', async () => {
      mockCall.findOne.mockResolvedValue(null);

      await expect(twilioService.getCallById('call123', 'user123')).rejects.toThrow(ApiError);
    });
  });

  describe('updateMessageStatus', () => {
    test('should update message status by SID', async () => {
      mockMessage.findOneAndUpdate.mockResolvedValue({});

      await twilioService.updateMessageStatus({
        MessageSid: 'SM123',
        MessageStatus: 'delivered',
      });

      expect(mockMessage.findOneAndUpdate).toHaveBeenCalledWith({ sid: 'SM123' }, { status: 'delivered' }, { new: true });
    });

    test('should include error details when present', async () => {
      mockMessage.findOneAndUpdate.mockResolvedValue({});

      await twilioService.updateMessageStatus({
        MessageSid: 'SM123',
        MessageStatus: 'failed',
        ErrorCode: '30001',
        ErrorMessage: 'Queue overflow',
      });

      expect(mockMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'SM123' },
        { status: 'failed', errorCode: 30001, errorMessage: 'Queue overflow' },
        { new: true },
      );
    });
  });
});
