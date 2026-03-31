const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../utils/plugins');

const callSchema = mongoose.Schema(
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
    status: {
      type: String,
      enum: ['queued', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'canceled', 'failed'],
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
    duration: {
      type: Number,
    },
    price: {
      type: String,
    },
    twimlUrl: {
      type: String,
    },
    recordingUrl: {
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

callSchema.plugin(toJSON);
callSchema.plugin(paginate);

const Call = mongoose.models.Call || mongoose.model('Call', callSchema);

module.exports = Call;
