import express from 'express';
import { NairaWalletPDFController } from '../controllers/walletNaira.controller.js';
const nairaWalletRouter = express.Router();
nairaWalletRouter.get('/nairawallet/:id/pdf', NairaWalletPDFController);
export default nairaWalletRouter;
