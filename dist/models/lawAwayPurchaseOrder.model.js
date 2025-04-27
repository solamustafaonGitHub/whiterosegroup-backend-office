import mongoose, { Schema } from 'mongoose';
import generateCombinedPOShortId from '../utils/generateCombinedPOShortId.util.js';
import { SubscriptionType } from './subscriptionType.model.js';
import { ItemInformation } from './itemInformation.model.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
import { ActiveSubscriber } from './activeSubscriber.model.js';
;
;
;
;
;
const LayAwayPurchaseOrderSchema = new Schema({
    layAwayPurchaseOrderId: { type: String, default: generateCombinedPOShortId, unique: true },
    layAwayPOrderForActiveUserRefID: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
    layAwayPOrderForActiveUserID: { type: String },
    layAwayPOrderUserProfileFullName: { type: String },
    layAwayPOrderUserProfilePhoneNo: { type: String },
    layAwayPOrderUserProfileEmail: { type: String },
    layAwayPOrderUserDeliveryAddress: { type: String },
    layAwayPurchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    layAwayPurchaseOrderIntentID: { type: String },
    layAwayPurchaseOrderIntentItemCode: { type: String },
    layAwayPurchaseOrderIntentItemName: { type: String },
    layAwayPurchaseOrderIntentDesc: { type: String },
    layAwayPurchaseOrderNoOfUnitBought: { type: Number, required: true },
    layAwayPurchaseOrderUnitOfMeasure: { type: Schema.Types.ObjectId, ref: 'UnitOfMeasure', required: true },
    layAwayPurchaseOrderUnitPrice: { type: Number },
    layAwayPurchaseOrderTotalStartPrice: { type: Number },
    layAwayPurchaseOrderAssetSubscTypeRefID: { type: Schema.Types.ObjectId, ref: 'SubscriptionType', required: true },
    layAwayPurchaseOrderAssetSubscType: { type: String },
    layAwayPurchaseOrderNewPriceAlert: { type: Number },
    PriceChangeOnLayAwayPOHistoryDetails: [{
            priceChangeOnLayAwayPODate: { type: Date, default: Date.now },
            priceChangeOnLayAwayPORemarks: { type: String },
            newPriceAmountOnLayAwayPO: { type: Number },
            priceAdjustmentAppliedOnLayAwayPO: { type: Boolean, default: false }
        }],
    PriceReverseAlertDetailsOnLayAwayPO: [{
            layAwayPurchaseOrderReverseOldPrice: { type: Number },
            layAwayPurchaseOrderReversalID: { type: String, default: generateCombinedPOShortId },
            layAwayPurchaseOrderReverseDate: { type: Date, default: Date.now },
            layAwayPurchaseOrderReverseNewPriceAlertRemarks: { type: String },
            layAwayPurchaseOrderReverseNewPriceAlert: { type: Number }
        }],
    TotalRemittanceMadeSoFarOnLayAwayPO: [{
            remitDateOnLayAwayPO: { type: Date, default: Date.now },
            remittedDateOnLayAwayPO: { type: Date },
            remittedAmountOnLayAwayPO: { type: Number },
            remittedRemarksOnLayAwayPO: { type: String },
            TotalPaymentsMadeSoFarOnLayAwayPO: { type: String }
        }],
    RemittanceBalanceToBePaidDetailsOnLayAwayPO: [{
            priceChangeOnLayAwayPODate: { type: Date, default: Date.now },
            isRemittanceAfterPriceChangeOnLayAwayPO: { type: Boolean },
            remitDateOnLayAwayPO: { type: Date },
            remittanceExpectedBalToBePaidOnLayAwayPO: { type: Number },
            remittanceUpdateRemarksOnLayAwayPO: { type: String },
            remittedAmountCROnLayAwayPO: { type: Number },
            endingBalanceAfterLastRemittanceOnLayAwayPO: { type: Number },
            priceAdjustmentAppliedOnLayAwayPO: { type: Boolean }
        }],
    lastUpdatedAt: { type: Date, default: Date.now }
});
LayAwayPurchaseOrderSchema.pre('save', function (next) {
    if (!this.layAwayPurchaseOrderId || this.layAwayPurchaseOrderId.trim() === '') {
        return next(new Error('Lay Away Purchase Order ID is required. Please ensure a valid Lay Away Purchase Order ID is generated'));
    }
    next();
});
LayAwayPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.layAwayPOrderForActiveUserRefID) {
            const userProfile = await ActiveSubscriber.findById(this.layAwayPOrderForActiveUserRefID).exec();
            if (userProfile) {
                this.layAwayPOrderForActiveUserID = userProfile.activeSubscriberID.toString();
                this.layAwayPOrderUserProfileFullName = userProfile.activeSubscriberFirstName + ' ' + userProfile.activeSubscriberMiddleName + ' ' + userProfile.activeSubscriberLastName;
                this.layAwayPOrderUserProfilePhoneNo = userProfile.activeSubscriberPhoneNo;
                this.layAwayPOrderUserProfileEmail = userProfile.activeSubscriberEmail;
                this.layAwayPOrderUserDeliveryAddress = userProfile.activeSubscriberAssetDeliveryAddress;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
LayAwayPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.layAwayPurchaseOrderIntent) {
            const itemDetails = await ItemInformation.findById(this.layAwayPurchaseOrderIntent);
            if (itemDetails) {
                this.layAwayPurchaseOrderIntentID = itemDetails.itemInformationID;
                this.layAwayPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
                this.layAwayPurchaseOrderIntentItemName = itemDetails.itemInformationName;
                this.layAwayPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
                if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                    const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
                    this.layAwayPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
                }
                this.layAwayPurchaseOrderUnitPrice = this.layAwayPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                this.layAwayPurchaseOrderTotalStartPrice = this.layAwayPurchaseOrderNoOfUnitBought * this.layAwayPurchaseOrderUnitPrice;
            }
            next();
        }
    }
    catch (error) {
        next(error);
    }
});
LayAwayPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.layAwayPurchaseOrderAssetSubscTypeRefID) {
            const subscriptionDetails = await SubscriptionType.findById(this.layAwayPurchaseOrderAssetSubscTypeRefID);
            if (subscriptionDetails) {
                this.layAwayPurchaseOrderAssetSubscType = subscriptionDetails.subscTypeName;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
LayAwayPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.layAwayPurchaseOrderIntent) {
            const itemDetails = await ItemInformation.findById(this.layAwayPurchaseOrderIntent);
            if (itemDetails) {
                this.layAwayPurchaseOrderIntentID = itemDetails.itemInformationID;
                this.layAwayPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
                this.layAwayPurchaseOrderIntentItemName = itemDetails.itemInformationName;
                this.layAwayPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
                this.layAwayPurchaseOrderUnitPrice = this.layAwayPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                this.layAwayPurchaseOrderTotalStartPrice = this.layAwayPurchaseOrderNoOfUnitBought * this.layAwayPurchaseOrderUnitPrice;
            }
            if (this.PriceChangeOnLayAwayPOHistoryDetails.length === 0) {
                this.PriceChangeOnLayAwayPOHistoryDetails.push({
                    priceChangeOnLayAwayPODate: new Date(),
                    priceChangeOnLayAwayPORemarks: `Start Balance | Item ID: ${this.layAwayPurchaseOrderIntentID} || ${this.layAwayPurchaseOrderIntentItemCode} || ${this.layAwayPurchaseOrderIntentItemName} || ${this.layAwayPurchaseOrderNoOfUnitBought}${this.layAwayPurchaseOrderUnitOfMeasure} @${formatCurrency(this.layAwayPurchaseOrderUnitPrice)} each`,
                    newPriceAmountOnLayAwayPO: this.layAwayPurchaseOrderTotalStartPrice,
                    priceAdjustmentAppliedOnLayAwayPO: false
                });
            }
            if (this.PriceChangeOnLayAwayPOHistoryDetails.length > 0 && this.RemittanceBalanceToBePaidDetailsOnLayAwayPO.length === 0) {
                const firstPriceChange = this.PriceChangeOnLayAwayPOHistoryDetails[0];
                const firstPriceChangeAmount = firstPriceChange.newPriceAmountOnLayAwayPO || 0;
                const layAwayPurchaseOrderId = this.layAwayPurchaseOrderId;
                const expectedBalToBePaidOnPO = -firstPriceChangeAmount;
                this.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
                    remitDateOnLayAwayPO: new Date(),
                    remittanceExpectedBalToBePaidOnLayAwayPO: expectedBalToBePaidOnPO || 0,
                    remittanceUpdateRemarksOnLayAwayPO: `Expected Amount To Be Remitted for Purchase Order ID: ${layAwayPurchaseOrderId}`,
                    remittedAmountCROnLayAwayPO: 0,
                    endingBalanceAfterLastRemittanceOnLayAwayPO: expectedBalToBePaidOnPO,
                    priceAdjustmentAppliedOnLayAwayPO: false,
                    isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
                    priceChangeOnLayAwayPODate: ''
                });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const LayAwayPurchaseOrder = mongoose.model('LayAwayPurchaseOrder', LayAwayPurchaseOrderSchema);
export { LayAwayPurchaseOrder };
