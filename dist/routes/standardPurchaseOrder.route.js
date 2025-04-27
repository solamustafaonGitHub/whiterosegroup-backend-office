import express from 'express';
import { StandardPurchaseOrderPDFController } from '../controllers/standardPurchaseOder.controller.js';
const standardPurchaseOrderRouter = express.Router();
standardPurchaseOrderRouter.get('/standardpurchaseorder/:id/pdf', StandardPurchaseOrderPDFController);
export default standardPurchaseOrderRouter;
