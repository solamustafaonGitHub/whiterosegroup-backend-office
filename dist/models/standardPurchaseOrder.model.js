import mongoose, { Schema } from 'mongoose';
import { ActiveSubscriber } from './activeSubscriber.model.js';
import { ItemInformation } from './itemInformation.model.js';
import generateCombinedPOShortId from '../utils/generateCombinedPOShortId.util.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
import { UOM } from './uom.model.js';
;
;
;
;
;
const StandardPurchaseOrderSchema = new Schema({
    standardPurchaseOrderId: { type: String, default: generateCombinedPOShortId, unique: true },
    createdAt: { type: Date, default: Date.now, required: true },
    standardPOrderForActiveSubscriberRefID: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
    standardPOrderForActiveSubscriberID: { type: String },
    standardPOrderUserProfileFullName: { type: String },
    standardPOrderUserProfilePhoneNo: { type: String },
    standardPOrderUserProfileEmail: { type: String },
    standardPOrderUserDeliveryAddress: { type: String },
    standardPurchaseOrderAssetSubscType: { type: String, default: 'Outright Purchase' },
    StandardPurchaseOrderItems: [{
            standardPurchaseOrderCount: { type: Number },
            standardPurchaseOrderDate: { type: Date, required: true },
            standardPurchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
            standardPurchaseOrderIntentID: { type: String },
            standardPurchaseOrderIntentItemCode: { type: String },
            standardPurchaseOrderIntentItemName: { type: String },
            standardPurchaseOrderIntentDesc: { type: String },
            standardPurchaseOrderNoOfUnitBought: { type: Number, required: true },
            standardPurchaseOrderUnitOfMeasureRefID: { type: Schema.Types.ObjectId, ref: 'UOM', required: true },
            standardPurchaseOrderUnitOfMeasure: { type: String },
            standardPurchaseOrderUnitPrice: { type: Number },
            standardPurchaseOrderTotalStartPrice: { type: Number },
            standardPurchaseOrderNewPriceAlert: { type: Number },
            PriceChangeOnStandardPOHistoryDetails: [{
                    priceChangeOnStandardPODate: { type: Date, default: Date.now },
                    priceChangeOnStandardPORemarks: { type: String },
                    newUnitPriceAmountOnStandardPO: { type: Number },
                    newTotalPriceAmountOnStandardPO: { type: Number },
                    priceAdjustmentAppliedOnStandardPO: { type: Boolean, default: false }
                }],
            PriceReverseAlertDetailsOnStandardPO: [{
                    standardPOReverseDate: { type: Date, default: Date.now },
                    standardPOReversalID: { type: String },
                    standardPOReverseOldPrice: { type: Number },
                    standardPOReverseNewPriceAlertRemarks: { type: String },
                    standardPOReverseNewPriceAlert: { type: Number }
                }],
            RemittanceBalanceToBePaidDetailsOnStandardPO: [{
                    priceChangeOnStandardPODate: { type: Date, default: Date.now },
                    isRemittanceAfterPriceChangeOnStandardPO: { type: Boolean },
                    remitDateOnStandardPO: { type: Date, default: Date.now },
                    remittanceExpectedBalToBePaidStandardPO: { type: Number },
                    remittanceUpdateRemarksOnStandardPO: { type: String },
                    remittedAmountCROnStandardPO: { type: Number },
                    endingBalanceAfterLastRemittanceOnStandardPO: { type: Number },
                    priceAdjustmentAppliedOnStandardPO: { type: Boolean, default: false },
                }],
            StandardPurchaseOrderCumulativeBalance: [{
                    cumulativeBalance: { type: Number }
                }],
            StandardPurchaseOrderItemsGrandTotal: [{
                    updatedAt: { type: Date, default: Date.now },
                    standardPurchaseOrderItemsGrandTotal: { type: Number }
                }],
        }],
    TotalRemittanceMadeSoFarOnStandardPO: [{
            remitDateOnStandardPO: { type: Date, default: Date.now },
            remittedDateOnStandardPO: { type: Date },
            remittedAmountOnStandardPO: { type: Number },
            remittedRemarksOnStandardPO: { type: String },
            TotalPaymentsMadeSoFarOnStandardPO: { type: String }
        }],
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
StandardPurchaseOrderSchema.pre('save', function (next) {
    if (!this.standardPurchaseOrderId || this.standardPurchaseOrderId.trim() === '') {
        return next(new Error('Standard Purchase Order ID is required. Please ensure a valid Standard Purchase Order ID is generated'));
    }
    next();
});
StandardPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.standardPOrderForActiveSubscriberRefID) {
            const subscriberDetails = await ActiveSubscriber.findById(this.standardPOrderForActiveSubscriberRefID);
            if (subscriberDetails) {
                this.standardPOrderForActiveSubscriberID = subscriberDetails.activeSubscriberID.toString();
                this.standardPOrderUserProfileFullName = subscriberDetails.activeSubscriberFirstName + ' ' + ' ' + subscriberDetails.activeSubscriberLastName;
                this.standardPOrderUserProfilePhoneNo = subscriberDetails.activeSubscriberPhoneNo;
                this.standardPOrderUserProfileEmail = subscriberDetails.activeSubscriberEmail;
                this.standardPOrderUserDeliveryAddress = subscriberDetails.activeSubscriberAssetDeliveryAddress;
            }
            next();
        }
    }
    catch (error) {
        next(error);
    }
});
StandardPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.StandardPurchaseOrderItems.length > 0) {
            for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
                const item = this.StandardPurchaseOrderItems[i];
                if (item.standardPurchaseOrderIntent) {
                    const itemDetails = await ItemInformation.findById(item.standardPurchaseOrderIntent);
                    if (itemDetails) {
                        item.standardPurchaseOrderCount = i + 1;
                        item.standardPurchaseOrderIntentID = itemDetails.itemInformationID;
                        item.standardPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
                        item.standardPurchaseOrderIntentItemName = itemDetails.itemInformationName;
                        item.standardPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
                        if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                            const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
                            item.standardPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
                        }
                        item.standardPurchaseOrderUnitPrice = item.standardPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                        item.standardPurchaseOrderTotalStartPrice = item.standardPurchaseOrderNoOfUnitBought * item.standardPurchaseOrderUnitPrice;
                    }
                    else {
                        console.warn(`Item details not found for intent ID: ${item.standardPurchaseOrderIntent}`);
                    }
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
StandardPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.StandardPurchaseOrderItems.length > 0) {
            for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
                const uomDetails = await UOM.findById(this.StandardPurchaseOrderItems[i].standardPurchaseOrderUnitOfMeasureRefID);
                if (uomDetails) {
                    this.StandardPurchaseOrderItems[i].standardPurchaseOrderUnitOfMeasure = uomDetails.unitMeaseureName;
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
StandardPurchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.StandardPurchaseOrderItems.some(item => item.standardPurchaseOrderIntent)) {
            for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
                const item = this.StandardPurchaseOrderItems[i];
                const itemDetails = await ItemInformation.findById(item.standardPurchaseOrderIntent);
                if (itemDetails) {
                    item.standardPurchaseOrderIntentID = itemDetails.itemInformationID;
                    item.standardPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
                    item.standardPurchaseOrderIntentItemName = itemDetails.itemInformationName;
                    item.standardPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
                    if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                        const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
                        item.standardPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
                    }
                    item.standardPurchaseOrderUnitPrice = item.standardPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                    item.standardPurchaseOrderTotalStartPrice = item.standardPurchaseOrderNoOfUnitBought * item.standardPurchaseOrderUnitPrice;
                }
            }
        }
        if (this.StandardPurchaseOrderItems.length > 0) {
            for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
                const item = this.StandardPurchaseOrderItems[i];
                if (!item.PriceChangeOnStandardPOHistoryDetails) {
                    item.PriceChangeOnStandardPOHistoryDetails = [];
                }
                if (item.PriceChangeOnStandardPOHistoryDetails.length === 0) {
                    item.PriceChangeOnStandardPOHistoryDetails.push({
                        priceChangeOnStandardPODate: this.createdAt,
                        priceChangeOnStandardPORemarks: `Start Balance | Item ID: ${item.standardPurchaseOrderIntentID} || ${item.standardPurchaseOrderIntentItemCode} || ${item.standardPurchaseOrderIntentItemName} || ${item.standardPurchaseOrderNoOfUnitBought}${item.standardPurchaseOrderUnitOfMeasure} @${formatCurrency(item.standardPurchaseOrderUnitPrice)} each`,
                        newUnitPriceAmountOnStandardPO: item.standardPurchaseOrderUnitPrice,
                        newTotalPriceAmountOnStandardPO: item.standardPurchaseOrderTotalStartPrice,
                        priceAdjustmentAppliedOnStandardPO: false,
                        cumulativeBalance: item.standardPurchaseOrderTotalStartPrice,
                    });
                }
                if (!item.RemittanceBalanceToBePaidDetailsOnStandardPO || item.RemittanceBalanceToBePaidDetailsOnStandardPO.length === 0) {
                    item.RemittanceBalanceToBePaidDetailsOnStandardPO = [];
                    const initialBalance = item.standardPurchaseOrderTotalStartPrice;
                    item.RemittanceBalanceToBePaidDetailsOnStandardPO.push({
                        remitDateOnStandardPO: new Date(),
                        remittanceExpectedBalToBePaidStandardPO: -initialBalance,
                        remittanceUpdateRemarksOnStandardPO: `Initial Expected Amount for Standard Purchase Order ID: ${this.standardPurchaseOrderId}`,
                        remittedAmountCROnStandardPO: 0,
                        endingBalanceAfterLastRemittanceOnStandardPO: -initialBalance,
                        priceAdjustmentAppliedOnStandardPO: false,
                        isRemittanceAfterPriceChangeOnStandardPO: undefined,
                        priceChangeOnStandardPODate: new Date(),
                    });
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
StandardPurchaseOrderSchema.pre('save', async function (next) {
    try {
        const items = this.StandardPurchaseOrderItems || [];
        if (items.length === 0)
            return next();
        const currentItemTotals = items.map(item => {
            const latestPrice = item.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardPO
                ?? item.standardPurchaseOrderTotalStartPrice
                ?? 0;
            const quantity = item.standardPurchaseOrderNoOfUnitBought ?? 1;
            return latestPrice * quantity;
        });
        const currentCumulativeTotals = [];
        let runningTotal = 0;
        for (const total of currentItemTotals) {
            runningTotal += total;
            currentCumulativeTotals.push(runningTotal);
        }
        const existingDoc = await StandardPurchaseOrder.findById(this._id).lean();
        const previousItems = existingDoc?.StandardPurchaseOrderItems ?? [];
        let hasAnyItemChanged = false;
        items.forEach((currentItem, index) => {
            const previousItem = previousItems[index];
            const previousPrice = previousItem?.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardPO
                ?? previousItem?.standardPurchaseOrderTotalStartPrice
                ?? 0;
            const previousQty = previousItem?.standardPurchaseOrderNoOfUnitBought ?? 1;
            const previousTotal = previousPrice * previousQty;
            const currentTotal = currentItemTotals[index];
            if (previousTotal !== currentTotal) {
                hasAnyItemChanged = true;
            }
        });
        if (!hasAnyItemChanged && existingDoc)
            return next();
        items.forEach((item, index) => {
            item.StandardPurchaseOrderCumulativeBalance ||= [];
            item.StandardPurchaseOrderItemsGrandTotal ||= [];
            item.StandardPurchaseOrderCumulativeBalance.push({
                cumulativeBalance: currentCumulativeTotals[index],
            });
            item.StandardPurchaseOrderItemsGrandTotal.push({
                standardPurchaseOrderItemsGrandTotal: currentCumulativeTotals[index],
                updatedAt: new Date(),
            });
            this.markModified(`StandardPurchaseOrderItems.${index}.StandardPurchaseOrderCumulativeBalance`);
            this.markModified(`StandardPurchaseOrderItems.${index}.StandardPurchaseOrderItemsGrandTotal`);
        });
        this.markModified('StandardPurchaseOrderItems');
        next();
    }
    catch (err) {
        next(err);
    }
});
StandardPurchaseOrderSchema.pre('save', function (next) {
    if (!this.standardPurchaseOrderAssetSubscType || this.standardPurchaseOrderAssetSubscType.trim() === '') {
        this.standardPurchaseOrderAssetSubscType = 'Outright Purchase';
    }
    next();
});
StandardPurchaseOrderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date();
        this.lastUpdatedAt = new Date();
        this.StandardPurchaseOrderItems.forEach(item => {
            item.PriceChangeOnStandardPOHistoryDetails.forEach(priceChange => {
                priceChange.priceChangeOnStandardPODate = new Date();
            });
        });
        this.StandardPurchaseOrderItems.forEach(item => {
            item.RemittanceBalanceToBePaidDetailsOnStandardPO.forEach(remittance => {
                remittance.priceChangeOnStandardPODate = new Date();
            });
        });
        this.lastUpdatedAt = new Date();
        this.TotalRemittanceMadeSoFarOnStandardPO.forEach(remittance => {
            remittance.remitDateOnStandardPO && remittance.remittedDateOnStandardPO === new Date();
        });
        next();
    }
});
StandardPurchaseOrderSchema.pre('validate', function (next) {
    try {
        const items = this.StandardPurchaseOrderItems || [];
        const mergedMap = new Map();
        for (const item of items) {
            const key = item.standardPurchaseOrderIntent.toString();
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                existing.standardPurchaseOrderNoOfUnitBought += item.standardPurchaseOrderNoOfUnitBought ?? 0;
            }
            else {
                mergedMap.set(key, { ...item });
            }
        }
        this.StandardPurchaseOrderItems = Array.from(mergedMap.values());
        next();
    }
    catch (error) {
        next(error);
    }
});
const StandardPurchaseOrder = mongoose.model('StandardPurchaseOrder', StandardPurchaseOrderSchema);
export { StandardPurchaseOrder };
