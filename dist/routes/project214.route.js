import express from 'express';
import { Project214PDFController } from '../controllers/project214.controller.js';
const project214Router = express.Router();
project214Router.get("/project214/:id/pdf", Project214PDFController);
export default project214Router;
