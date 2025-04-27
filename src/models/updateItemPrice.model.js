"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateItemPrice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const itemInformation_model_js_1 = require("./itemInformation.model.js");
const purchaseOrder_model_js_1 = require("./purchaseOrder.model.js");
const events_1 = require("events");
const eventBus = new events_1.EventEmitter();
// Function to generate a 6-digit short ID starting from 200010
function generateUpdateItemPriceShortId() {
    const min = 200010;
    const max = 910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
}
// Define the UpdateItemPrice Schema
const UpdateItemPriceSchema = new mongoose_1.Schema({
    itemToBeUpdatedRefID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    updateItemPriceID: { type: String, default: generateUpdateItemPriceShortId, unique: true },
    itemToBeUpdatedID: { type: String },
    itemToBeUppdatedDisplayItemCode: { type: String },
    itemToBeupdatedDisplayName: { type: String },
    itemToBeUpdatedDisplayItemDesc: { type: String },
    itemToBeUpdatedStartPrice: { type: Number },
    updatedItemNewPriceByInflation: { type: Number, required: true },
    updatedItemReasonForNewPrice: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    lastUpdatedAt: { type: Date, default: new Date() },
});
// Ensure the updateItemPriceID is generated before saving the document
UpdateItemPriceSchema.pre('save', function (next) {
    if (!this.updateItemPriceID || this.updateItemPriceID.trim() === '') {
        return next(new Error('Update Item Price ID is required. Please ensure a valid updateItemPrice is generated.'));
    }
    next();
});
// Pre-save hook to set display fields based on the item information
UpdateItemPriceSchema.pre('save', async function (next) {
    try {
        if (this.itemToBeUpdatedRefID) {
            const itemInfo = await itemInformation_model_js_1.ItemInformation.findById(this.itemToBeUpdatedRefID);
            if (itemInfo) {
                this.itemToBeUpdatedID = itemInfo.itemInformationID;
                this.itemToBeUppdatedDisplayItemCode = itemInfo.itemInformationCode;
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
// Post-save hook to update item price in ItemInformation model and handle associated PurchaseOrders
UpdateItemPriceSchema.post('save', async function () {
    try {
        // Update item information with new price details
        const itemInformation = await itemInformation_model_js_1.ItemInformation.findById(this.itemToBeUpdatedRefID);
        if (itemInformation) {
            itemInformation.itemInformationPriceUpdateDetails.push({
                itemInformationTranDateForNewPriceUpdate: this.lastUpdatedAt,
                itemInformationNewPriceUpdateRemarks: this.updatedItemReasonForNewPrice,
                itemInformationCurrentMktPrice: this.updatedItemNewPriceByInflation,
            });
            await itemInformation.save();
        }
        // Update relevant purchase orders
        const purchaseOrders = await purchaseOrder_model_js_1.PurchaseOrder.find({ purchaseOrderIntent: this.itemToBeUpdatedRefID });
        for (const purchaseOrder of purchaseOrders) {
            const previousPrice = purchaseOrder.PriceChangeOnPOHistoryDetails.slice(-1)[0]?.newPriceAmountOnPO || 0;
            const newPrice = this.updatedItemNewPriceByInflation;
            if (newPrice !== previousPrice) {
                // Add new price change history entry
                const priceChangeType = newPrice > previousPrice ? 'Increase' : 'Decrease';
                purchaseOrder.PriceChangeOnPOHistoryDetails.push({
                    priceChangeOnPODate: this.createdAt,
                    priceChangeOnPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID} || ${this.itemToBeUppdatedDisplayItemCode}`,
                    newPriceAmountOnPO: newPrice * purchaseOrder.purchaseOrderNoOfUnitBought,
                });
                // Adjust remittance balance based on price change
                const lastRemittance = purchaseOrder.remittanceBalanceToBePaidDetails.slice(-1)[0];
                if (lastRemittance) {
                    const balanceAdjustment = (newPrice - previousPrice) * purchaseOrder.purchaseOrderNoOfUnitBought;
                    purchaseOrder.remittanceBalanceToBePaidDetails.push({
                        remitDateOnPO: this.createdAt,
                        remittanceExpectedBalToBePaidOnPO: lastRemittance.endingBalanceAfterLastRemittance,
                        remittanceUpdateRemarksOnPO: `Balance adjusted for ${priceChangeType} in Item Price`,
                        remittedAmountCROnPO: 0,
                        endingBalanceAfterLastRemittance: lastRemittance.endingBalanceAfterLastRemittance + balanceAdjustment,
                        priceAdjustmentApplied: true,
                    });
                }
                // Optional: Create a new credit bill alert entry for price adjustment
                purchaseOrder.purchaseOrderPriceReverseAlertDetails.push({
                    purchaseOrderReverseDate: this.createdAt,
                    purchaseOrderReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment on Item ID: ${this.itemToBeUpdatedID} || ${this.itemToBeUppdatedDisplayItemCode}`,
                    purchaseOrderReverseNewPriceAlert: newPrice,
                    purchaseOrderReverseOldPrice: previousPrice,
                });
                await purchaseOrder.save();
            }
        }
    }
    catch (error) {
        throw new Error(`Failed to update Purchase Orders or Item Information: ${error.message}`);
    }
});
// Create and export the model
const UpdateItemPrice = mongoose_1.default.model('UpdateItemPrice', UpdateItemPriceSchema);
exports.UpdateItemPrice = UpdateItemPrice;
