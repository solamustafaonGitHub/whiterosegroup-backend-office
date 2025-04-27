import express from 'express';
import { LayAwayPurchaseOrderPDFController } from '../controllers/layAwayPurchaseOrder.controller.js';
const lawAwayPurchaseOrderRouter = express.Router();
lawAwayPurchaseOrderRouter.get('/layawaypurchaseorder/:id/pdf', LayAwayPurchaseOrderPDFController);
export default lawAwayPurchaseOrderRouter;
