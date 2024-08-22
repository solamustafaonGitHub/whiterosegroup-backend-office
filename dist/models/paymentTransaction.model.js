import mongoose, { Schema } from 'mongoose';
import { PurchaseOrder } from './purchaseOrder.model.js';
function generatePytTransactionShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
const paymentTransactionSchema = new Schema({
    paymentTransactionDate: { type: Date },
    paymentTransactionPurchaseOrderID: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    purchaseOrderPrice: { type: String },
    paymentTransactionPaymentClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    paymentTransactionAmount: { type: Number, required: true },
    paymentTransactionType: { type: String, enum: ['DR', 'CR'] },
    paymentTransactionRemarks: { type: String },
    purchaseOrderBalAmount: String,
    paymentTransactionReferenceID: { type: String, default: generatePytTransactionShortId, unique: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
paymentTransactionSchema.pre('save', async function (next) {
    try {
        if (this.paymentTransactionPurchaseOrderID) {
            const poprice = await PurchaseOrder.findById(this.paymentTransactionPurchaseOrderID).exec();
            if (poprice) {
                this.purchaseOrderPrice = poprice.purchaseOrderIntentPrice;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
paymentTransactionSchema.pre('save', async function (next) {
    const originalPurchaseOrderPrice = this.purchaseOrderPrice ? parseFloat(this.purchaseOrderPrice) : 0;
    let remainingBalance = originalPurchaseOrderPrice;
    const previousPayments = await PaymentTransaction.find({ paymentTransactionPurchaseOrderID: this.paymentTransactionPurchaseOrderID });
    for (const payment of previousPayments) {
        remainingBalance -= payment.paymentTransactionAmount || 0;
    }
    const paymentTransactionAmount = this.paymentTransactionAmount || 0;
    this.purchaseOrderBalAmount = (remainingBalance - paymentTransactionAmount).toString();
    next();
});
const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
export { PaymentTransaction };
