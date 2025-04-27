"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchaseOrder_model_js_1 = require("../models/purchaseOrder.model.js");
const pdfgenerator_component_js_1 = __importDefault(require("../components/pdfgenerator.component.js"));
const pdfGenerator_js_1 = __importDefault(require("../resources/pdfGenerator.js"));
const exportPurchaseOrder = {
    resource: purchaseOrder_model_js_1.PurchaseOrder,
    options: {
        actions: {
            PDFGenerator: {
                actionType: 'record',
                icon: 'GeneratePdf',
                component: pdfgenerator_component_js_1.default,
                handler: (request, response, context) => {
                    const { record, currentAdmin } = context;
                    return {
                        record: record.toJSON(currentAdmin),
                        url: (0, pdfGenerator_js_1.default)(record.toJSON(currentAdmin))
                    };
                }
            }
        }
    }
};
exports.default = exportPurchaseOrder;
