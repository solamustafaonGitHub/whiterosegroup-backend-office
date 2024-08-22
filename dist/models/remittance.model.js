import mongoose, { Schema } from 'mongoose';
import { PurchaseOrder } from './purchaseOrder.model.js';
import { PaymentClass } from './paymentClass.model.js';
function generateRemittanceShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
console.log(generateRemittanceShortId());
;
const remittanceSchema = new Schema({
    remittanceForWhichPurchaseOrderRefID: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    createdAt: { type: Date },
    remittanceDate: Date,
    remittanceReferenceID: { type: String, default: generateRemittanceShortId, unique: true },
    remittanceForWhichPurchaseOrderID: { type: String },
    remittanceForWhichActiveUserID: { type: String },
    remittanceActiveUserFullName: { type: String },
    remittancePOPhoneNo: { type: String },
    remittanceDueOpeningAmount: { type: Number },
    remittanceAmount_CR: { type: Number },
    remittanceDueBalance: { type: Number },
    remittancePaymentRefClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    remittancePaymentClass: { type: String },
    remittanceRemarks: { type: String },
    lastUpdatedAt: { type: Date },
});
remittanceSchema.pre('save', async function (next) {
    try {
        if (this.remittancePaymentRefClass) {
            const remitPaymentClass = await PaymentClass.findById(this.remittancePaymentRefClass);
            if (remitPaymentClass) {
                this.remittancePaymentClass = remitPaymentClass.paymentClassName;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
remittanceSchema.pre('save', async function (next) {
    try {
        if (this.remittanceForWhichPurchaseOrderRefID) {
            const purchaseOrder = await PurchaseOrder.findById(this.remittanceForWhichPurchaseOrderRefID).exec();
            if (purchaseOrder) {
                this.remittanceForWhichPurchaseOrderID = purchaseOrder.purchaseOrderId;
                this.remittanceForWhichActiveUserID = purchaseOrder.pOrderForActiveUserID;
                this.remittanceActiveUserFullName = purchaseOrder.pOrderUserProfileFullName;
                this.remittancePOPhoneNo = purchaseOrder.pOrderUserProfilePhoneNo;
                const initialOpeningBalance = -(purchaseOrder.PriceChangeOnPOHistoryDetails[0]?.newPriceAmountOnPO || 0);
                const isFirstRemittance = !purchaseOrder.remittanceUpdateDetails || purchaseOrder.remittanceUpdateDetails.length === 0;
                let openingBalance;
                if (isFirstRemittance) {
                    openingBalance = initialOpeningBalance;
                }
                else {
                    openingBalance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1].endingBalanceAfterLastRemittance;
                }
                this.remittanceDueOpeningAmount = openingBalance;
                console.log('Opening Balance:', openingBalance);
                let remittanceDueBalance;
                if (isFirstRemittance) {
                    remittanceDueBalance = openingBalance + this.remittanceAmount_CR;
                }
                else {
                    const previousRemittance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1];
                    remittanceDueBalance = previousRemittance.endingBalanceAfterLastRemittance + this.remittanceAmount_CR;
                }
                if (isNaN(remittanceDueBalance)) {
                    console.error('Error calculating remittanceDueBalance:', { openingBalance, thisRemittanceAmountCR: this.remittanceAmount_CR });
                    return next(new Error('Remittance due balance calculation error'));
                }
                this.remittanceDueBalance = remittanceDueBalance;
                console.log('Remittance Due Balance:', remittanceDueBalance);
                if (purchaseOrder.remittanceUpdateDetails && purchaseOrder.remittanceUpdateDetails.length > 0) {
                    const lastRemittance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1];
                    if (isFirstRemittance) {
                        lastRemittance.remittanceExpectedBalToBePaidOnPO = remittanceDueBalance;
                    }
                }
                if (!purchaseOrder.remittanceUpdateDetails) {
                    purchaseOrder.remittanceUpdateDetails = [];
                }
                purchaseOrder.remittanceUpdateDetails.push({
                    remitDateOnPO: this.remittanceDate,
                    remittanceExpectedBalToBePaidOnPO: openingBalance,
                    remittanceUpdateRemarksOnPO: `${this.remittancePaymentClass} || Remittance ID: ${this.remittanceReferenceID}`,
                    remittedAmountCROnPO: this.remittanceAmount_CR,
                    endingBalanceAfterLastRemittance: remittanceDueBalance,
                });
                await purchaseOrder.save();
            }
            else {
                console.error('Purchase Order not found for remittance: ', this.remittanceReferenceID);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const Remittance = mongoose.model('Remittance', remittanceSchema);
export { Remittance };
