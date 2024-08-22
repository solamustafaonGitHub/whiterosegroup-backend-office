import { model, Schema } from 'mongoose';
export const subscriptionTypeSchema = new Schema({
    subscTypeName: {
        type: String,
        unique: [true, 'subscriptionType name must be unique'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
});
export const SubscriptionType = model('subscriptiontypes', subscriptionTypeSchema);
