const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../utils/plugins');

const whatsappMessageSchema = mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
    mediaUrl: [String],
    mediaContentType: [String],
    messageType: {
      type: String,
      enum: ['text', 'media', 'template'],
      required: true,
    },
    templateName: {
      type: String,
    },
    templateVariables: [String],
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'delivered', 'read', 'undelivered', 'failed', 'received'],
      default: 'queued',
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true,
    },
    sid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    conversationId: {
      type: String,
      index: true,
    },
    errorCode: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  { timestamps: true },
);

whatsappMessageSchema.plugin(toJSON);
whatsappMessageSchema.plugin(paginate);

const WhatsAppMessage = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', whatsappMessageSchema);

module.exports = WhatsAppMessage;
