import express from 'express';
import { StandardSaleOrderPDFController } from '../controllers/standardSaleOrder.controller.js';
const standardSaleOrderRouter = express.Router();
standardSaleOrderRouter.get('/standardsaleorder/:id/pdf', StandardSaleOrderPDFController);
export default standardSaleOrderRouter;
