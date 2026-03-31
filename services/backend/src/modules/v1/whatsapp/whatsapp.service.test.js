const { ApiError } = require('../../../utils');

// Mock Twilio client
const mockTwilioClient = {
  messages: { create: jest.fn() },
};
jest.mock('twilio', () => jest.fn(() => mockTwilioClient));

// Mock repositories
const mockUserRepo = { findOne: jest.fn() };
jest.mock('../../../repositories', () => ({
  getUserRepository: () => mockUserRepo,
}));

// Mock Mongoose model
const mockWhatsAppMessage = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn(),
  paginate: jest.fn(),
  aggregate: jest.fn(),
};
jest.mock('./whatsapp.model', () => mockWhatsAppMessage);

const whatsappService = require('./whatsapp.service');

describe('WhatsApp Service', () => {
  afterEach(() => jest.clearAllMocks());

  describe('generateConversationId', () => {
    test('should generate consistent ID regardless of argument order', () => {
      const id1 = whatsappService.generateConversationId('+111', '+222');
      const id2 = whatsappService.generateConversationId('+222', '+111');
      expect(id1).toBe(id2);
    });

    test('should sort numbers to create the ID', () => {
      const id = whatsappService.generateConversationId('+222', '+111');
      expect(id).toBe('+111_+222');
    });
  });

  describe('sendTextMessage', () => {
    test('should send WhatsApp text and create message record', async () => {
      const twilioMsg = { sid: 'WA123', status: 'queued' };
      const savedMsg = { id: 'msg1', sid: 'WA123' };
      mockTwilioClient.messages.create.mockResolvedValue(twilioMsg);
      mockWhatsAppMessage.create.mockResolvedValue(savedMsg);

      const result = await whatsappService.sendTextMessage('user123', { to: '+1234567890', body: 'Hello' });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Hello',
          to: 'whatsapp:+1234567890',
        }),
      );
      expect(mockWhatsAppMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user123',
          messageType: 'text',
          direction: 'outbound',
          sid: 'WA123',
        }),
      );
      expect(result).toEqual(savedMsg);
    });
  });

  describe('handleIncomingMessage', () => {
    test('should create inbound message and associate with user if found', async () => {
      const inbound = {
        From: 'whatsapp:+1111',
        To: 'whatsapp:+2222',
        Body: 'Hi',
        MessageSid: 'WA456',
        NumMedia: '0',
      };
      const user = { id: 'user456' };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockWhatsAppMessage.findOneAndUpdate.mockResolvedValue({ sid: 'WA456', user: 'user456' });

      await whatsappService.handleIncomingMessage(inbound);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ phone: '+2222' });
      expect(mockWhatsAppMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'WA456' },
        expect.objectContaining({
          user: 'user456',
          direction: 'inbound',
          status: 'received',
          from: '+1111',
          to: '+2222',
        }),
        { upsert: true, new: true },
      );
    });

    test('should handle media messages', async () => {
      const inbound = {
        From: 'whatsapp:+1111',
        To: 'whatsapp:+2222',
        Body: '',
        MessageSid: 'WA789',
        NumMedia: '1',
        MediaUrl0: 'https://example.com/image.jpg',
        MediaContentType0: 'image/jpeg',
      };
      mockUserRepo.findOne.mockResolvedValue(null);
      mockWhatsAppMessage.findOneAndUpdate.mockResolvedValue({ sid: 'WA789' });

      await whatsappService.handleIncomingMessage(inbound);

      expect(mockWhatsAppMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'WA789' },
        expect.objectContaining({
          messageType: 'media',
          mediaUrl: ['https://example.com/image.jpg'],
          mediaContentType: ['image/jpeg'],
        }),
        { upsert: true, new: true },
      );
    });

    test('should create message without user if no phone match', async () => {
      const inbound = {
        From: 'whatsapp:+1111',
        To: 'whatsapp:+2222',
        Body: 'Test',
        MessageSid: 'WA999',
        NumMedia: '0',
      };
      mockUserRepo.findOne.mockResolvedValue(null);
      mockWhatsAppMessage.findOneAndUpdate.mockResolvedValue({ sid: 'WA999' });

      await whatsappService.handleIncomingMessage(inbound);

      expect(mockWhatsAppMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'WA999' },
        expect.not.objectContaining({ user: expect.anything() }),
        { upsert: true, new: true },
      );
    });
  });

  describe('getMessageById', () => {
    test('should return message if found for user', async () => {
      const message = { id: 'msg1', user: 'user123' };
      mockWhatsAppMessage.findOne.mockResolvedValue(message);

      const result = await whatsappService.getMessageById('msg1', 'user123');

      expect(mockWhatsAppMessage.findOne).toHaveBeenCalledWith({ _id: 'msg1', user: 'user123' });
      expect(result).toEqual(message);
    });

    test('should throw 404 if message not found', async () => {
      mockWhatsAppMessage.findOne.mockResolvedValue(null);

      await expect(whatsappService.getMessageById('msg1', 'user123')).rejects.toThrow(ApiError);
    });
  });

  describe('getConversation', () => {
    test('should return messages for a conversation', async () => {
      const messages = [{ id: '1' }, { id: '2' }];
      mockWhatsAppMessage.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(messages) });

      const result = await whatsappService.getConversation('conv123', 'user123');

      expect(mockWhatsAppMessage.find).toHaveBeenCalledWith({ conversationId: 'conv123', user: 'user123' });
      expect(result).toEqual(messages);
    });

    test('should throw 404 if no messages in conversation', async () => {
      mockWhatsAppMessage.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await expect(whatsappService.getConversation('conv123', 'user123')).rejects.toThrow(ApiError);
    });
  });

  describe('handleStatusCallback', () => {
    test('should update message status', async () => {
      mockWhatsAppMessage.findOneAndUpdate.mockResolvedValue({});

      await whatsappService.handleStatusCallback({ MessageSid: 'WA123', MessageStatus: 'delivered' });

      expect(mockWhatsAppMessage.findOneAndUpdate).toHaveBeenCalledWith(
        { sid: 'WA123' },
        { status: 'delivered' },
        { new: true },
      );
    });
  });
});
