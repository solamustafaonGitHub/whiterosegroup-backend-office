import express from 'express';
import { PaymentPlanPDFController } from '../controllers/paymentPlanForFractionalOwnership.controller.js';
const paymentPlanRouter = express.Router();
paymentPlanRouter.get("/paymentplan/:id/pdf", PaymentPlanPDFController);
export default paymentPlanRouter;
