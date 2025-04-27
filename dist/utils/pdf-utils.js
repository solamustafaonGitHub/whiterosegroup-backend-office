import PDFDocument from 'pdfkit';
export function generatePDF(tabularData, res) {
    const doc = new PDFDocument();
    try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', '  attachment; filename="transaction_report.pdf"');
        doc.pipe(res);
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Transaction Date', 50, 50);
        doc.text('Transaction Remarks', 150, 50);
        doc.text('DR', 300, 50);
        doc.text('CR', 350, 50);
        doc.text('Balance', 400, 50);
        doc.font('Helvetica').fontSize(10);
        let y = 80;
        for (const row of tabularData) {
            doc.text(row.transactionDate.toLocaleDateString(), 50, y);
            doc.text(row.transactionRemarks, 150, y);
            doc.text(row.dr || '', 300, y);
            doc.text(row.cr || '', 350, y);
            doc.text(row.balance.toString(), 400, y);
            y += 20;
        }
        doc.end();
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
    return doc;
}
