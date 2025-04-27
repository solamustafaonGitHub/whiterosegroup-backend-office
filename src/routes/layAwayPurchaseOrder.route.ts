import path from 'path';
import fs from 'fs';
import express from 'express';
import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder} from '../models/layAwayPurchaseOrder.model.js';
import {LayAwayPurchaseOrderPDFController} from '../controllers/layAwayPurchaseOrder.controller.js';

const lawAwayPurchaseOrderRouter = express.Router();

// Route to generate a PDF for a specific purchase order by purchaseOrderId
lawAwayPurchaseOrderRouter.get('/layawaypurchaseorder/:id/pdf', LayAwayPurchaseOrderPDFController);

export default lawAwayPurchaseOrderRouter;

