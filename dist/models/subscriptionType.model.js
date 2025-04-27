import mongoose, { Schema } from 'mongoose';
;
const subscriptionTypeSchema = new Schema({
    subscTypeName: { type: String, unique: true, required: true },
    subscTypeDesc: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const SubscriptionType = mongoose.model('SubscriptionType', subscriptionTypeSchema);
export { SubscriptionType };
