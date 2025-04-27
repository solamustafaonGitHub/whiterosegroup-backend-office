import mongoose, { Schema } from 'mongoose';
import { ItemInformation } from './itemInformation.model.js';
import { LayAwayPurchaseOrder } from './layAwayPurchaseOrder.model.js';
import { StandardPurchaseOrder } from './standardPurchaseOrder.model.js';
import { generateUpdateItemPriceShortId } from '../utils/generateCombinedUPDATESShortid.utils.js';
import { EventEmitter } from 'events';
const eventBus = new EventEmitter();
;
const UpdateItemPriceSchema = new Schema({
    itemToBeUpdatedRefID: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    updateItemPriceID: { type: String, default: generateUpdateItemPriceShortId, unique: true },
    itemToBeUpdatedID: { type: String },
    itemToBeUpdatedDisplayItemCode: { type: String },
    itemToBeupdatedDisplayName: { type: String },
    itemToBeUpdatedDisplayItemDesc: { type: String },
    itemToBeUpdatedStartPrice: { type: Number },
    updatedItemNewPriceByInflation: { type: Number, required: true },
    updatedItemReasonForNewPrice: { type: String, required: true },
    createdAt: { type: Date, default: new Date(), required: true },
    lastUpdatedAt: { type: Date, default: new Date(), required: true },
});
UpdateItemPriceSchema.pre('save', function (next) {
    if (!this.updateItemPriceID || this.updateItemPriceID.trim() === '') {
        return next(new Error('Update Item Price ID is required. Please ensure a valid updateItemPrice is generated.'));
    }
    next();
});
UpdateItemPriceSchema.pre('save', async function (next) {
    try {
        if (this.itemToBeUpdatedRefID) {
            const itemInfo = await ItemInformation.findById(this.itemToBeUpdatedRefID);
            if (itemInfo) {
                this.itemToBeUpdatedID = itemInfo.itemInformationID;
                this.itemToBeUpdatedDisplayItemCode = itemInfo.itemInformationCode;
                this.itemToBeupdatedDisplayName = itemInfo.itemInformationName;
                this.itemToBeUpdatedDisplayItemDesc = itemInfo.itemInformationDescription;
                this.itemToBeUpdatedStartPrice = itemInfo.itemInformationMktStartPrice;
            }
            else {
                throw new Error('Item information not found');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
UpdateItemPriceSchema.post('save', async function () {
    try {
        const itemInformation = await ItemInformation.findById(this.itemToBeUpdatedRefID);
        if (itemInformation) {
            itemInformation.itemInformationPriceUpdateDetails.push({
                itemInformationTranDateForNewPriceUpdate: this.lastUpdatedAt,
                itemInformationNewPriceUpdateRemarks: this.updatedItemReasonForNewPrice,
                itemInformationCurrentMktPrice: this.updatedItemNewPriceByInflation,
            });
            await itemInformation.save();
        }
        const layAwayPurchaseOrders = await LayAwayPurchaseOrder.find({ layAwayPurchaseOrderIntent: this.itemToBeUpdatedRefID });
        for (const layAwayPO of layAwayPurchaseOrders) {
            const previousPrice = layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.slice(-1)[0]?.newPriceAmountOnLayAwayPO || 0;
            const newPrice = this.updatedItemNewPriceByInflation * layAwayPO.layAwayPurchaseOrderNoOfUnitBought;
            const lastRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0];
            const isFullyPaid = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO === 0;
            if (newPrice !== previousPrice && !isFullyPaid) {
                const priceChangeType = newPrice > previousPrice ? 'Increase' : 'Decrease';
                layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.push({
                    priceChangeOnLayAwayPODate: this.createdAt,
                    priceChangeOnLayAwayPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID}`,
                    newPriceAmountOnLayAwayPO: newPrice,
                });
                const endingBalanceBeforePriceChange = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
                const endingBalanceAfterPriceChange = endingBalanceBeforePriceChange + previousPrice - newPrice;
                layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
                    remitDateOnLayAwayPO: this.createdAt,
                    remittanceExpectedBalToBePaidOnLayAwayPO: endingBalanceBeforePriceChange,
                    remittanceUpdateRemarksOnLayAwayPO: `Balance adjusted for ${priceChangeType} in Item Price`,
                    remittedAmountCROnLayAwayPO: 0,
                    endingBalanceAfterLastRemittanceOnLayAwayPO: endingBalanceAfterPriceChange,
                    priceAdjustmentAppliedOnLayAwayPO: true,
                    priceChangeOnLayAwayPODate: this.createdAt,
                    isRemittanceAfterPriceChangeOnLayAwayPO: false,
                });
                layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.push({
                    layAwayPurchaseOrderReverseDate: this.createdAt,
                    layAwayPurchaseOrderReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment`,
                    layAwayPurchaseOrderReverseNewPriceAlert: newPrice,
                    layAwayPurchaseOrderReverseOldPrice: previousPrice,
                });
                await layAwayPO.save();
            }
        }
        const standardPurchaseOrders = await StandardPurchaseOrder.find({ "StandardPurchaseOrderItems.standardPurchaseOrderIntent": this.itemToBeUpdatedRefID });
        const bulkUpdates = [];
        for (const standardPO of standardPurchaseOrders) {
            let orderUpdated = false;
            const updatedItems = standardPO.StandardPurchaseOrderItems.map(item => {
                const isTargetItem = item.standardPurchaseOrderIntent.toString() === this.itemToBeUpdatedRefID.toString();
                const unitPrice = isTargetItem
                    ? this.updatedItemNewPriceByInflation
                    : item.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newPriceAmountOnStandardPO
                        ?? item.standardPurchaseOrderTotalStartPrice
                        ?? 0;
                const quantity = item.standardPurchaseOrderNoOfUnitBought ?? 1;
                const total = unitPrice * quantity;
                return { item, unitPrice, quantity, total, isTargetItem };
            });
            const anyItemChanged = updatedItems.some(({ item, unitPrice, isTargetItem }) => {
                if (!isTargetItem)
                    return false;
                const previousPrice = item.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newPriceAmountOnStandardPO
                    ?? item.standardPurchaseOrderTotalStartPrice
                    ?? 0;
                return unitPrice !== previousPrice;
            });
            if (!anyItemChanged)
                continue;
            let cumulative = 0;
            updatedItems.forEach((entry, index) => {
                const { item, unitPrice, quantity, total, isTargetItem } = entry;
                cumulative += total;
                item.StandardPurchaseOrderCumulativeBalance ||= [];
                item.StandardPurchaseOrderCumulativeBalance.push({
                    cumulativeBalance: cumulative,
                });
                item.StandardPurchaseOrderItemsGrandTotal ||= [];
                item.StandardPurchaseOrderItemsGrandTotal.push({
                    standardPurchaseOrderItemsGrandTotal: cumulative,
                    updatedAt: new Date(),
                });
                if (isTargetItem) {
                    const previousPrice = item.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newPriceAmountOnStandardPO
                        ?? item.standardPurchaseOrderTotalStartPrice
                        ?? 0;
                    const priceChangeType = unitPrice > previousPrice ? 'Increase' : 'Decrease';
                    item.PriceChangeOnStandardPOHistoryDetails ||= [];
                    item.PriceChangeOnStandardPOHistoryDetails.push({
                        priceChangeOnStandardPODate: this.createdAt,
                        priceChangeOnStandardPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID}`,
                        newPriceAmountOnStandardPO: unitPrice,
                        priceAdjustmentAppliedOnStandardPO: true,
                    });
                    const lastRemittance = item.RemittanceBalanceToBePaidDetailsOnStandardPO?.slice(-1)[0];
                    const endingBalanceBeforePriceChange = lastRemittance?.endingBalanceAfterLastRemittanceOnStandardPO ?? 0;
                    const newTotal = unitPrice * quantity;
                    const oldTotal = previousPrice * quantity;
                    const endingBalanceAfterPriceChange = endingBalanceBeforePriceChange + (oldTotal - newTotal);
                    item.RemittanceBalanceToBePaidDetailsOnStandardPO ||= [];
                    item.RemittanceBalanceToBePaidDetailsOnStandardPO.push({
                        remitDateOnStandardPO: this.createdAt,
                        remittanceExpectedBalToBePaidStandardPO: endingBalanceBeforePriceChange,
                        remittanceUpdateRemarksOnStandardPO: `Balance adjusted for ${priceChangeType} in Item Price`,
                        remittedAmountCROnStandardPO: 0,
                        endingBalanceAfterLastRemittanceOnStandardPO: endingBalanceAfterPriceChange,
                        priceAdjustmentAppliedOnStandardPO: true,
                        priceChangeOnStandardPODate: this.createdAt,
                    });
                    item.PriceReverseAlertDetailsOnStandardPO ||= [];
                    item.PriceReverseAlertDetailsOnStandardPO.push({
                        standardPOReverseDate: this.createdAt,
                        standardPOReversalID: generateUpdateItemPriceShortId(),
                        standardPOReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment`,
                        standardPOReverseOldPrice: previousPrice,
                        standardPOReverseNewPriceAlert: unitPrice,
                    });
                }
            });
            orderUpdated = true;
            if (orderUpdated) {
                bulkUpdates.push({
                    updateOne: {
                        filter: { _id: standardPO._id },
                        update: {
                            $set: {
                                StandardPurchaseOrderItems: standardPO.StandardPurchaseOrderItems,
                            },
                        },
                    },
                });
            }
        }
        if (bulkUpdates.length > 0) {
            await StandardPurchaseOrder.bulkWrite(bulkUpdates);
        }
    }
    catch (error) {
        console.error("Error updating purchase orders:", error);
        throw new Error(`Failed to update Purchase Orders or Item Information: ${error.message}`);
    }
});
const UpdateItemPrice = mongoose.model('UpdateItemPrice', UpdateItemPriceSchema);
export { UpdateItemPrice };
