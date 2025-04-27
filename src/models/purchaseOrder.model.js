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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const generatePurchaseOrderShortId_util_js_1 = __importDefault(require("../utils/generatePurchaseOrderShortId.util.js"));
;
;
;
;
// PurchaseOrderSchema for Mongoose
const purchaseOrderSchema = new mongoose_1.Schema({
    purchaseOrderId: { type: String, default: generatePurchaseOrderShortId_util_js_1.default, unique: true },
    createdAt: { type: Date, default: new Date() },
    pOrderForActiveUserRefID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ActiveUser', required: true },
    pOrderForActiveUserID: { type: String },
    pOrderUserProfileFullName: { type: String },
    pOrderUserProfilePhoneNo: { type: String },
    pOrderUserProfileEmail: { type: String },
    pOrderUserDeliveryAddress: { type: String },
    purchaseOrderIntent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    purchaseOrderIntentID: { type: String },
    purchaseOrderIntentItemCode: { type: String },
    purchaseOrderIntentItemName: { type: String },
    purchaseOrderIntentDesc: { type: String },
    purchaseOrderNoOfUnitBought: { type: Number, required: true },
    purchaseOrderUnitOfMeasure: { type: String, required: true },
    purchaseOrderUnitPrice: { type: Number },
    purchaseOrderTotalStartPrice: { type: Number },
    purchaseOrderAssetSubscTypeRefID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SubscriptionType', required: true },
    purchaseOrderAssetSubscType: String,
    PriceChangeOnPOHistoryDetails: [
        {
            priceChangeOnPODate: { type: Date, default: new Date() },
            priceChangeOnPORemarks: { type: String },
            newPriceAmountOnPO: { type: Number }
        }
    ],
    purchaseOrderNewPriceAlert: { type: Number },
    purchaseOrderPriceReverseAlertDetails: [
        {
            purchaseOrderReversalID: { type: String },
            purchaseOrderReverseDate: { type: Date, default: new Date() },
            purchaseOrderReverseNewPriceAlertRemarks: { type: String },
            purchaseOrderReverseNewPriceAlert: { type: Number },
            purchaseOrderReverseOldPrice: { type: Number }
        }
    ],
    totalRemittanceMadeSoFar: [
        {
            remittedDate: { type: Date, default: new Date() },
            remittedAmount: { type: Number },
            remittedRemarks: { type: String },
            totalPaymentsMadeSoFar: { type: Number },
        }
    ],
    remittanceBalanceToBePaidDetails: [
        {
            remitDateOnPO: { type: Date, default: new Date() },
            remittanceExpectedBalToBePaidOnPO: { type: Number },
            remittanceUpdateRemarksOnPO: { type: String },
            remittedAmountCROnPO: { type: Number },
            endingBalanceAfterLastRemittance: { type: Number },
            priceAdjustmentApplied: { type: Boolean, default: false }
        }
    ],
    lastUpdatedAt: { type: Date, default: new Date() },
});
// Middleware for calculations
purchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.PriceChangeOnPOHistoryDetails && this.PriceChangeOnPOHistoryDetails.length > 0 && this.remittanceBalanceToBePaidDetails && this.remittanceBalanceToBePaidDetails.length === 0) {
            const initialPriceChange = this.PriceChangeOnPOHistoryDetails[0];
            const initialBalance = -(initialPriceChange.newPriceAmountOnPO || 0);
            this.remittanceBalanceToBePaidDetails?.push({
                remitDateOnPO: initialPriceChange.priceChangeOnPODate,
                remittanceExpectedBalToBePaidOnPO: initialBalance,
                remittanceUpdateRemarksOnPO: `Start Balance | Purchase Order ID: ${this.purchaseOrderId}`,
                remittedAmountCROnPO: 0,
                endingBalanceAfterLastRemittance: initialBalance,
                priceAdjustmentApplied: false,
            });
        }
        const lastRemittance = this.totalRemittanceMadeSoFar && this.totalRemittanceMadeSoFar.length > 0 ? this.totalRemittanceMadeSoFar.slice(-1)[0] : undefined;
        const newRemittance = this.totalRemittanceMadeSoFar && this.totalRemittanceMadeSoFar.length > 0 ? this.totalRemittanceMadeSoFar.slice(-1)[0] : undefined;
        if (newRemittance) {
            const totalPayments = lastRemittance ? lastRemittance.totalPaymentsMadeSoFar + newRemittance.remittedAmount : newRemittance.remittedAmount;
            newRemittance.totalPaymentsMadeSoFar = totalPayments;
            const lastBalance = this.remittanceBalanceToBePaidDetails && this.remittanceBalanceToBePaidDetails.length > 0 ? this.remittanceBalanceToBePaidDetails.slice(-1)[0] : undefined;
            const newBalance = lastBalance ? lastBalance.endingBalanceAfterLastRemittance - newRemittance.remittedAmount : -newRemittance.remittedAmount;
            this.remittanceBalanceToBePaidDetails?.push({
                remitDateOnPO: newRemittance.remittedDate,
                remittanceExpectedBalToBePaidOnPO: lastBalance ? lastBalance.endingBalanceAfterLastRemittance : 0,
                remittanceUpdateRemarksOnPO: `New Remittance Added for Purchase Order ID: ${this.purchaseOrderId}`,
                remittedAmountCROnPO: newRemittance.remittedAmount,
                endingBalanceAfterLastRemittance: newBalance,
                priceAdjustmentApplied: false,
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const PurchaseOrder = mongoose_1.default.model('PurchaseOrder', purchaseOrderSchema);
exports.PurchaseOrder = PurchaseOrder;
