import mongoose, { Schema } from 'mongoose';
import { generateCombinedRemittanceShortId } from '../utils/generateCombinedRemittanceShortId.utils.js';
import { LayAwayPurchaseOrder } from './layAwayPurchaseOrder.model.js';
import { EventEmitter } from 'events';
const eventBus = new EventEmitter();
;
const RemittanceLayAwayPOSchema = new Schema({
    remittanceForWhichLayAwayPORefID: { type: Schema.Types.ObjectId, ref: 'LayAwayPurchaseOrder', required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    remittanceDate: { type: Date, default: Date.now, required: true },
    remittanceReferenceID: { type: String, default: generateCombinedRemittanceShortId, unique: true },
    remittanceForWhichLayAwayPurchaseOrderID: { type: String },
    remittanceForWhichActiveSubscriberID: { type: String },
    remittanceActiveUserFullName: { type: String },
    remittancePOPhoneNo: { type: String },
    remittanceAmount_CR: { type: Number, required: true },
    remittanceDueBalance: { type: Number },
    remittancePaymentRefClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    remittancePaymentClass: { type: String },
    remittanceOnLayWayPORemarks: { type: String, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
RemittanceLayAwayPOSchema.pre('save', function (next) {
    if (!this.remittanceReferenceID || this.remittanceReferenceID.trim() === '') {
        return next(new Error('Please ensure a valid Remittance Reference ID is generated for LayAway Remittance'));
    }
    next();
});
RemittanceLayAwayPOSchema.pre('save', async function (next) {
    try {
        if (this.remittanceForWhichLayAwayPORefID) {
            const layAwayPO = await LayAwayPurchaseOrder.findById(this.remittanceForWhichLayAwayPORefID).exec();
            if (layAwayPO) {
                this.remittanceForWhichLayAwayPurchaseOrderID = layAwayPO.layAwayPurchaseOrderId;
                this.remittanceForWhichActiveSubscriberID = layAwayPO.layAwayPOrderForActiveSubscriberID;
                this.remittanceActiveUserFullName = layAwayPO.layAwayPOrderUserProfileFullName;
                this.remittancePOPhoneNo = layAwayPO.layAwayPOrderUserProfilePhoneNo;
                let remittanceDueOpeningAmount = 0;
                let remittanceDueBalance = 0;
                let totalRemittanceMadeSoFar = 0;
                const lastRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0];
                remittanceDueOpeningAmount = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
                totalRemittanceMadeSoFar = (layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO.reduce((acc, curr) => acc + curr.remittedAmountOnLayAwayPO, 0) || 0);
                remittanceDueBalance = remittanceDueOpeningAmount + this.remittanceAmount_CR;
                totalRemittanceMadeSoFar += this.remittanceAmount_CR;
                const lastPriceReverseAlert = layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.slice(-1)[0];
                if (lastPriceReverseAlert) {
                    const priceChangeHandled = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.some((entry) => entry.remitDateOnLayAwayPO.getTime() === new Date(lastPriceReverseAlert.layAwayPurchaseOrderReverseDate).getTime() &&
                        entry.priceAdjustmentAppliedOnLayAwayPO === true);
                    if (new Date(lastPriceReverseAlert.layAwayPurchaseOrderReverseDate).getTime() > new Date(lastRemittance?.remitDateOnLayAwayPO).getTime() && !priceChangeHandled) {
                        const newEndingBalanceAfterLastRemittance = remittanceDueBalance + (lastPriceReverseAlert.layAwayPurchaseOrderReverseNewPriceAlert - lastPriceReverseAlert.layAwayPurchaseOrderReverseOldPrice);
                        const cappedEndingBalance = Math.min(0, newEndingBalanceAfterLastRemittance);
                        const newRemittanceEntry = {
                            remitDateOnLayAwayPO: lastPriceReverseAlert.layAwayPurchaseOrderReverseDate,
                            remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
                            remittanceUpdateRemarksOnLayAwayPO: `Balance Adjustment Due to Price Change: ${layAwayPO.layAwayPurchaseOrderIntentItemCode} || ${layAwayPO.layAwayPurchaseOrderIntentItemName}`,
                            remittedAmountCROnLayAwayPO: 0,
                            endingBalanceAfterLastRemittance: cappedEndingBalance,
                            priceAdjustmentApplied: true,
                            isRemittanceAfterPriceChange: true,
                            priceChangeOnLayAwayPODate: '',
                            isRemittanceAfterPriceChangeOnLayAwayPO: false,
                            priceAdjustmentAppliedOnLayAwayPO: false
                        };
                        layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push(newRemittanceEntry);
                    }
                    else {
                        const newEndingBalance = remittanceDueBalance;
                        if (newEndingBalance > 0) {
                            const requiredPayment = newEndingBalance;
                            return next(new Error(`Overpayment Detected. Please Remit Payment Less Than ${requiredPayment}`));
                        }
                        layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
                            remitDateOnLayAwayPO: this.createdAt,
                            remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
                            remittanceUpdateRemarksOnLayAwayPO: `Remittance for Lay Away Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
                            remittedAmountCROnLayAwayPO: this.remittanceAmount_CR,
                            endingBalanceAfterLastRemittanceOnLayAwayPO: Math.min(0, remittanceDueBalance),
                            priceAdjustmentAppliedOnLayAwayPO: false,
                            isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
                            priceChangeOnLayAwayPODate: ''
                        });
                    }
                }
                else {
                    const newEndingBalance = remittanceDueBalance;
                    if (newEndingBalance > 0) {
                        const requiredPayment = newEndingBalance;
                        return next(new Error(`Overpayment Detected. Please Remit Less Payment Less Than ${requiredPayment}`));
                    }
                    layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
                        remitDateOnLayAwayPO: this.createdAt,
                        remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
                        remittanceUpdateRemarksOnLayAwayPO: `Remittance For LayAway Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
                        remittedAmountCROnLayAwayPO: this.remittanceAmount_CR,
                        endingBalanceAfterLastRemittanceOnLayAwayPO: Math.min(0, remittanceDueBalance),
                        priceAdjustmentAppliedOnLayAwayPO: false,
                        isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
                        priceChangeOnLayAwayPODate: ''
                    });
                }
                layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO.push({
                    remittedDateOnLayAwayPO: this.createdAt,
                    remittedAmountOnLayAwayPO: this.remittanceAmount_CR,
                    remittedRemarksOnLayAwayPO: `Payment Received For LayAway Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
                    TotalPaymentsMadeSoFarOnLayAwayPO: totalRemittanceMadeSoFar.toFixed(2),
                    remitDateOnLayAwayPO: ''
                });
                await layAwayPO.save();
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
RemittanceLayAwayPOSchema.pre('save', function (next) {
    this.createdAt = new Date();
    this.remittanceDate = new Date();
    this.lastUpdatedAt = new Date();
    next();
});
const RemittanceOnLayAwayPO = mongoose.model('RemittanceOnLayAwayPO', RemittanceLayAwayPOSchema);
export { RemittanceOnLayAwayPO };
