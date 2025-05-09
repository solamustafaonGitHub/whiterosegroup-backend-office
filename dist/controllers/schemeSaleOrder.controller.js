import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import * as url from 'url';
import { SchemeSaleOrder } from "../models/schemeSaleOrder.model.js";
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import addFormatToCurrencyInThePDF from '../utils/addFormatToCurrency.utils.js';
import pkg from 'pdfkit';
const { x, y } = pkg;
export const SchemeSaleOrderPDFController = async (req, res) => {
    console.log("Received Request Params:", req.params);
    const userSchemeTransactionID = req.params.id;
    console.log("Received Scheme Order Transaction ID:", userSchemeTransactionID);
    try {
        const schemeSO = await SchemeSaleOrder.findOne({ userSchemeTransactionID });
        if (!schemeSO) {
            return res.status(404).json({ error: "Scheme Sale Order Information Not Found" });
        }
        const schemeSaleOrderObject = schemeSO.toObject();
        const outputFilePath = path.resolve(`./pdfs/schemeSO_${userSchemeTransactionID}.pdf`);
        await generateSchemeSaleOderPDF(outputFilePath, schemeSaleOrderObject);
        res.download(outputFilePath, `SchemeSaleOrder_${userSchemeTransactionID}.pdf`, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateSchemeSaleOderPDF(outputFilePath, schemeSO) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `SchemeSaleOrder_${schemeSO.userSchemeTransactionID || 'Unknown'}.pdf`;
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
        doc.font('Helvetica-Bold').fontSize(8.5).text(`${schemeSO.userFullNameRequiringScheme} (${schemeSO.userIdRequiringScheme})`, detailsX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${schemeSO.userEmailRequiringScheme}`, detailsX, newYPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${schemeSO.userPhoneNoRequiringScheme}`, detailsX, newYPosition + 19);
        const addressYPosition = newYPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${schemeSO.userDeliveryAddressRequiringScheme}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        doc.font('Helvetica').fontSize(8.5).text(`Scheme Sale Order Date:${schemeSO.createdAt.toDateString()}`, titleX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Scheme Sale Order ID:${schemeSO.userSchemeTransactionID}`, titleX, newYPosition + 9.5);
        doc.moveDown(5);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;
        const headersSectionA = [60, 97, 177, 63, 70, 90];
        const headings = ['Scheme ID', 'Scheme Name', 'Scheme Short Desc.', 'Item Original Price', 'Scheme Unit Price', 'Scheme Payment Structure'];
        const values = [
            schemeSO.schemeIDUserSchemed || 'N/A',
            schemeSO.schemeNameUserSchemed || 'N/A',
            schemeSO.schemeShortDescUserSchemed || 'N/A',
            formatCurrency(schemeSO.schemeItemOriginalPriceUserSchemed) || 'N/A',
            formatCurrency(schemeSO.schemeUnitPriceUserSchemed) || 'N/A',
            schemeSO.schemePaymentStructureUserSchemed || 'N/A'
        ];
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
            });
        }
        ;
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headings.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header.toString(), {
                    width: headersSectionA[index] - 10,
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headings.forEach((header, index) => {
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
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), {
                    width: headersSectionA[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
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
        doc.moveDown(0.1);
        const headerSectionA2 = [82, 82, 65, 83, 83, 75, 86];
        doc.y = tableY + 7;
        let tableYSectionA2 = doc.y + 1;
        const headingsSectionA2 = ['Scheme Start Date', 'Scheme End Date', 'Min. Sec Deposit', 'Bal.Pyt Due Date', 'Scheme Post Date Begins', 'Expected No .of Days To Deliver', 'Expected Delivery Date'];
        const valuesSectionA2 = [
            schemeSO.schemeUserSchemedStartDate || 'N/A',
            schemeSO.schemeUserSchemedEndDate || 'N/A',
            formatCurrency(schemeSO.userSchemeMinimumSecurityDeposit) || 'N/A',
            schemeSO.schemePaymentDueDate || 'N/A',
            schemeSO.shemeUserSchemedPostDateBegins || 'N/A',
            schemeSO.expectedNoOfDaysToDeliver || 'N/A',
            schemeSO.expectedDeliveryDate || 'N/A'
        ];
        function drawSectionA2Cell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
            });
        }
        ;
        function drawSectionA2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header.toString(), {
                    width: headerSectionA2[index] - 10,
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionA2.forEach((header, index) => {
                drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxHeaderHeight, header, true);
                currentX += headerSectionA2[index];
            });
            tableYSectionA2 += maxHeaderHeight;
        }
        ;
        function drawSectionA2ValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionA2.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), {
                    width: headerSectionA2[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionA2.forEach((value, index) => {
                drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxRowHeight, value);
                currentX += headerSectionA2[index];
            });
            tableYSectionA2 += maxRowHeight;
        }
        ;
        drawSectionA2HeaderRow();
        drawSectionA2ValuesRow();
        doc.moveDown(10);
        const headerSectionB = [65, 65, 122, 150, 76, 76];
        doc.y = tableY + 115;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Schemed Item Information', contentX, doc.y, { underline: true });
        let tableYSectionB2 = doc.y + 5;
        const headersSectionB = ['No. of Units', 'Item ID', 'Item Name', 'Item Description', 'Item Unit Price', 'Total Price'];
        const valuesSectionB = [
            schemeSO.schemeNoOfUnitsUserSchemed + ' ' + schemeSO.schemeItemUnitOfMeasure || 'N/A',
            schemeSO.schemeItemIDUserSchemed || 'N/A',
            schemeSO.schemeItemNameUserSchemed || 'N/A',
            schemeSO.schemeItemShortDescUserSchemed || 'N/A',
            formatCurrency(schemeSO.schemeUnitPriceUserSchemed) || 'N/A',
            formatCurrency(schemeSO.schemeTotalAmountUserSchemed) || 'N/A'
        ];
        function drawSectionB2Cell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
            });
        }
        ;
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headersSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, {
                    width: headerSectionB[index] - 10,
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headersSectionB.forEach((header, index) => {
                drawSectionB2Cell(currentX, tableYSectionB2, headerSectionB[index], maxHeaderHeight, header, true);
                currentX += headerSectionB[index];
            });
            tableYSectionB2 += maxHeaderHeight;
        }
        ;
        function drawSectionBValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionB.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), {
                    width: headerSectionB[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionB.forEach((value, index) => {
                drawSectionB2Cell(currentX, tableYSectionB2, headerSectionB[index], maxRowHeight, value);
                currentX += headerSectionB[index];
            });
            tableYSectionB2 += maxRowHeight;
        }
        ;
        drawSectionBHeaderRow();
        drawSectionBValuesRow();
        doc.moveDown(0.1);
        doc.y = tableYSectionB2 + 10;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Transaction History', contentX, doc.y, { underline: true });
        tableY = doc.y;
        const headersSectionB2 = [75, 241, 75, 75, 87];
        const totalSectionB2TableWidth = headersSectionB2.reduce((sum, width) => sum + width, 0);
        const underlineSectionB2 = doc.y + 1;
        doc.moveTo(contentX, underlineSectionB2).lineTo(contentX + totalSectionB2TableWidth, underlineSectionB2).stroke();
        tableY = underlineSectionB2 + 5;
        doc.y = tableY;
        const headingsSectionB2 = ['Transaction Date', 'Transaction Remarks', 'DR Amount', 'CR Amount', 'Ending Balance'];
        function drawSectionB2HeaderCell(x, y, width, height, text, isHeader = false) {
            if (text) {
                doc.rect(x, y, width, height).stroke();
            }
            else {
                doc.moveTo(x, y).lineTo(x + width, y).stroke();
                doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke();
            }
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
            const padding = 5;
            doc.text(text, x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionB2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8).heightOfString(header, { width: headersSectionB2[index] - 10, align: 'left' });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            headingsSectionB2.forEach((header, index) => {
                drawSectionB2HeaderCell(currentX, tableY, headersSectionB2[index], maxHeaderHeight, header, true);
                currentX += headersSectionB2[index];
            });
            tableY += maxHeaderHeight;
        }
        ;
        drawSectionB2HeaderRow();
        function calculateSchemeBalance(event, schemeSO) {
            if (!event || !event.type || !schemeSO) {
                console.error('Invalid Event or Scheme Sale Order Information Provided');
                return 0;
            }
            switch (event.type) {
                case 'BookScheme': {
                    const schemePaymentBalanceAtBooking = schemeSO.RemittanceBalanceToBePaidDetails.find((bookScheme) => bookScheme.isRemittanceForSchemeFirstPayment);
                    return (schemePaymentBalanceAtBooking?.remittanceExpectedBalToBePaidOnScheme ?? schemeSO.RemittanceBalanceToBePaidDetails[0]?.remittanceExpectedBalToBePaidOnScheme ?? 0);
                }
                case 'FirstRemittanceSchemeUponBooking': {
                    const firstRemittanceUponBooking = schemeSO.RemittanceBalanceToBePaidDetails.find((firstRemittancePayment) => firstRemittancePayment.isRemittanceForSchemeFirstPayment);
                    return (firstRemittanceUponBooking?.endingBalanceAfterLastRemittanceOnScheme ?? schemeSO.RemittanceBalanceToBePaidDetails[0]?.endingBalanceAfterLastRemittanceOnScheme ?? 0);
                }
                case 'SubsequentRemittance': {
                    const remittanceEntries = schemeSO.RemittanceBalanceToBePaidDetails.filter((remittanceScheme) => new Date(remittanceScheme.remitDateOnScheme).getTime() === new Date(event.data.remitDateOnScheme).getTime());
                    const latestRemittance = remittanceEntries.length > 0 ? remittanceEntries[remittanceEntries.length - 1] : null;
                    return latestRemittance?.endingBalanceAfterLastRemittanceOnScheme ?? 0;
                }
                default: {
                    console.error('Unrecognized Event Type:', event.type);
                    return 0;
                }
            }
        }
        ;
        function drawSectionB2TransactionRows(values, event, schemeSaleOrder, columnWidths, headersSectionB2) {
            let currentX = tableX;
            let maxRowHeight = 0;
            if (event.type === 'RemittanceScheme' && parseFloat(values[3]) === 0) {
                console.log('Skipping row due to zero remittance amount');
                return;
            }
            let balance = parseFloat(values[4]) || calculateSchemeBalance(event, schemeSaleOrder);
            const safeSchemeBalance = isNaN(balance) ? 0 : balance;
            const formattedBalance = formatCurrency(safeSchemeBalance);
            values[4] = formattedBalance;
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(value || '', { width: columnWidths[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 7);
            });
            const availableSpace = doc.page.height - tableY - doc.page.margins.bottom;
            if (maxRowHeight > availableSpace) {
                doc.addPage();
                tableY = doc.page.margins.top;
                drawSectionBHeaderRow();
            }
            values.forEach((value, index) => {
                if (index === 4 && safeSchemeBalance < 0) {
                    doc.fillColor('red');
                }
                else {
                    doc.fillColor('black');
                }
                drawSectionB2HeaderCell(currentX, tableY, columnWidths[index], maxRowHeight, value || '', false);
                currentX += columnWidths[index];
            });
            tableY += maxRowHeight;
            doc.fillColor('black');
        }
        const sortSchemeEvents = (schemeSaleOrder) => {
            const events = [];
            console.log("🔍 Sorted Events:", events);
            if (schemeSaleOrder.StatingBalanceOnSchemeHistory) {
                schemeSaleOrder.StatingBalanceOnSchemeHistory.forEach((detail) => {
                    events.push({ type: 'BookScheme', data: detail });
                });
            }
            if (schemeSaleOrder.RemittanceBalanceToBePaidDetails) {
                const sortedRemittanceHistory = schemeSaleOrder.RemittanceBalanceToBePaidDetails.sort((a, b) => new Date(a.remitOnSchemeDate).getTime() - new Date(b.remitOnSchemeDate).getTime());
                sortedRemittanceHistory.forEach((detail, index) => {
                    if (index === 0) {
                        events.push({ type: 'FirstRemittanceSchemeUponBooking', data: detail });
                    }
                    else {
                        events.push({ type: 'SubsequentRemittance', data: detail });
                    }
                });
            }
            return events;
        };
        function getRemittanceExpectedBalanceToBePaidOnScheme(userScheme) {
            if (!userScheme.RemittanceBalanceToBePaidDetails || userScheme.RemittanceBalanceToBePaidDetails.length === 0) {
                return 'No Balance Available';
            }
            const balanceHistory = userScheme.RemittanceBalanceToBePaidDetails;
            const latestBalance = balanceHistory[balanceHistory.length - 1]?.endingBalanceAfterLastRemittanceOnScheme;
            return latestBalance !== undefined ? latestBalance.toString() : 'No Balance Available';
        }
        ;
        function handleSchemeInformationForPDF(schemeSaleOrder) {
            console.log(`Searching for UserScheme ID: ${schemeSaleOrder.userSchemeTransactionID}`);
            const sortEvents = sortSchemeEvents(schemeSaleOrder);
            let currentPage = doc.page;
            let tableY = tableX + 50;
            sortEvents.forEach((event) => {
                let rowValues = [];
                let shouldIncludeRow = true;
                if (event.type === 'BookScheme') {
                    const { startSchemeDate, startingBalanceRemarksOnScheme, startingBalanceOnScheme } = event.data;
                    const getStartBalance = formatCurrency(parseFloat(startingBalanceOnScheme?.toString() || '0'));
                    const firstRemittance = schemeSaleOrder.RemittanceBalanceToBePaidDetails[0];
                    const initialBalance = firstRemittance?.remittanceExpectedBalToBePaidOnScheme || 0;
                    rowValues = [
                        formatDateTime(startSchemeDate) ?? 'N/A',
                        startingBalanceRemarksOnScheme ?? 'N/A',
                        getStartBalance,
                        '',
                        initialBalance
                    ];
                    addFormatToCurrencyInThePDF(doc, parseFloat(getStartBalance), 100, 100);
                }
                else if (event.type === 'FirstRemittanceSchemeUponBooking') {
                    const { remitOnSchemeDate, remitOnSchemeRemarks, remittedAmountCROnScheme, endingBalanceAfterLastRemittanceOnScheme } = event.data;
                    const getRemittanceBalanceDue = parseFloat(endingBalanceAfterLastRemittanceOnScheme?.toString() || '0');
                    console.log('Get Remittance Balance Due', getRemittanceBalanceDue);
                    rowValues = [
                        formatDateTime(remitOnSchemeDate) ?? 'N/A',
                        remitOnSchemeRemarks ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(remittedAmountCROnScheme?.toString() || '0')),
                        getRemittanceBalanceDue
                    ];
                    addFormatToCurrencyInThePDF(doc, parseFloat(getRemittanceBalanceDue.toString()), 100, 100);
                }
                else if (event.type === 'SubsequentRemittance') {
                    const { remitOnSchemeDate, remitOnSchemeRemarks, remittedAmountCROnScheme, endingBalanceAfterLastRemittanceOnScheme } = event.data;
                    const getRemittanceDueUponSubsequentRemittance = parseFloat(endingBalanceAfterLastRemittanceOnScheme?.toString() || '0');
                    console.log('Get Remittance Upon Subsequent Remittance:', getRemittanceDueUponSubsequentRemittance);
                    rowValues = [
                        formatDateTime(remitOnSchemeDate) ?? 'N/A',
                        remitOnSchemeRemarks ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(remittedAmountCROnScheme?.toString() || '0')),
                        getRemittanceDueUponSubsequentRemittance
                    ];
                }
                if (shouldIncludeRow) {
                    drawSectionB2TransactionRows(rowValues, event, schemeSaleOrder, headersSectionB2, headersSectionB2);
                }
            });
        }
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        ;
        handleSchemeInformationForPDF(schemeSO);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error('Error Including Logo:', error);
    }
    console.log('PDF Generation Completed:', filePath);
}
;
export default SchemeSaleOrderPDFController;
