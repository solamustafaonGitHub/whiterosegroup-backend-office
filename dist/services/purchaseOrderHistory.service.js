import { PurchaseOrder } from '../models/purchaseOrder.model.js';
;
export async function getPurchaseOrderEvents(purchaseOrderId) {
    try {
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId)
            .populate('PriceChangeOnPOHistoryDetails')
            .populate('remittanceBalanceToBePaidDetails')
            .populate('purchaseOrderPriceReverseAlertDetails')
            .populate('totalRemittanceMadeSoFar')
            .exec();
        if (!purchaseOrder) {
            throw new Error('Purchase Order not found');
        }
        return purchaseOrder;
    }
    catch (error) {
        throw new Error(`Error fetching Purchase Order: ${error.message}`);
    }
}
;
export function organizeEvents(purchaseOrder) {
    const events = [];
    const firstPriceChange = purchaseOrder.PriceChangeOnPOHistoryDetails[0];
    if (firstPriceChange) {
        events.push({
            eventType: 'purchaseOrder',
            transactionDate: firstPriceChange.priceChangeOnPODate,
            transactionRemarks: firstPriceChange.priceChangeOnPORemarks,
            dr: firstPriceChange.newPriceAmountOnPO,
            balance: purchaseOrder.remittanceBalanceToBePaidDetails[0]?.remittanceExpectedBalToBePaidOnPO || 0,
        });
    }
    for (const remittance of purchaseOrder.remittanceBalanceToBePaidDetails) {
        events.push({
            eventType: 'remittance',
            transactionDate: remittance.remitDateOnPO,
            transactionRemarks: remittance.remittanceUpdateRemarksOnPO,
            cr: remittance.remittedAmountCROnPO,
            balance: remittance.endingBalanceAfterLastRemittance,
        });
    }
    for (const priceAlert of purchaseOrder.purchaseOrderPriceReverseAlertDetails) {
        events.push({
            eventType: 'updateItemPrice',
            transactionDate: priceAlert.purchaseOrderReverseDate,
            transactionRemarks: priceAlert.purchaseOrderReverseNewPriceAlertRemarks,
            cr: priceAlert.purchaseOrderReverseNewPriceAlert,
            balance: purchaseOrder.totalRemittanceMadeSoFar.find((remittance) => remittance.remittedDate <= priceAlert.purchaseOrderReverseDate)?.totalPaymentsMadeSoFar || 0,
        });
        const correspondingRemittance = purchaseOrder.remittanceBalanceToBePaidDetails.find((remittance) => remittance.remitDateOnPO >= priceAlert.purchaseOrderReverseDate);
        events.push({
            eventType: 'updateItemPrice',
            transactionDate: priceAlert.purchaseOrderReverseDate,
            transactionRemarks: priceAlert.purchaseOrderReverseNewPriceAlertRemarks,
            dr: priceAlert.purchaseOrderReverseNewPriceAlert,
            balance: correspondingRemittance?.remittanceExpectedBalToBePaidOnPO || 0,
        });
    }
    events.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
    return events;
}
;
