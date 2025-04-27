import path from 'path';
import fs from 'fs';
import express from 'express';
import {UserSchemePDFController} from '../controllers/userScheme.controller.js';    

const userSchemeRouter = express.Router();

//Route to generate a PDF for a specific scheme information
userSchemeRouter.get("/userscheme/:id/pdf", UserSchemePDFController);

export default userSchemeRouter;