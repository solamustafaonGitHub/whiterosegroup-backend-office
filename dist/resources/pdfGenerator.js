import { jsPDF } from 'jspdf';
const pdfGenerator = (record) => {
    const { params } = record;
    const doc = new jsPDF();
    doc.text(params.orderNum, 10, 10);
    doc.text(params.shippingAddress, 150, 10);
    const filename = `/${params.id}.pdf`;
    doc.save(`./pdfs${filename}`);
    return filename;
};
export default pdfGenerator;
