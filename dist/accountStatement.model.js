import mongoose, { Schema } from 'mongoose';
import { PurchaseOrder } from './purchaseOrder.model.js';
import { PaymentTransaction } from './paymentTransaction.model.js';
const AccountStatementSchema = new Schema({
    accountNumber: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    accountStatPurchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    accountOpeningBalance: Number,
    acctStatPayTranReference: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction', required: true },
    accountStatTransactionPayment: Number,
    accountStatPaymentType: String,
    accountStatPaymentRemarks: String,
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.accountStatPurchaseOrder) {
            const acctOpeningBal = await PurchaseOrder.findById(this.accountStatPurchaseOrder).exec();
            if (acctOpeningBal) {
                this.accountOpeningBalance = acctOpeningBal.purchaseOrderIntentPrice;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.acctStatPayTranReference) {
            const pytInflow = await PaymentTransaction.findById(this.acctStatPayTranReference).exec();
            if (pytInflow) {
                this.accountStatTransactionPayment = pytInflow.paymentTransactionAmount;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.acctStatPayTranReference) {
            const pyttransactiontype = await PaymentTransaction.findById(this.acctStatPayTranReference).exec();
            if (pyttransactiontype) {
                this.accountStatPaymentType = pyttransactiontype.paymentTransactionType;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.acctStatPayTranReference) {
            const pytTransactionRemarks = await PaymentTransaction.findById(this.acctStatPayTranReference).exec();
            if (pytTransactionRemarks) {
                this.accountStatPaymentRemarks = pytTransactionRemarks.paymentTransactionRemarks;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const AccountStatement = mongoose.model('accountStatements', AccountStatementSchema);
export { AccountStatement };
