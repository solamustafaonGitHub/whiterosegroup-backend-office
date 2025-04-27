// import mongoose from 'mongoose';
// import {MongoMemoryServer} from 'mongodb-memory-server';
// import {PurchaseOrder} from '../models/purchaseOrder.model.js';

// let mongoServer: MongoMemoryServer;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri);
// });

// afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });

// describe('PurchaseOrder Model Tests', () => {
//     it('should calculate initial balance correctly on price change', async () => {
//         const purchaseOrder = new PurchaseOrder({
//             purchaseOrderId: 'PO123',
//             PriceChangeOnPOHistoryDetails: [
//                 {
//                     priceChangeOnPODate: new Date(),
//                     priceChangeOnPORemarks: 'Initial Price',
//                     newPriceAmountOnPO: 500000,
//                 },
//             ],
//         });

//         await purchaseOrder.save();

//         const savedPO = await PurchaseOrder.findById(purchaseOrder._id);
//         expect(savedPO?.remittanceBalanceToBePaidDetails?.[0].endingBalanceAfterLastRemittance).toBe(-500000);
//     });

//     it('should calculate balances after remittances', async () => {
//         const purchaseOrder = new PurchaseOrder({
//             purchaseOrderId: 'PO124',
//             PriceChangeOnPOHistoryDetails: [
//                 {
//                     priceChangeOnPODate: new Date(),
//                     priceChangeOnPORemarks: 'Initial Price',
//                     newPriceAmountOnPO: 500000,
//                 },
//             ],
//             totalRemittanceMadeSoFar: [
//                 { remittedDate: new Date(), remittedAmount: 200000, remittedRemarks: 'First Payment' },
//                 { remittedDate: new Date(), remittedAmount: 150000, remittedRemarks: 'Second Payment' },
//             ],
//         });

//         await purchaseOrder.save();

//         const savedPO = await PurchaseOrder.findById(purchaseOrder._id);
//         expect(savedPO?.remittanceBalanceToBePaidDetails?.length).toBe(3); // Initial + 2 remittances
//         expect(savedPO?.remittanceBalanceToBePaidDetails?.[2]?.endingBalanceAfterLastRemittance).toBe(-150000);
//     });

//     it('should update total remittance payments correctly', async () => {
//         const purchaseOrder = new PurchaseOrder({
//             purchaseOrderId: 'PO125',
//             PriceChangeOnPOHistoryDetails: [
//                 {
//                     priceChangeOnPODate: new Date(),
//                     priceChangeOnPORemarks: 'Initial Price',
//                     newPriceAmountOnPO: 500000,
//                 },
//             ],
//             totalRemittanceMadeSoFar: [
//                 { remittedDate: new Date(), remittedAmount: 100000, remittedRemarks: 'Partial Payment' },
//             ],
//         });

//         await purchaseOrder.save();

//         const savedPO = await PurchaseOrder.findById(purchaseOrder._id);
//         const lastRemittance = savedPO?.totalRemittanceMadeSoFar?.slice(-1)[0] ?? null;

//         expect(lastRemittance?.totalPaymentsMadeSoFar).toBe(100000);
//     });

//     it('should handle price change and remittance combination correctly', async () => {
//         const purchaseOrder = new PurchaseOrder({
//             purchaseOrderId: 'PO126',
//             PriceChangeOnPOHistoryDetails: [
//                 {
//                     priceChangeOnPODate: new Date(),
//                     priceChangeOnPORemarks: 'Initial Price',
//                     newPriceAmountOnPO: 600000,
//                 },
//                 {
//                     priceChangeOnPODate: new Date(),
//                     priceChangeOnPORemarks: 'Price Adjustment',
//                     newPriceAmountOnPO: 400000,
//                 },
//             ],
//             totalRemittanceMadeSoFar: [
//                 { remittedDate: new Date(), remittedAmount: 200000, remittedRemarks: 'First Payment' },
//                 { remittedDate: new Date(), remittedAmount: 100000, remittedRemarks: 'Second Payment' },
//             ],
//         });

//         await purchaseOrder.save();

//         const savedPO = await PurchaseOrder.findById(purchaseOrder._id);
//         expect(savedPO?.remittanceBalanceToBePaidDetails?.length ?? 0).toBe(3); // 2 Price Changes + Remittances
//         const lastBalance = savedPO?.remittanceBalanceToBePaidDetails?.slice(-1)[0];
//         expect(lastBalance?.endingBalanceAfterLastRemittance).toBe(-100000); // 400000 - 300000
//     });
// });
