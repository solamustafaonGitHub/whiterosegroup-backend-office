import mongoose, { Schema } from 'mongoose';
const TransactionHistorySchema = new Schema({
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    eventType: { type: String, required: true },
    transactionDate: { type: Date, required: true, default: Date.now },
    transactionRemarks: { type: String },
    amount: { type: Number },
    balance: { type: Number },
    metadata: { type: Schema.Types.Mixed },
});
TransactionHistorySchema.index({ purchaseOrderId: 1, eventType: 1 });
const TransactionHistory = mongoose.model('TransactionHistory', TransactionHistorySchema);
export default TransactionHistory;
export { TransactionHistory };
