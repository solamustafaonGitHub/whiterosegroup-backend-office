import path from 'path';
import fs from 'fs';
import express from 'express';
import {StandardPurchaseOrder, IStandardPurchaseOrder} from '../models/standardPurchaseOrder.model.js';
import {StandardSaleOrderPDFController} from '../controllers/standardSaleOrder.controller.js';

const standardSaleOrderRouter = express.Router();

//Route to Generate a PDF for a specific purchase order by standardSaleInvoiceIntentID
standardSaleOrderRouter.get('/standardsaleorder/:id/pdf', StandardSaleOrderPDFController);

export default standardSaleOrderRouter;