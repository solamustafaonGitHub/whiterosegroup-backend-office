import express from 'express';
import { SchemeSaleOrderPDFController } from '../controllers/schemeSaleOrder.controller.js';
const schemeSaleOrderRouter = express.Router();
schemeSaleOrderRouter.get("/schemesaleorder/:id/pdf", SchemeSaleOrderPDFController);
export default schemeSaleOrderRouter;
