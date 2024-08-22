import mongoose, { Schema } from 'mongoose';
function generateShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
const paymentTransactionSchema = new Schema({
    paymentTransactionReference: { type: String, default: generateShortId, unique: true },
    paymentTransactionDate: { type: Date },
    paymentTransactionPurchaseOrderID: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    paymentTransactionPaymentClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    paymentTransactionAmount: { type: Number, required: true },
    paymentTransactionRemarks: { type: String },
    paymentTransactionType: { type: String, enum: ['DR', 'CR'] },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
export const PaymentTransaction = mongoose.model('paymenttransactions', paymentTransactionSchema);
