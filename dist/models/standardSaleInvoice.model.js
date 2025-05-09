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
;
;
;
;
const StandardSaleInvoiceSchema = new Schema({
    standardSaleInvoiceId: { type: String, default: generateCombinedPOShortId, unique: true },
    createdAt: { type: Date, default: Date.now, required: true },
    standardSaleInvoiceForActiveSubscriberRefID: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
    standardSaleInvoiceForActiveSubscriberID: { type: String },
    standardSaleInvoiceUserProfileFullName: { type: String },
    standardSaleInvoiceUserProfilePhoneNo: { type: String },
    standardSaleInvoiceUserProfileEmail: { type: String },
    standardSaleInvoiceUserDeliveryAddress: { type: String },
    standardSaleInvoiceAssetSubscType: { type: String, default: 'Outright Purchase' },
    StandardSaleInvoiceItems: [{
            standardSaleCount: { type: Number },
            standardSaleInvoiceDate: { type: Date, required: true },
            standardSaleInvoiceIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
            standardSaleInvoiceIntentID: { type: String },
            standardSaleInvoiceIntentItemCode: { type: String },
            standardSaleInvoiceIntentItemName: { type: String },
            standardSaleInvoiceIntentDesc: { type: String },
            standardSaleInvoiceNoOfUnitBought: { type: Number, required: true },
            standardSaleInvoiceUnitOfMeasureRefID: { type: Schema.Types.ObjectId, ref: 'UOM', required: true },
            standardSaleInvoiceUnitOfMeasure: { type: String },
            standardSaleInvoiceUnitPrice: { type: Number },
            standardSaleInvoiceTotalStartPrice: { type: Number },
            standardSaleInvoiceNewPriceAlert: { type: Number },
            PriceChangeOnStandardSaleInvoiceHistoryDetails: [{
                    priceChangeOnStandardSaleInvoiceDate: { type: Date, default: Date.now },
                    priceChangeOnStandardSaleInvoiceRemarks: { type: String },
                    newUnitPriceAmountOnStandardSaleInvoice: { type: Number },
                    newTotalPriceAmountOnStandardSaleInvoice: { type: Number },
                    priceAdjustmentAppliedOnStandardSaleInvoice: { type: Boolean, default: false }
                }],
            PriceReverseAlertDetailsOnStandardSaleInvoice: [{
                    standardSaleInvoiceReverseDate: { type: Date, default: Date.now },
                    standardSaleInvoiceReversalID: { type: String },
                    standardSaleInvoiceReverseOldPrice: { type: Number },
                    standardSaleInvoiceReverseNewPriceAlertRemarks: { type: String },
                    standardSaleInvoiceReverseNewPriceAlert: { type: Number }
                }],
            RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice: [{
                    priceChangeOnStandardSaleInvoiceDate: { type: Date, default: Date.now },
                    isRemittanceAfterPriceChangeOnStandardSaleInvoice: { type: Boolean },
                    remitDateOnStandardSaleInvoice: { type: Date, default: Date.now },
                    remittanceExpectedBalToBePaidStandardSaleInvoice: { type: Number },
                    remittanceUpdateRemarksOnStandardSaleInvoice: { type: String },
                    remittedAmountCROnStandardSaleInvoice: { type: Number },
                    endingBalanceAfterLastRemittanceOnStandardSaleInvoice: { type: Number },
                    priceAdjustmentAppliedOnStandardSaleInvoice: { type: Boolean, default: false },
                }],
            StandardSaleInvoiceCumulativeBalance: [{
                    cumulativeBalance: { type: Number }
                }],
            StandardSaleInvoiceItemsGrandTotal: [{
                    updatedAt: { type: Date, default: Date.now },
                    standardSaleInvoiceItemsGrandTotal: { type: Number }
                }],
        }],
    TotalRemittanceMadeSoFarOnStandardSaleInvoice: [{
            remitDateOnStandardSaleInvoice: { type: Date, default: Date.now },
            remittedDateOnStandardSaleInvoice: { type: Date },
            remittedAmountOnStandardSaleInvoice: { type: Number },
            remittedRemarksOnStandardSaleInvoice: { type: String },
            TotalPaymentsMadeSoFarOnStandardSaleInvoice: { type: String }
        }],
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
StandardSaleInvoiceSchema.pre('save', function (next) {
    if (!this.standardSaleInvoiceId || this.standardSaleInvoiceId.trim() === '') {
        return next(new Error('Standard Sale Invoice ID is required. Please ensure a valid Standard Sale Invoice ID is generated'));
    }
    next();
});
StandardSaleInvoiceSchema.pre('save', async function (next) {
    try {
        if (this.standardSaleInvoiceForActiveSubscriberRefID) {
            const subscriberDetails = await ActiveSubscriber.findById(this.standardSaleInvoiceForActiveSubscriberRefID);
            if (subscriberDetails) {
                this.standardSaleInvoiceForActiveSubscriberID = subscriberDetails.activeSubscriberID.toString();
                this.standardSaleInvoiceUserProfileFullName = subscriberDetails.activeSubscriberFirstName + ' ' + ' ' + subscriberDetails.activeSubscriberLastName;
                this.standardSaleInvoiceUserProfilePhoneNo = subscriberDetails.activeSubscriberPhoneNo;
                this.standardSaleInvoiceUserProfileEmail = subscriberDetails.activeSubscriberEmail;
                this.standardSaleInvoiceUserDeliveryAddress = subscriberDetails.activeSubscriberAssetDeliveryAddress;
            }
            next();
        }
    }
    catch (error) {
        next(error);
    }
});
StandardSaleInvoiceSchema.pre('save', async function (next) {
    try {
        if (this.StandardSaleInvoiceItems.length > 0) {
            for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
                const item = this.StandardSaleInvoiceItems[i];
                if (item.standardSaleInvoiceIntent) {
                    const itemDetails = await ItemInformation.findById(item.standardSaleInvoiceIntent);
                    if (itemDetails) {
                        item.standardSaleCount = i + 1;
                        item.standardSaleInvoiceIntentID = itemDetails.itemInformationID;
                        item.standardSaleInvoiceItemCode = itemDetails.itemInformationCode;
                        item.standardSaleInvoiceIntentItemName = itemDetails.itemInformationName;
                        item.standardSaleInvoiceIntentDesc = itemDetails.itemInformationDescription;
                        if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                            const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
                            item.standardSaleInvoiceNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
                        }
                        item.standardSaleInvoiceUnitPrice = item.standardSaleInvoiceNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                        item.standardSaleInvoiceTotalStartPrice = item.standardSaleInvoiceNoOfUnitBought * item.standardSaleInvoiceUnitPrice;
                    }
                    else {
                        console.warn(`Item details not found for intent ID: ${item.standardSaleInvoiceIntent}`);
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
StandardSaleInvoiceSchema.pre('save', async function (next) {
    try {
        if (this.StandardSaleInvoiceItems.length > 0) {
            for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
                const uomDetails = await UOM.findById(this.StandardSaleInvoiceItems[i].standardSaleInvoiceUnitOfMeasureRefID);
                if (uomDetails) {
                    this.StandardSaleInvoiceItems[i].standardSaleInvoiceUnitOfMeasure = uomDetails.unitMeaseureName;
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
StandardSaleInvoiceSchema.pre('save', async function (next) {
    try {
        if (this.StandardSaleInvoiceItems.some(item => item.standardSaleInvoiceIntent)) {
            for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
                const item = this.StandardSaleInvoiceItems[i];
                const itemDetails = await ItemInformation.findById(item.standardSaleInvoiceIntent);
                if (itemDetails) {
                    item.standardSaleInvoiceIntentID = itemDetails.itemInformationID;
                    item.standardSaleInvoiceItemCode = itemDetails.itemInformationCode;
                    item.standardSaleInvoiceIntentItemName = itemDetails.itemInformationName;
                    item.standardSaleInvoiceIntentDesc = itemDetails.itemInformationDescription;
                    if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                        const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
                        item.standardSaleInvoiceNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
                    }
                    item.standardSaleInvoiceUnitPrice = item.standardSaleInvoiceNewPriceAlert || itemDetails.itemInformationMktStartPrice;
                    item.standardSaleInvoiceTotalStartPrice = item.standardSaleInvoiceNoOfUnitBought * item.standardSaleInvoiceUnitPrice;
                }
            }
        }
        if (this.StandardSaleInvoiceItems.length > 0) {
            for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
                const item = this.StandardSaleInvoiceItems[i];
                if (!item.PriceChangeOnStandardSaleInvoiceHistoryDetails) {
                    item.PriceChangeOnStandardSaleInvoiceHistoryDetails = [];
                }
                if (item.PriceChangeOnStandardSaleInvoiceHistoryDetails.length === 0) {
                    item.PriceChangeOnStandardSaleInvoiceHistoryDetails.push({
                        priceChangeOnStandardSaleInvoiceDate: this.createdAt,
                        priceChangeOnStandardSaleInvoiceRemarks: `Start Balance | Item ID: ${item.standardSaleInvoiceIntentID} || ${item.standardSaleInvoiceItemCode} || ${item.standardSaleInvoiceIntentItemName} || ${item.standardSaleInvoiceNoOfUnitBought}${item.standardSaleInvoiceUnitOfMeasure} @${formatCurrency(item.standardSaleInvoiceUnitPrice)} each`,
                        newUnitPriceAmountOnStandardSaleInvoice: item.standardSaleInvoiceUnitPrice,
                        newTotalPriceAmountOnStandardSaleInvoice: item.standardSaleInvoiceTotalStartPrice,
                        priceAdjustmentAppliedOnStandardSaleInvoice: false,
                        cumulativeBalance: item.standardSaleInvoiceTotalStartPrice,
                    });
                }
                if (!item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice || item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.length === 0) {
                    item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice = [];
                    const initialBalance = item.standardSaleInvoiceTotalStartPrice;
                    item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.push({
                        remitDateOnStandardSaleInvoice: new Date(),
                        remittanceExpectedBalToBePaidStandardSaleInvoice: -initialBalance,
                        remittanceUpdateRemarksOnStandardSaleInvoice: `Initial Expected Amount for Standard Purchase Order ID: ${this.standardSaleInvoiceId}`,
                        remittedAmountCROnStandardSaleInvoice: 0,
                        endingBalanceAfterLastRemittanceOnStandardSaleInvoice: -initialBalance,
                        priceAdjustmentAppliedOnStandardSaleInvoice: false,
                        isRemittanceAfterPriceChangeOnStandardSaleInvoice: undefined,
                        priceChangeOnStandardSaleInvoiceDate: new Date(),
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
StandardSaleInvoiceSchema.pre('save', async function (next) {
    try {
        const items = this.StandardSaleInvoiceItems || [];
        if (items.length === 0)
            return next();
        const currentItemTotals = items.map(item => {
            const latestPrice = item.PriceChangeOnStandardSaleInvoiceHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardSaleInvoice
                ?? item.standardSaleInvoiceTotalStartPrice
                ?? 0;
            const quantity = item.standardSaleInvoiceNoOfUnitBought ?? 1;
            return latestPrice * quantity;
        });
        const currentCumulativeTotals = [];
        let runningTotal = 0;
        for (const total of currentItemTotals) {
            runningTotal += total;
            currentCumulativeTotals.push(runningTotal);
        }
        const existingDoc = await StandardSaleInvoice.findById(this._id).lean();
        const previousItems = existingDoc?.StandardSaleInvoiceItems ?? [];
        let hasAnyItemChanged = false;
        items.forEach((currentItem, index) => {
            const previousItem = previousItems[index];
            const previousPrice = previousItem?.PriceChangeOnStandardSaleInvoiceHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardSaleInvoice
                ?? previousItem?.standardSaleInvoiceTotalStartPrice
                ?? 0;
            const previousQty = previousItem?.standardSaleInvoiceNoOfUnitBought ?? 1;
            const previousTotal = previousPrice * previousQty;
            const currentTotal = currentItemTotals[index];
            if (previousTotal !== currentTotal) {
                hasAnyItemChanged = true;
            }
        });
        if (!hasAnyItemChanged && existingDoc)
            return next();
        items.forEach((item, index) => {
            item.StandardSaleInvoiceCumulativeBalance ||= [];
            item.StandardSaleInvoiceItemsGrandTotal ||= [];
            item.StandardSaleInvoiceCumulativeBalance.push({
                cumulativeBalance: currentCumulativeTotals[index],
            });
            item.StandardSaleInvoiceItemsGrandTotal.push({
                standardSaleInvoiceItemsGrandTotal: currentCumulativeTotals[index],
                updatedAt: new Date(),
            });
            this.markModified(`StandardSaleInvoiceItems.${index}.StandardSaleInvoiceCumulativeBalance`);
            this.markModified(`StandardSaleInvoiceItems.${index}.StandardSaleInvoiceItemsGrandTotal`);
        });
        this.markModified('StandardSaleInvoiceItems');
        next();
    }
    catch (err) {
        next(err);
    }
});
StandardSaleInvoiceSchema.pre('save', function (next) {
    if (!this.standardSaleInvoiceAssetSubscType || this.standardSaleInvoiceAssetSubscType.trim() === '') {
        this.standardSaleInvoiceAssetSubscType = 'Outright Purchase';
    }
    next();
});
StandardSaleInvoiceSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = new Date();
        this.lastUpdatedAt = new Date();
        this.StandardSaleInvoiceItems.forEach(item => {
            item.PriceChangeOnStandardSaleInvoiceHistoryDetails.forEach(priceChange => {
                priceChange.priceChangeOnStandardSaleInvoiceDate = new Date();
            });
        });
        this.StandardSaleInvoiceItems.forEach(item => {
            item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.forEach(remittance => {
                remittance.priceChangeOnStandardSaleInvoiceDate = new Date();
            });
        });
        this.lastUpdatedAt = new Date();
        this.TotalRemittanceMadeSoFarOnStandardSaleInvoice.forEach(remittance => {
            remittance.remitDateOnStandardSaleInvoice && remittance.remittedDateOnStandardSaleInvoice === new Date();
        });
        next();
    }
});
StandardSaleInvoiceSchema.pre('validate', function (next) {
    try {
        const items = this.StandardSaleInvoiceItems || [];
        const mergedMap = new Map();
        for (const item of items) {
            const key = item.standardSaleInvoiceIntent.toString();
            if (mergedMap.has(key)) {
                const existing = mergedMap.get(key);
                existing.standardSaleInvoiceNoOfUnitBought += item.standardSaleInvoiceNoOfUnitBought ?? 0;
            }
            else {
                mergedMap.set(key, { ...item });
            }
        }
        this.StandardSaleInvoiceItems = Array.from(mergedMap.values());
        next();
    }
    catch (error) {
        next(error);
    }
});
const StandardSaleInvoice = mongoose.model('StandardSaleInvoice', StandardSaleInvoiceSchema);
export { StandardSaleInvoice };
