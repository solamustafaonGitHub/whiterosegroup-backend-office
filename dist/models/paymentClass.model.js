import mongoose, { Schema } from 'mongoose';
const PaymentClassSchema = new Schema({
    paymentClassName: { type: String, required: true },
    paymentClassDesc: String,
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const PaymentClass = mongoose.model('PaymentClass', PaymentClassSchema);
export { PaymentClass };
