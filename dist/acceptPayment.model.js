import mongoose, { Schema } from 'mongoose';
function generateShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
console.log(generateShortId());
const AcceptPaymentSchema = new Schema({
    acceptPaymentTransactionReference: { type: String, default: generateShortId, unique: true },
    acceptPaymentPurchaseOrderID: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    acceptPaymentClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    acceptPaymentAmount: { type: Number, required: true },
    acceptPaymentRemarks: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const AcceptPayment = mongoose.model('acceptPayments', AcceptPaymentSchema);
export { AcceptPayment };
