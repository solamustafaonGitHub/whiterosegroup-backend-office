import express from 'express';
import { StandardSaleInvoicePDFController } from '../controllers/standardSaleOrder.controller.js';
const standardSaleInvoiceRouter = express.Router();
standardSaleInvoiceRouter.get('/standardsaleinvoice/:id/pdf', StandardSaleInvoicePDFController);
export default standardSaleInvoiceRouter;
