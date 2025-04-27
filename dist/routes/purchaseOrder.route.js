"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const purchaseOrder_controller_js_1 = require("../controllers/purchaseOrder.controller.js");
const purchaseOrderRouter = express_1.default.Router();
purchaseOrderRouter.get('/purchaseorders', purchaseOrder_controller_js_1.getAllPurchaseOrders);
purchaseOrderRouter.get('/purchaseorder/:id', purchaseOrder_controller_js_1.getPurchaseOrderById);
purchaseOrderRouter.get('/purchaseorder/:id/pdf', purchaseOrder_controller_js_1.generatePurchaseOrderPDFController);
exports.default = purchaseOrderRouter;
export {};
