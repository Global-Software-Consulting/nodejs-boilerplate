const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../utils/plugins');

const messageSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
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
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received'],
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
    segments: {
      type: Number,
      default: 1,
    },
    price: {
      type: String,
    },
    errorCode: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true },
);

messageSchema.plugin(toJSON);
messageSchema.plugin(paginate);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
