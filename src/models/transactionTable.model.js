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
exports.TransactionHistory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Create the schema
const TransactionHistorySchema = new mongoose_1.Schema({
    purchaseOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    eventType: { type: String, required: true }, // Dynamically handle all event types
    transactionDate: { type: Date, required: true, default: Date.now },
    transactionRemarks: { type: String },
    amount: { type: Number }, // Optional field to store DR or CR
    balance: { type: Number }, // Optional field to store the running balance
    metadata: { type: mongoose_1.Schema.Types.Mixed }, // A flexible field for additional event-specific data
});
// Ensure purchaseOrderId and eventType can have multiple events
TransactionHistorySchema.index({ purchaseOrderId: 1, eventType: 1 });
// Create & Export the Model
const TransactionHistory = mongoose_1.default.model('TransactionHistory', TransactionHistorySchema);
exports.TransactionHistory = TransactionHistory;
exports.default = TransactionHistory;
// interface Transaction {
//   transactionDate: Date;
//   transactionRemarks: string;
//   dr?: number;
//   cr?: number;
//   balance?: number;
// }
// // This function will take the purchase order data & process it to generate the transaction table according to specified logic (FIFO).
//   export function processTransactions(purchaseOrder:any): Transaction[] {
//   const transactions:Transaction[] = [];
//   // Handle PurchaseOrder events
//   if (purchaseOrder.PriceChangeOnPOHistoryDetails) {
//       purchaseOrder.PriceChangeOnPOHistoryDetails.forEach((item: any) => {
//       transactions.push({
//         transactionDate: item.priceChangeOnPODate,
//         transactionRemarks: item.priceChangeOnPORemarks,
//         dr: item.newPriceAmountOnPO,
//         balance: item.RemittanceBalanceToBePaidDetails?.remittanceExpectedBalToBePaidOnPOBalance,
//       });
//   });
//   }
//   // Handle Remittance events
//   if (purchaseOrder.RemittanceBalanceToBePaidDetails) {
//       purchaseOrder.RemittanceBalanceToBePaidDetails.forEach((item: any) => {
//       transactions.push({
//         transactionDate: item.remitDateOnPO,
//         transactionRemarks: item.remittanceUpdateRemarksOnPO,
//         cr: item.remittedAmountCROnPO,
//         balance: item.endingBalanceAfterLastRemittance,
//       });
//   });
//   }
//   // Handle updateItemPrice events
//   if (purchaseOrder.PurchaseOrderPriceReverseAlertDetails) {
//       purchaseOrder.PurchaseOrderPriceReverseAlertDetails.forEach((item: any) => {
//       transactions.push({
//         transactionDate: item.purchaseOrderReverseDate,
//         transactionRemarks: item.purchaseOrderReverseNewPriceAlertRemarks,
//         cr: item.purchaseOrderReverseNewPriceAlert,
//         balance: item.RemittanceBalanceToBePaidDetails?.remittanceExpectedBalToBePaidOnPOBalance,
//   });
//   // Second entry for price reverse
//       transactions.push({
//         transactionDate: item.purchaseOrderReverseDate,
//         transactionRemarks: item.purchaseOrderReverseNewPriceAlertRemarks,
//         dr: item.purchaseOrderReverseNewPriceAlert,
//         balance: item.RemittanceBalanceToBePaidDetails?.remittanceExpectedBalToBePaidOnPOBalance,
//       });
//   });
//   }
//   // Sort the transactions by date in FIFO order
//   transactions.sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
//   return transactions
// };
// // Utility function to create the PDF
// function createPDF(transactions: any[], fileName: string) {
//     const doc = new PDFDocument();
//     doc.pipe(fs.createWriteStream(fileName));
//     doc.fontSize(12).text('Transaction Report', {align:'left'});
//     // Create the table header
//     doc.moveDown().text('Transaction Date | Transaction Remarks | DR | CR | Balance', {
//       underline: true
//     });
//     // Loop through each transaction and add to the table
//     transactions.forEach((tx) => {
//       doc.moveDown().text(
//         `${tx.transactionDate.toLocaleDateString()} | ${tx.transactionRemarks || ''} | ${tx.DR || ''} | ${tx.CR || ''} | ${tx.balance || ''}`
//       );
//     });
//     doc.end();
//   }
//   // Combine all the transactions into a single array and sort them by date
//   function processTransactions(purchaseOrder: any) {
//     const transactions = [];
//     // Process Purchase Order Events (Check if PriceChangeOnPOHistoryDetails exists and is an array)
//     if (Array.isArray(purchaseOrder.PriceChangeOnPOHistoryDetails)) {
//       purchaseOrder.PriceChangeOnPOHistoryDetails.forEach((po: any) => {
//         transactions.push({
//           transactionDate: po.PriceChangeOnPODate,
//           transactionRemarks: po.PriceChangeOnPORemarks,
//           DR: po.NewPriceAmountOnPO,
//           CR: '',
//           balance: '' // Will be filled from RemittanceBalanceToBePaidDetails
//         });
//       });
//     }
//     // Process Remittance Events (Check if RemittanceBalanceToBePaidDetails exists and is an array)
//     if (Array.isArray(purchaseOrder.RemittanceBalanceToBePaidDetails)) {
//       purchaseOrder.RemittanceBalanceToBePaidDetails.forEach((rem: any) => {
//         transactions.push({
//           transactionDate: rem.RemitDateOnPO,
//           transactionRemarks: rem.RemittanceUpdateRemarksOnPO,
//           DR: '',
//           CR: rem.RemittedAmountCROnPO,
//           balance: rem.EndingBalanceAfterLastRemittance
//         });
//       });
//     }
//     // Process UpdateItemPrice Events (Check if PurchaseOrderPriceReverseAlertDetails exists and is an array)
//     if (Array.isArray(purchaseOrder.PurchaseOrderPriceReverseAlertDetails)) {
//       purchaseOrder.PurchaseOrderPriceReverseAlertDetails.forEach((alert: any) => {
//         transactions.push({
//           transactionDate: alert.PurchaseOrderReverseDate,
//           transactionRemarks: alert.PurchaseOrderReverseNewPriceAlertRemarks,
//           DR: '',
//           CR: alert.PurchaseOrderReverseNewPriceAlert,
//           balance: purchaseOrder.TotalRemittanceMadeSoFar[0]?.TotalPaymentsMadeSoFar || ''
//         });
//         transactions.push({
//           transactionDate: alert.PurchaseOrderReverseDate,
//           transactionRemarks: alert.PurchaseOrderReverseNewPriceAlertRemarks,
//           DR: alert.PurchaseOrderReverseNewPriceAlert,
//           CR: '',
//           balance: purchaseOrder.RemittanceBalanceToBePaidDetails[purchaseOrder.RemittanceBalanceToBePaidDetails.length - 1]?.EndingBalanceAfterLastRemittance || ''
//         });
//       });
//     }
//     // Sort all transactions by date (FIFO)
//     transactions.sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
//     return transactions;
//   }  
//   // Process the transactions in FIFO order and create the PDF
//   const transactions = processTransactions(PurchaseOrder);
//   createPDF(transactions, 'transactions_report.pdf');
