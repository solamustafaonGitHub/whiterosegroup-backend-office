import path from 'path';
import fs from 'fs';
import express from 'express';
import {SchemeSaleOrderPDFController} from '../controllers/schemeSaleOrder.controller.js';    

const schemeSaleOrderRouter = express.Router();

//Route to generate a PDF for a specific scheme information
schemeSaleOrderRouter.get("/schemesaleorder/:id/pdf", SchemeSaleOrderPDFController);

export default schemeSaleOrderRouter;