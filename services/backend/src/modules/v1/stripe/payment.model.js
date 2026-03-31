const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../utils/plugins');

const paymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ['one_time', 'checkout'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'succeeded',
        'failed',
        'canceled',
        'refunded',
        'partially_refunded',
      ],
      default: 'requires_payment_method',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    stripeRefundIds: [String],
    failureReason: {
      type: String,
    },
  },
  { timestamps: true },
);

paymentSchema.plugin(toJSON);
paymentSchema.plugin(paginate);

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
