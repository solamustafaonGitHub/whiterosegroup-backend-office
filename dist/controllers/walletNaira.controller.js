import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import * as url from 'url';
import { ActiveSubscriber } from '../models/activeSubscriber.model.js';
import { NairaWalletBalance } from '../models/walletNairaBalance.model.js';
import pkg from 'pdfkit';
const { x, y } = pkg;
export const NairaWalletPDFController = async (req, res) => {
    console.log("Received Request Params:", req.params);
    const activeSubscriberID = req.params.id;
    console.log("ActiveSubscriber Wallet Owner:", activeSubscriberID);
    try {
        const userWalletAccount = await ActiveSubscriber.findOne({ activeSubscriberID: activeSubscriberID });
        if (!userWalletAccount || !userWalletAccount.activeSubscriberNairaWalletID) {
            return res.status(404).send({ message: "User Naira Wallet Not Found" });
        }
        const walletNaira = await NairaWalletBalance.findOne({ nairaWalletID: userWalletAccount.activeSubscriberNairaWalletID });
        if (!walletNaira) {
            return res.status(404).send({ message: "Naira Wallet Not Found" });
        }
        const nairaWalletObject = walletNaira.toObject();
        const nairaWalletID = nairaWalletObject.nairaWalletID;
        const outputFilePath = path.resolve(`./pdfs/nairaWallet_${nairaWalletID}.pdf`);
        await generateNairaWalletPDF(outputFilePath, nairaWalletObject);
        res.download(outputFilePath, `NairaWallet_${nairaWalletID}.pdf`, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Naira Wallet Information PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateNairaWalletPDF(outputFilePath, nairaWallet) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `NairaWallet_${nairaWallet.nairaWalletID || "Unknown"}.pdf`;
    const filePath = path.join(__dirname, fileName);
    doc.pipe(fs.createWriteStream(filePath));
    try {
        const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
        try {
            const logo = fs.readFileSync(logoPath);
            doc.image(logo, 50, 50, { width: 60 });
        }
        catch (error) {
            console.error('Logo Not Found on Service, Skipping Image Inclusion', error);
        }
        const logoWidth = 30;
        const spacing = 3;
        const textX = 80 + logoWidth + spacing;
        doc.font('Helvetica-Bold').fontSize(9).text('Assets360 Nigeria Limited', textX, 50);
        doc.font('Helvetica').fontSize(8.5).text('8, Solomon Kuku Street, Ikeja GRA Lagos', textX, 60);
        doc.font('Helvetica').fontSize(8.5).text('info@asset360nigeria.com', textX, 71);
        doc.font('Helvetica').fontSize(8.5).text('+234 913 327 1208', textX, 83);
        doc.text('__________________________________________________________________________________________', { align: 'left' });
        doc.moveDown();
        const detailsX = 30;
        const newYPosition = doc.y + 10;
        doc.font('Helvetica-Bold').fontSize(8.0).text(`Hello, ${nairaWallet.nairaWalletOwnerFullName}`, detailsX, newYPosition);
        doc.font('Helvetica').fontSize(8.0).text(`Your Wallet ID: ${nairaWallet.nairaWalletID}`, detailsX, newYPosition + 10);
        doc.moveDown(0.25);
        const formatCurrency = (value) => {
            const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return formatter.format(Math.abs(value));
        };
        function formatDate(date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleDateString();
        }
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;
        const headersSectionA = [540];
        const headingsSectionA = ['Wallet Balance'];
        const latestTransaction = await NairaWalletBalance
            .findOne({ nairaWalletID: nairaWallet.nairaWalletID })
            .sort({ lastUpdatedAt: -1 })
            .exec();
        const valuesSectionA = [nairaWallet.nairaWalletCurrency + ' ' + formatCurrency(latestTransaction?.nairaWalletClosingBalance ?? 0)];
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headersSectionA[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionA.forEach((header, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxHeaderHeight, header, true);
                currentX += headersSectionA[index];
            });
            tableY += maxHeaderHeight;
        }
        ;
        function drawSectionAValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionA.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionA.forEach((value, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                currentX += headersSectionA[index];
            });
            tableY += maxRowHeight;
        }
        ;
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(0.2);
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        ;
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF:', error);
    }
}
;
export default NairaWalletPDFController;
