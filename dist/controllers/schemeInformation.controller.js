import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import * as url from 'url';
import { SchemeInformation } from '../models/schemeInformationProfile.model.js';
;
export const SchemeInformationPDFController = async (req, res) => {
    console.log("Received Request Params:", req.params);
    const schemeID = req.params.id;
    console.log("Received schemeId:", schemeID);
    if (!schemeID) {
        console.error("Error: SchemeID is undefined!");
        return res.status(400).json({ error: "Invalid request, SchemeID is required" });
    }
    try {
        const schemeInformation = await SchemeInformation.findOne({ schemeID });
        console.log("Scheme Information Query Result:", schemeInformation);
        if (!schemeInformation) {
            return res.status(404).json({ error: "Scheme Information Not Found" });
        }
        const schemeInformationObject = schemeInformation.toObject();
        const outputFilePath = path.resolve(`./pdfs/schemeInformation_${schemeID}.pdf`);
        await generateSchemeInformationPDF(outputFilePath, schemeInformationObject);
        res.download(outputFilePath, `SchemeInformation_${schemeID}.pdf`, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Scheme Information PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateSchemeInformationPDF(outputFilePath, schemeInformation) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `SchemeInformation_${schemeInformation.schemeID || 'Unknown'}.pdf`;
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
        doc.font('Helvetica-Bold').fontSize(8.5).text(`Scheme ID:${schemeInformation.schemeID}`, detailsX, newYPosition);
        doc.moveDown(0.25);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;
        const formatCurrency = (value) => {
            const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return formatter.format(Math.abs(value));
        };
        function formatDateTime(date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleDateString() + '\n' + date.toLocaleTimeString();
        }
        ;
        const headersSectionA = [100, 130, 238, 100];
        const headingsSectionA = ['Scheme Start Date', 'Scheme Name', 'Scheme Description', 'Scheme End Date'];
        const values = [
            schemeInformation.schemeStartDate || 'N/A',
            schemeInformation.schemeName || 'N/A',
            schemeInformation.schemeShortDescription || 'N/A',
            schemeInformation.schemeEndDate || 'N/A'
        ];
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
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            values.forEach((value, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                currentX += headersSectionA[index];
            });
            tableY += maxRowHeight;
        }
        ;
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(9);
        const headerSectionB = [41, 95, 145, 90, 69, 64, 64];
        doc.y = tableY + 25;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Schemed Item Information', contentX, doc.y, { underline: true });
        let tableYSectionB = doc.y + 5;
        const headingsSectionB = ['Item ID', 'Item Name', 'Item Description', 'Scheme Payment Structure', 'Item Original Price', 'Scheme Unit Price', 'Discount on Scheme'];
        const valuesSectionB = [
            schemeInformation.itemIDToBeSchemed || 'N/A',
            schemeInformation.itemNameToBeSchemed || 'N/A',
            schemeInformation.itemDescriptionToBeSchemed || 'N/A',
            schemeInformation.schemePaymentStructure || 'N/A',
            formatCurrency(schemeInformation.itemToBeSchemedOriginalPrice) || 'N/A',
            formatCurrency(schemeInformation.schemeUnitPrice) || 'N/A',
            formatCurrency(schemeInformation.schemeDiscountWaved) || 'N/A',
        ];
        function drawSectionBCell(x, y, width, height, text, isHeader = false) {
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
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionB[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionB.forEach((header, index) => {
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxHeaderHeight, header, true);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxHeaderHeight;
        }
        ;
        function drawSectionBValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionB.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headerSectionB[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionB.forEach((value, index) => {
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxRowHeight;
        }
        ;
        drawSectionBHeaderRow();
        drawSectionBValuesRow();
        doc.moveDown(0.1);
        const headerSectionB2 = [69, 80, 60, 58, 80, 75, 75, 70];
        doc.y = tableYSectionB + 5;
        let tableYSectionB2 = doc.y + 5;
        const headingsSectionB2 = ['Scheme Status', 'Scheme To Run for (days)', 'Total Units Originally Schemed', 'UOM', 'Scheme Min. Security Deposit', 'Post Date Begins', 'Expected No. of Days to Deliver', 'Expected Delivery Date'];
        const valuesSectionB2 = [
            schemeInformation.schemeStatus || 'N/A',
            schemeInformation.schemeRunForHowLong || 'N/A',
            schemeInformation.totalUnitsAvailableForScheme || 'N/A',
            schemeInformation.schemeUnitOfMeasureName || 'N/A',
            formatCurrency(schemeInformation.schemeMinimumSecurityDeposit) || 'N/A',
            formatDateTime(schemeInformation.postDateBegins) || 'N/A',
            schemeInformation.expectedNoOfDaysToDeliver || 'N/A',
            formatDateTime(schemeInformation.expectedDeliveryDate) || 'N/A'
        ];
        function drawSectionB2Cell(x, y, width, height, text, isHeader = false) {
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
        function drawSectionB2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionB2[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionB2.forEach((header, index) => {
                drawSectionB2Cell(currentX, tableYSectionB2, headerSectionB2[index], maxHeaderHeight, header, true);
                currentX += headerSectionB2[index];
            });
            tableYSectionB2 += maxHeaderHeight;
        }
        ;
        function drawSectionB2ValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionB2.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headerSectionB2[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionB2.forEach((value, index) => {
                drawSectionB2Cell(currentX, tableYSectionB2, headerSectionB2[index], maxRowHeight, value);
                currentX += headerSectionB2[index];
            });
            tableYSectionB2 += maxRowHeight;
        }
        ;
        drawSectionB2HeaderRow();
        drawSectionB2ValuesRow();
        doc.moveDown(1);
        const headerSectionC = [42, 65, 47, 126, 72, 91, 49, 74];
        let tableYSectionC = doc.y + 20;
        doc.y = tableYSectionC;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Scheme Pool Details', contentX, doc.y, { underline: true });
        tableYSectionC = doc.y + 5;
        const headingsSectionC = ['Scheme Count', 'Scheme Trans ID', 'User ID', 'User Name', 'User Phone No.', 'Time Action Taken', 'Units Schemed', 'Deposited Amount'];
        const valuesSectionC = schemeInformation.schemePoolDetailsUpdate.map((schemePoolDetail) => [
            schemePoolDetail.schemeCount,
            schemePoolDetail.userSchemeTransID,
            schemePoolDetail.userIDWhoSuccessfullySchemed,
            schemePoolDetail.userNameWhoSuccessfullySchemed,
            schemePoolDetail.userPhoneNoWhoSuccessfullySchemed,
            schemePoolDetail.userDurationBeforeActionWasTaken,
            schemePoolDetail.userSchemedHowManyUnits,
            formatCurrency(schemePoolDetail.userAmountUserPaid),
        ]);
        function drawSectionCCell(x, y, width, height, text, isHeader = false) {
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
        function drawSectionCHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionC.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionC[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionC.forEach((header, index) => {
                drawSectionCCell(currentX, tableYSectionC, headerSectionC[index], maxHeaderHeight, header, true);
                currentX += headerSectionC[index];
            });
            tableYSectionC += maxHeaderHeight;
        }
        ;
        function drawSectionCValuesRow() {
            valuesSectionC.forEach((values) => {
                let currentX = tableX;
                let maxRowHeight = 0;
                values.forEach((value, index) => {
                    const safeValue = value !== undefined && value !== null ? value.toString() : 'N/A';
                    const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(safeValue, { width: headerSectionC[index] - 20, align: 'left', lineBreak: true });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
                });
                const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
                if (maxRowHeight > availableSpace) {
                    doc.addPage();
                    tableYSectionC = doc.page.margins.top;
                    drawSectionCHeaderRow();
                }
                values.forEach((value, index) => {
                    const safeValue = value !== undefined && value !== null ? value.toString() : 'N/A';
                    drawSectionCCell(currentX, tableYSectionC, headerSectionC[index], maxRowHeight, safeValue);
                    currentX += headerSectionC[index];
                });
                tableYSectionC += maxRowHeight;
            });
        }
        drawSectionCHeaderRow();
        drawSectionCValuesRow();
        doc.moveDown(0.5);
        const headerSectionD = [150, 415];
        doc.y = tableYSectionC + 30;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Total Units Available For Scheme', contentX, doc.y, { underline: true });
        doc.moveDown(0.2);
        let tableYSectionD = doc.y + 5;
        const headingsSectionD = ['Total Units Currently Available', 'Sum Total of Minimum Security Deposits'];
        const valuesSectionD = [
            schemeInformation.noOfUnitsAvailableAfterAUserSchemed || 'N/A',
            formatCurrency(schemeInformation.sumTotalAmountSecuritDepositsPaidByAllUsers) || 'N/A'
        ];
        function drawSectionDCell(x, y, width, height, text, isHeader = false) {
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
        function drawSectionDHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionD.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionD[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxHeaderHeight > availableSpace) {
                doc.addPage();
                tableYSectionD = doc.page.margins.top;
            }
            headingsSectionD.forEach((header, index) => {
                drawSectionDCell(currentX, tableYSectionD, headerSectionD[index], maxHeaderHeight, header, true);
                currentX += headerSectionD[index];
            });
            tableYSectionD += maxHeaderHeight;
        }
        function drawSectionDValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionD.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headerSectionD[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxRowHeight > availableSpace) {
                doc.addPage();
                tableYSectionD = doc.page.margins.top;
                drawSectionDHeaderRow();
            }
            valuesSectionD.forEach((value, index) => {
                drawSectionDCell(currentX, tableYSectionD, headerSectionD[index], maxRowHeight, value);
                currentX += headerSectionD[index];
            });
            tableYSectionD += maxRowHeight;
        }
        ;
        drawSectionDHeaderRow();
        drawSectionDValuesRow();
        doc.moveDown(3);
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        }
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default SchemeInformationPDFController;
