"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule)
        return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Remittance = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const purchaseOrder_model_js_1 = require("./purchaseOrder.model.js");
const events_1 = require("events");
const eventBus = new events_1.EventEmitter();
function generateRemittanceShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
const remittanceSchema = new mongoose_1.Schema({
    remittanceForWhichPurchaseOrderRefID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    createdAt: { type: Date, default: new Date() },
    remittanceDate: { type: Date, default: new Date() },
    remittanceReferenceID: { type: String, default: generateRemittanceShortId, unique: true },
    remittanceForWhichPurchaseOrderID: { type: String },
    remittanceForWhichActiveUserID: { type: String },
    remittanceActiveUserFullName: { type: String },
    remittancePOPhoneNo: { type: String },
    remittanceAmount_CR: { type: Number, required: true },
    remittanceDueBalance: { type: Number },
    remittancePaymentRefClass: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
    remittancePaymentClass: { type: String },
    remittanceRemarks: { type: String },
    lastUpdatedAt: { type: Date, default: new Date() }
});
remittanceSchema.pre('save', function (next) {
    if (!this.remittanceReferenceID || this.remittanceReferenceID.trim() === '') {
        return next(new Error('Remittance Reference ID is required. Please ensure a valid Remittance Reference ID is generated.'));
    }
    next();
});
remittanceSchema.pre('save', async function (next) {
    try {
        if (this.remittanceForWhichPurchaseOrderRefID) {
            const purchaseOrder = await purchaseOrder_model_js_1.PurchaseOrder.findById(this.remittanceForWhichPurchaseOrderRefID).exec();
            if (purchaseOrder) {
                this.remittanceForWhichPurchaseOrderID = purchaseOrder.purchaseOrderId;
                this.remittanceForWhichActiveUserID = purchaseOrder.pOrderForActiveUserID;
                this.remittanceActiveUserFullName = purchaseOrder.pOrderUserProfileFullName;
                this.remittancePOPhoneNo = purchaseOrder.pOrderUserProfilePhoneNo;
                let remittanceDueOpeningAmount = 0;
                let remittanceDueBalance = 0;
                let totalRemittanceMadeSoFar = 0;
                const lastRemittance = purchaseOrder.remittanceBalanceToBePaidDetails.slice(-1)[0];
                remittanceDueOpeningAmount = lastRemittance?.endingBalanceAfterLastRemittance || 0;
                remittanceDueBalance = remittanceDueOpeningAmount + this.remittanceAmount_CR;
                totalRemittanceMadeSoFar = purchaseOrder.remittanceBalanceToBePaidDetails.reduce((acc, curr) => acc + curr.remittedAmountCROnPO, 0) + this.remittanceAmount_CR;
                const lastPriceReverseAlert = purchaseOrder.purchaseOrderPriceReverseAlertDetails.slice(-1)[0];
                if (lastPriceReverseAlert) {
                    const priceChangeHandled = purchaseOrder.remittanceBalanceToBePaidDetails.some((entry) => entry.remitDateOnPO.getTime() === new Date(lastPriceReverseAlert.purchaseOrderReverseDate).getTime() &&
                        entry.priceAdjustmentApplied === true);
                    if (new Date(lastPriceReverseAlert.purchaseOrderReverseDate).getTime() > new Date(lastRemittance?.remitDateOnPO).getTime() &&
                        !priceChangeHandled) {
                        const newEndingBalanceAfterLastRemittance = remittanceDueBalance + (lastPriceReverseAlert.purchaseOrderReverseNewPriceAlert - lastPriceReverseAlert.purchaseOrderReverseOldPrice);
                        const newRemittanceEntry = {
                            remitDateOnPO: lastPriceReverseAlert.purchaseOrderReverseDate,
                            remittanceExpectedBalToBePaidOnPO: remittanceDueOpeningAmount,
                            remittanceUpdateRemarksOnPO: `Balance Adjustment Due to Price Change: ${purchaseOrder.purchaseOrderIntentItemCode} || ${purchaseOrder.purchaseOrderIntentItemName}`,
                            remittedAmountCROnPO: 0,
                            endingBalanceAfterLastRemittance: newEndingBalanceAfterLastRemittance,
                            priceAdjustmentApplied: true
                        };
                        purchaseOrder.remittanceBalanceToBePaidDetails.push(newRemittanceEntry);
                    }
                    else {
                        purchaseOrder.remittanceBalanceToBePaidDetails.push({
                            remitDateOnPO: this.createdAt,
                            remittanceExpectedBalToBePaidOnPO: remittanceDueOpeningAmount,
                            remittanceUpdateRemarksOnPO: `Remittance for Purchase Order ID: ${purchaseOrder.purchaseOrderId}`,
                            remittedAmountCROnPO: this.remittanceAmount_CR,
                            endingBalanceAfterLastRemittance: remittanceDueBalance,
                            priceAdjustmentApplied: false
                        });
                    }
                }
                else {
                    purchaseOrder.remittanceBalanceToBePaidDetails.push({
                        remitDateOnPO: this.createdAt,
                        remittanceExpectedBalToBePaidOnPO: remittanceDueOpeningAmount,
                        remittanceUpdateRemarksOnPO: `Remittance for Purchase Order ID: ${purchaseOrder.purchaseOrderId}`,
                        remittedAmountCROnPO: this.remittanceAmount_CR,
                        endingBalanceAfterLastRemittance: remittanceDueBalance,
                        priceAdjustmentApplied: false
                    });
                }
                purchaseOrder.totalRemittanceMadeSoFar.push({
                    remittedDate: this.createdAt,
                    remittedAmount: this.remittanceAmount_CR,
                    remittedRemarks: `Payment received for Purchase Order ID: ${purchaseOrder.purchaseOrderId}`,
                    TotalPaymentsMadeSoFar: totalRemittanceMadeSoFar
                });
                await purchaseOrder.save();
            }
        }
        t;
        next();
    }
    catch (error) {
        next(error);
    }
});
const Remittance = mongoose_1.default.model('Remittance', remittanceSchema);
exports.Remittance = Remittance;
export {};
