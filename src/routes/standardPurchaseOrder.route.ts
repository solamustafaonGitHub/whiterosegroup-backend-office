import path from 'path';
import fs from 'fs';
import express from 'express';
import {StandardPurchaseOrder, IStandardPurchaseOrder} from '../models/standardPurchaseOrder.model.js';
import {StandardPurchaseOrderPDFController} from '../controllers/standardPurchaseOder.controller.js';

const standardPurchaseOrderRouter = express.Router();

//Route to Generate a PDF for a specific purchase order by standardPurchaseOrderIntentID
standardPurchaseOrderRouter.get('/standardpurchaseorder/:id/pdf', StandardPurchaseOrderPDFController);

export default standardPurchaseOrderRouter;
