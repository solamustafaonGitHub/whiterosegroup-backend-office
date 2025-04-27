import TransactionHistory from '../models/transactionHistory.model.js';
async function getTransactionHistoryByPurchaseOrderId(purchaseOrderId) {
    try {
        console.log("Querying for purchaseOrderId:", purchaseOrderId);
        const transactions = await TransactionHistory.find({ purchaseOrderId: purchaseOrderId._id })
            .exec();
        console.log("Raw transactions from database:", transactions);
        return transactions;
    }
    catch (error) {
        throw new Error(`Error fetching transactions for Purchase Order ID ${purchaseOrderId}: ${error.message}`);
    }
}
export default {
    getTransactionHistoryByPurchaseOrderId,
};
