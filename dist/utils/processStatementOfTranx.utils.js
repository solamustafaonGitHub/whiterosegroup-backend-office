"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generatePDF(events) {
    const doc = new pdfkit_1.default();
    doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Transaction Date', 50, 50)
        .text('Transaction Remarks', 150, 50)
        .text('DR', 300, 50)
        .text('CR', 350, 50)
        .text('Balance', 400, 50);
    doc.font('Helvetica').fontSize(10);
    let y = 80;
    for (const event of events) {
        doc.text(event.transactionDate.toLocaleDateString(), 50, y);
        doc.text(event.transactionRemarks, 150, y);
        doc.text(event.dr?.toString() || '', 300, y);
        doc.text(event.cr?.toString() || '', 350, y);
        doc.text(event.balance.toString(), 400, y);
        y += 20;
    }
    return doc;
}
exports.generatePDF = generatePDF;
export {};
