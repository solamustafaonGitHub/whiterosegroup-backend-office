import mongoose, { Schema } from 'mongoose';
import { generateCombinedRemittanceShortId } from '../utils/generateCombinedRemittanceShortId.utils.js';
import { StandardPurchaseOrder } from './standardPurchaseOrder.model.js';
import { EventEmitter } from 'events';
const eventBus = new EventEmitter();
;
;
const RemittanceStandardPOSchema = new Schema({
    remittanceReferenceStandardPOID: { type: String, default: generateCombinedRemittanceShortId, unique: true },
    remittanceForWhichStandardPORefID: { type: Schema.Types.ObjectId, ref: 'StandardPurchaseOrder', required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    remittanceDate: { type: Date, default: Date.now, required: true },
    remittanceForWhichStandardPurchaseOrderID: { type: String },
    remittanceForWhichActiveSubscriberID: { type: String },
    remittanceActiveUserFullName: { type: String },
    remittancePOPhoneNo: { type: String },
    remittanceByUserEmailAddress: { type: String },
    remittanceAmount_CR: { type: Number, required: true },
    remittanceDueBalance: { type: Number },
    remittancePaymentRefClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    remittancePaymentClass: { type: String },
    remittanceOnStandardPORemarks: { type: String, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
RemittanceStandardPOSchema.pre('save', function (next) {
    if (!this.remittanceReferenceStandardPOID || this.remittanceReferenceStandardPOID.trim() === '') {
        return next(new Error('Please ensure a valid Remittance Reference ID is generated for Standard PO Remittance'));
    }
    next();
});
RemittanceStandardPOSchema.pre('save', async function (next) {
    try {
        if (!this.remittanceForWhichStandardPORefID)
            return next();
        const standardPO = await StandardPurchaseOrder.findById(this.remittanceForWhichStandardPORefID).lean().exec();
        if (!standardPO)
            return next(new Error("Standard Purchase Order not found."));
        const items = standardPO.StandardPurchaseOrderItems || [];
        if (items.length === 0)
            return next(new Error("No purchase order items found."));
        const itemBalances = {};
        for (const item of items) {
            const intentID = item.standardPurchaseOrderIntentID;
            const lastBalanceEntry = item.StandardPurchaseOrderCumulativeBalance?.slice(-1)[0];
            itemBalances[intentID] = lastBalanceEntry?.cumulativeBalance ?? 0;
        }
        let remainingPayment = this.remittanceAmount_CR;
        let arrayFilterIndex = 0;
        const updateOps = {
            $push: {
                TotalRemittanceMadeSoFarOnStandardPO: {
                    remittedDateOnStandardPO: this.createdAt,
                    remittedAmountOnStandardPO: this.remittanceAmount_CR,
                    TotalPaymentsMadeSoFarOnStandardPO: ((standardPO.TotalRemittanceMadeSoFarOnStandardPO || []).reduce((acc, rem) => acc + (rem?.remittedAmountOnStandardPO || 0), 0) + this.remittanceAmount_CR).toFixed(2),
                    remitDateOnStandardPO: '',
                    remittedRemarksOnStandardPO: this.remittanceOnStandardPORemarks || ''
                }
            }
        };
        const arrayFilters = [];
        for (const item of items) {
            const intentID = item.standardPurchaseOrderIntentID;
            const balance = itemBalances[intentID];
            if (balance <= 0)
                continue;
            const amountToApply = Math.min(balance, remainingPayment);
            const newBalance = balance - amountToApply;
            const filterKey = `item${arrayFilterIndex}`;
            updateOps.$push[`StandardPurchaseOrderItems.$[${filterKey}].StandardPurchaseOrderCumulativeBalance`] = { cumulativeBalance: newBalance };
            arrayFilters.push({ [`${filterKey}.standardPurchaseOrderIntentID`]: intentID });
            remainingPayment -= amountToApply;
            arrayFilterIndex++;
            if (remainingPayment <= 0)
                break;
        }
        if (remainingPayment > 0) {
            return next(new Error(`Overpayment Detected. Max allowed remittance is ${this.remittanceAmount_CR - remainingPayment}`));
        }
        await StandardPurchaseOrder.updateOne({ _id: this.remittanceForWhichStandardPORefID }, updateOps, { arrayFilters });
        this.remittanceForWhichStandardPurchaseOrderID = standardPO.standardPurchaseOrderId;
        this.remittanceForWhichActiveSubscriberID = standardPO.standardPOrderForActiveSubscriberID;
        this.remittanceActiveUserFullName = standardPO.standardPOrderUserProfileFullName;
        this.remittancePOPhoneNo = standardPO.standardPOrderUserProfilePhoneNo;
        next();
    }
    catch (error) {
        next(error);
    }
});
RemittanceStandardPOSchema.pre('save', function (next) {
    this.createdAt = new Date(this.createdAt);
    this.remittanceDate = new Date(this.remittanceDate);
    this.lastUpdatedAt = new Date(this.lastUpdatedAt);
    next();
});
const RemittanceOnStandardPO = mongoose.model('RemittanceOnStandardPO', RemittanceStandardPOSchema);
export { RemittanceOnStandardPO };
