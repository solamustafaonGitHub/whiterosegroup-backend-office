import path from 'path';
import fs from 'fs';
import express from 'express';
import {PaymentPlan, IPaymentPlan} from '../models/paymentPlan.model.js';
import {PaymentPlanPDFController} from '../controllers/paymentPlan.controller.js';

const paymentPlanRouter = express.Router();

//Route to generate a PDF for a specific PaymentPlan information
paymentPlanRouter.get("/paymentplan/:id/pdf", PaymentPlanPDFController);

export default paymentPlanRouter;
