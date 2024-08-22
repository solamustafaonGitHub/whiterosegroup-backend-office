import mongoose, { Schema } from 'mongoose';
const PaymentClassSchema = new Schema({
    paymentClassName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const PaymentClass = mongoose.model('paymentclasses', PaymentClassSchema);
export { PaymentClass };
