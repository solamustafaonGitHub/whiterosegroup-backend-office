import express from 'express';
import { UserSchemePDFController } from '../controllers/userScheme.controller.js';
const userSchemeRouter = express.Router();
userSchemeRouter.get("/userscheme/:id/pdf", UserSchemePDFController);
export default userSchemeRouter;
