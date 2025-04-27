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
        const lastItem = standardPO.StandardPurchaseOrderItems?.slice(-1)[0];
        const latestItemBalance = lastItem?.StandardPurchaseOrderCumulativeBalance?.slice(-1)[0]?.cumulativeBalance ?? 0;
        if (this.remittanceAmount_CR > latestItemBalance) {
            return next(new Error(`Overpayment Detected. Maximum allowed remittance is ${latestItemBalance}`));
        }
        const newEndingBalance = Math.max(0, latestItemBalance - this.remittanceAmount_CR);
        const newRemittanceEntry = {
            remittedDateOnStandardPO: this.createdAt,
            remittedAmountOnStandardPO: this.remittanceAmount_CR,
            TotalPaymentsMadeSoFarOnStandardPO: ((standardPO.TotalRemittanceMadeSoFarOnStandardPO || []).reduce((acc, rem) => acc + (rem?.remittedAmountOnStandardPO || 0), 0) + this.remittanceAmount_CR).toFixed(2),
            remitDateOnStandardPO: '',
            remittedRemarksOnStandardPO: this.remittanceOnStandardPORemarks || ''
        };
        const updateOps = {
            $push: {
                TotalRemittanceMadeSoFarOnStandardPO: newRemittanceEntry,
                "StandardPurchaseOrderItems.$[lastItem].StandardPurchaseOrderCumulativeBalance": {
                    cumulativeBalance: newEndingBalance
                }
            }
        };
        await StandardPurchaseOrder.updateOne({ _id: this.remittanceForWhichStandardPORefID }, updateOps, {
            arrayFilters: [{ "lastItem.standardPurchaseOrderIntentID": lastItem?.standardPurchaseOrderIntentID }]
        });
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
