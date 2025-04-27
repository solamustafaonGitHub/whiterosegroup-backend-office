import { PurchaseOrder } from '../models/purchaseOrder.model.js';
export const getPurchaseOrderData = async (purchaseOrderId) => {
    try {
        const purchaseOrder = await PurchaseOrder.findOne({ purchaseOrderId: purchaseOrderId });
        if (!purchaseOrder) {
            console.error(`Purchase order with ID ${purchaseOrderId} not found`);
            throw new Error('Purchase Order not found');
        }
        return purchaseOrder;
    }
    catch (error) {
        console.error('Error fetching purchase order:', error);
        throw error;
    }
};
