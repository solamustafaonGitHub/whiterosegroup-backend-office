import express from 'express';
import { SchemeInformationPDFController } from '../controllers/schemeInformation.controller.js';
const schemeInformationRouter = express.Router();
schemeInformationRouter.get('/schemeinformation/:id/pdf', SchemeInformationPDFController);
export default schemeInformationRouter;
