import path from 'path';
import fs from 'fs';
import express from 'express';
import {Project214Information} from '../models/project214Information.model.js' 
import {Project214PDFController} from '../controllers/project214.controller.js';

const project214Router = express.Router();

//Route to generate a PDF for a specific scheme information
project214Router.get("/project214/:id/pdf", Project214PDFController);

export default project214Router;
