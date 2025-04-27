"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jspdf_1 = require("jspdf");
const pdfGenerator = (record) => {
    const { params } = record;
    const doc = new jspdf_1.jsPDF();
    doc.text(params.orderNum, 10, 10); // example database column called orderNum
    doc.text(params.shippingAddress, 150, 10); // example database column called shippingAddress
    const filename = `/${params.id}.pdf`;
    doc.save(`./pdfs${filename}`);
    return filename;
};
exports.default = pdfGenerator;
