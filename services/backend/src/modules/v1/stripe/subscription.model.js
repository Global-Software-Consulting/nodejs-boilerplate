const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../utils/plugins');

const subscriptionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      index: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    stripeProductId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'paused'],
      default: 'incomplete',
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
  },
  { timestamps: true },
);

subscriptionSchema.plugin(toJSON);
subscriptionSchema.plugin(paginate);

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
