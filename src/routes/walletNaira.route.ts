//routes/walletNaira.route.ts
import path from 'path';
import fs from 'fs';
import express from 'express';
import {NairaWalletPDFController} from '../controllers/walletNaira.controller.js';

const nairaWalletRouter = express.Router();

//Route to generate a PDF for a specific scheme information
nairaWalletRouter.get('/nairawallet/:id/pdf', NairaWalletPDFController);

export default nairaWalletRouter;