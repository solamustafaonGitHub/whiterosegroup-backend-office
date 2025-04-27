import path from 'path';
import fs from 'fs';
import express from 'express';
import {SchemeInformationPDFController} from '../controllers/schemeInformation.controller.js';    

const schemeInformationRouter = express.Router();

//Route to generate a PDF for a specific scheme information
schemeInformationRouter.get('/schemeinformation/:id/pdf', SchemeInformationPDFController);

export default schemeInformationRouter;
