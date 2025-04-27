import TransactionHistory from '../models/transactionTable.model.js';
export const getTransactionData = async (purchaseOrderId) => {
    const events = await TransactionHistory.find({ purchaseOrderId }).sort({ transactionDate: 1 }).lean();
    return events;
};
