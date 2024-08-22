import mongoose, { Schema } from 'mongoose';
import { ItemInformation } from './itemInformation.model.js';
import { PurchaseOrder } from './purchaseOrder.model.js';
const UpdateItemPriceSchema = new Schema({
    itemToBeUpdatedRefID: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    itemToBeUpdatedID: { type: String },
    itemToBeUppdatedDisplayItemCode: { type: String },
    itemToBeupdatedDisplayName: { type: String },
    itemToBeUpdatedDisplayItemDesc: { type: String },
    itemToBeUpdatedStartPrice: { type: Number },
    updatedItemNewPriceByInflation: { type: Number, required: true },
    updatedItemReasonForNewPrice: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
UpdateItemPriceSchema.pre('save', async function (next) {
    try {
        if (this.itemToBeUpdatedRefID) {
            const updateItemPrice = await ItemInformation.findById(this.itemToBeUpdatedRefID);
            if (updateItemPrice) {
                this.itemToBeUpdatedID = updateItemPrice.itemInformationID;
                this.itemToBeUppdatedDisplayItemCode = updateItemPrice.itemInformationCode;
                this.itemToBeupdatedDisplayName = updateItemPrice.itemInformationName;
                this.itemToBeUpdatedDisplayItemDesc = updateItemPrice.itemInformationDescription;
                this.itemToBeUpdatedStartPrice = updateItemPrice.itemInformationMktStartPrice;
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
async function handlePriceUpdates(updateItemPrice) {
    try {
        const purchaseOrders = await PurchaseOrder.find({ purchaseOrderIntent: updateItemPrice.itemToBeUpdatedRefID });
        for (const purchaseOrder of purchaseOrders) {
            const previousBalance = purchaseOrder.PriceChangeOnPOHistoryDetails[purchaseOrder.PriceChangeOnPOHistoryDetails.length - 1]?.newPriceAmountOnPO || 0;
            await purchaseOrder.save();
        }
    }
    catch (error) {
    }
}
;
UpdateItemPriceSchema.post('save', async function (next) {
    try {
        const updateItemPrice = this;
        const itemInformation = await ItemInformation.find({ itemInformationID: updateItemPrice.itemToBeUpdatedID });
        for (const item of itemInformation) {
            item.itemInformationPriceUpdateDetails.push({
                itemInformationTranDateForNewPriceUpdate: updateItemPrice.lastUpdatedAt,
                itemInformationNewPriceUpdateRemarks: 'New Price Alert | Item ID: ' + updateItemPrice.itemToBeUpdatedID + ' (' + updateItemPrice.itemToBeupdatedDisplayName + ')',
                itemInformationCurrentMktPrice: updateItemPrice.updatedItemNewPriceByInflation,
            });
            await item.save();
        }
        const purchaseOrders = await PurchaseOrder.find({ purchaseOrderIntent: updateItemPrice.itemToBeUpdatedRefID });
        for (const purchaseOrder of purchaseOrders) {
            const previousBalance = purchaseOrder.PriceChangeOnPOHistoryDetails[purchaseOrder.PriceChangeOnPOHistoryDetails.length - 1]?.newPriceAmountOnPO || 0;
            const newBalance = updateItemPrice.updatedItemNewPriceByInflation;
            if (newBalance !== previousBalance) {
                const priceChangeType = newBalance > previousBalance ? 'Increase' : 'Decrease';
                purchaseOrder.PriceChangeOnPOHistoryDetails.push({
                    priceChangeOnPODate: new Date(),
                    priceChangeOnPORemarks: `Price ${priceChangeType} Alert for Item ID:${updateItemPrice.itemToBeUpdatedID} (${updateItemPrice.itemToBeupdatedDisplayName})`,
                    newPriceAmountOnPO: newBalance,
                });
                if (purchaseOrder.PriceChangeOnPOHistoryDetails.length >= 1) {
                    purchaseOrder.purchaseOrderPriceReverseAlertDetails.push({
                        purchaseOrderReverseDate: updateItemPrice.lastUpdatedAt,
                        purchaseOrderReverseNewPriceAlertRemarks: 'Credit Issued Due To Price Adjustment on Item ID:' + '' + updateItemPrice.itemToBeUpdatedID + ' ' + '(' + updateItemPrice.itemToBeupdatedDisplayName + ')',
                        purchaseOrderReverseNewPriceAlert: previousBalance,
                    });
                }
            }
            await purchaseOrder.save();
        }
        await handlePriceUpdates(updateItemPrice);
        next;
    }
    catch (error) {
        next;
    }
});
const UpdateItemPrice = mongoose.model('UpdateItemPrice', UpdateItemPriceSchema);
export { UpdateItemPrice };
