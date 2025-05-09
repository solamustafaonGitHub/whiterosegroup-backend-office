import fs from "fs";
import path from "path";
const { default: PDFDocument } = await import("pdfkit");
import * as url from 'url';
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import { StandardSaleInvoice } from "../models/standardSaleOrder.model.js";
import pkg from 'pdfkit';
const { x, y } = pkg;
;
;
;
;
;
;
export const StandardSaleInvoicePDFController = async (req, res) => {
    const standardSaleInvoiceId = req.params.id;
    try {
        const standardSI = await StandardSaleInvoice.findOne({ standardSaleInvoiceId });
        if (!standardSI) {
            return res.status(404).json({ error: "Standard Sales Invoice Not Found" });
        }
        const standardSaleInvoiceObject = standardSI.toObject();
        standardSaleInvoiceObject.StandardSaleInvoiceItemsGrandTotal = [
            {
                standardSaleInvoiceItemsGrandTotal: standardSaleInvoiceObject.StandardSaleInvoiceItems.reduce((total, item) => total + (item.standardSaleInvoiceTotalStartPrice || 0), 0)
            }
        ];
        standardSaleInvoiceObject.transformedRemittance = [];
        standardSaleInvoiceObject.StandardSaleInvoiceItems.forEach((item) => {
            if ('TotalRemittanceMadeSoFarOnStandardSaleInvoice' in item && item.TotalRemittanceMadeSoFarOnStandardSaleInvoice) {
                const transformed = item.TotalRemittanceMadeSoFarOnStandardSaleInvoice.map((remittance) => {
                    if (typeof remittance === 'object' && 'TotalPaymentsMadeSoFarOnStandardSaleInvoice' in remittance) {
                        return {
                            TotalPaymentsMadeSoFarOnStandardSaleInvoice: remittance.TotalPaymentsMadeSoFarOnStandardSaleInvoice?.toString() || '0',
                            remittanceDateOnStandardSaleInvoice: remittance.remittedDateOnStandardSaleInvoice ? new Date(remittance.remittedDateOnStandardSaleInvoice) : undefined,
                            remittanceAmountOnStandardSaleInvoice: parseFloat(remittance.remittedAmountOnStandardSaleInvoice?.toString() || '0'),
                            remittanceRemarksOnStandardSaleInvoice: remittance.remittedRemarksOnStandardSaleInvoice?.toString() || '',
                        };
                    }
                    else {
                        return null;
                    }
                }).filter(item => item !== null);
                standardSaleInvoiceObject.transformedRemittance.push(...transformed);
            }
        });
        const outputFilePath = path.resolve(`./pdfs/standardSI_${standardSaleInvoiceId}.pdf`);
        await generateStandardSaleInvoicePDF(outputFilePath, standardSaleInvoiceObject);
        res.download(outputFilePath, `StandardSaleInvoice_${standardSaleInvoiceId}.pdf`, (err) => {
            if (err) {
                console.error("Error during File Download:");
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Sale Invoice PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateStandardSaleInvoicePDF(outputFilePath, standardSI) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `StandardSaleInvoice_${standardSI.standardSaleInvoiceId || 'Unknown'}.pdf`;
    const filePath = path.join(__dirname, fileName);
    doc.pipe(fs.createWriteStream(filePath));
    try {
        const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
        try {
            const logo = fs.readFileSync(logoPath);
            doc.image(logo, 50, 50, { width: 60 });
        }
        catch (error) {
            console.error('Logo Not Found on Controller, Skipping Image Inclusion', error);
        }
        const logoWidth = 30;
        const spacingAfterLogo = 3;
        const textCompInfo = 80 + logoWidth + spacingAfterLogo;
        doc.font('Helvetica-Bold').fontSize(8.5).text('AssetLoop Nigeria Limited', textCompInfo, 50);
        doc.font('Helvetica').fontSize(8.5).text('8, Solomon Kuku Street, Ikeja GRA Lagos', textCompInfo, 60);
        doc.font('Helvetica').fontSize(8.5).text('info@asset360nigeria.com', textCompInfo, 71);
        doc.font('Helvetica').fontSize(8.5).text('+234 913 327 1208', textCompInfo, 83);
        doc.font('Helvetica').fontSize(8.5).text('_________________________________________________________________________________________', textCompInfo, 94);
        doc.moveDown(1);
        const detailsX = 30;
        const newYTextPosition = doc.y + 10;
        const userFullName = standardSI.standardSaleInvoiceUserProfileFullName || 'Unknown User';
        doc.font('Helvetica-Bold').fontSize(8.5).text(userFullName, detailsX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${standardSI.standardSaleInvoiceUserProfileEmail}`, detailsX, newYTextPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${standardSI.standardSaleInvoiceUserProfilePhoneNo}`, detailsX, newYTextPosition + 19);
        const addressYPosition = newYTextPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${standardSI.standardSaleInvoiceUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const saleInvoiceDate = standardSI.createdAt instanceof Date ? standardSI.createdAt.toDateString() : 'Unknown Date';
        doc.font('Helvetica').fontSize(8.5).text(`Standard Sale Invoice Date: ${saleInvoiceDate}`, titleX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Standard SaleInvoice ID:${standardSI.standardSaleInvoiceId}`, titleX, newYTextPosition + 9.5);
        doc.moveDown(7);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 10;
        const headersSectionA = [25, 36, 87, 85, 154, 40, 69, 69];
        doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, { underline: true });
        doc.moveDown(6);
        const headingsSectionA = ['S/N', 'Item ID', 'Item Code', 'Item Name', 'Item Description', 'No. of Units', 'Unit Price', 'Total Price'];
        const valuesSectionA = standardSI.StandardSaleInvoiceItems.map(item => [
            item.standardSaleCount || 'N/A',
            item.standardSaleInvoiceIntentID || 'N/A',
            item.standardSaleInvoiceItemCode || 'N/A',
            item.standardSaleInvoiceIntentItemName || 'N/A',
            item.standardSaleInvoiceIntentDesc || 'N/A',
            item.standardSaleInvoiceNoOfUnitBought?.toString() + ' ' + item.standardSaleInvoiceUnitOfMeasure || '0',
            formatCurrency(item.standardSaleInvoiceUnitPrice || 0),
            formatCurrency(item.standardSaleInvoiceTotalStartPrice || 0),
        ]);
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
            const padding = 5;
            doc.text(text, x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA.forEach((header, index) => {
                const textHeightSectionA = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, { width: headersSectionA[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeightSectionA + 10);
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
            valuesSectionA.forEach((row) => {
                row.forEach((value, index) => {
                    const textHeightSectionA = doc.font('Helvetica').fontSize(7.5)
                        .heightOfString(value.toString(), { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                    maxRowHeight = Math.max(maxRowHeight, textHeightSectionA + 10);
                });
                row.forEach((value, index) => {
                    drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                    currentX += headersSectionA[index];
                });
                tableY += maxRowHeight;
                currentX = tableX;
            });
        }
        ;
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(2);
        doc.y = tableY + 12;
        doc.font('Helvetica-Bold').fontSize(8).text('Transaction History', contentX, doc.y, { underline: true });
        tableY = doc.y;
        const headersSectionB = [75, 240, 80, 81, 88];
        const totalSectionBTableWidth = headersSectionB.reduce((sum, width) => sum + width, 0);
        const underlineSectionB = doc.y + 1;
        doc.moveTo(contentX, underlineSectionB).lineTo(contentX + totalSectionBTableWidth, underlineSectionB).stroke();
        tableY = underlineSectionB + 5;
        doc.y = tableY;
        const headingsSectionB = ['Transaction Date', 'Transaction Remarks', 'DR Amount', 'CR Amount', 'Ending Balance'];
        function drawSectionBHeaderCell(x, y, width, height, text, isHeader = false) {
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
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8).heightOfString(header, { width: headersSectionB[index] - 10, align: 'left' });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            headingsSectionB.forEach((header, index) => {
                drawSectionBHeaderCell(currentX, tableY, headersSectionB[index], maxHeaderHeight, header, true);
                currentX += headersSectionB[index];
            });
            tableY += maxHeaderHeight;
        }
        ;
        drawSectionBHeaderRow();
        function drawSectionBTransactionRows(values, event, standardSI, columnWidths, headersSectionB) {
            let currentX = tableX;
            let maxRowHeight = 0;
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(value || '', {
                    width: columnWidths[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 7);
            });
            const availableSpace = doc.page.height - tableY - doc.page.margins.bottom;
            if (maxRowHeight > availableSpace) {
                doc.addPage();
                tableY = doc.page.margins.top;
                drawSectionBHeaderRow();
            }
            values.forEach((value, index) => {
                if (index === 4 && typeof value === 'string' && value.includes('(')) {
                    doc.fillColor('red');
                }
                else {
                    doc.fillColor('black');
                }
                drawSectionBHeaderCell(currentX, tableY, columnWidths[index], maxRowHeight, value || '', false);
                currentX += columnWidths[index];
            });
            tableY += maxRowHeight;
            doc.fillColor('black');
        }
        function sortTransactionsByDateAndTime(standardSI) {
            const events = [];
            standardSI.StandardSaleInvoiceItems.forEach((item, itemIndex) => {
                item.PriceChangeOnStandardSaleInvoiceHistoryDetails?.forEach((detail) => {
                    events.push({
                        type: 'PriceChange',
                        date: new Date(detail.priceChangeOnStandardSaleInvoiceDate),
                        data: detail,
                        itemIndex,
                    });
                });
                item.PriceReverseAlertDetailsOnStandardSaleInvoice?.forEach((detail) => {
                    events.push({
                        type: 'LastCredit',
                        date: new Date(detail.standardSaleInvoiceReverseDate),
                        data: detail,
                        itemIndex,
                    });
                });
                item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice?.forEach((detail) => {
                    events.push({
                        type: 'Remittance',
                        date: new Date(detail.remitDateOnStandardSaleInvoice ||
                            detail.remitDateOnStandardSaleInvoice ||
                            detail.priceChangeOnStandardSaleInvoiceDate),
                        data: detail,
                        itemIndex,
                    });
                });
            });
            standardSI.TotalRemittanceMadeSoFarOnStandardSaleInvoice?.forEach((entry) => {
                events.push({
                    type: 'Remittance',
                    date: new Date(entry.remittedDateOnStandardSaleInvoice || entry.remitDateOnStandardSaleInvoice),
                    data: entry,
                });
            });
            const priority = {
                LastCredit: 0,
                PriceChange: 1,
                Remittance: 2,
            };
            events.sort((a, b) => {
                const timeDiff = a.date.getTime() - b.date.getTime();
                if (timeDiff !== 0)
                    return timeDiff;
                return (priority[a.type] ?? 99) - (priority[b.type] ?? 99);
            });
            return events;
        }
        function getRemittanceExpectedBalanceToBePaidOnSaleInvoice(standardSI) {
            let totalBalance = 0;
            standardSI.StandardSaleInvoiceItems.forEach((item) => {
                const balance = item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice?.[0]?.remittanceExpectedBalToBePaidStandardSaleInvoice;
                if (balance !== undefined) {
                    totalBalance += balance;
                }
            });
            return totalBalance !== 0 ? totalBalance.toString() : 'No Balance Available on Controller';
        }
        ;
        const addBalanceToPDF = (doc, value, x, y) => {
            if (value < 0) {
                doc.fillColor('red');
            }
            else {
                doc.fillColor('black');
            }
            ;
            const formattedValue = value < 0 ? `(${formatCurrency(value)})` : formatCurrency(value);
            doc.text(formattedValue, x, y);
        };
        function handleStandardPurchaseOrderForPDF(standardSI) {
            console.log(`Searching for Standard Sale Invoice with ID: ${standardSI.standardSaleInvoiceId}`);
            let cumulativeBalance = 0;
            let currentItemIndex = 0;
            const sortedEvents = sortTransactionsByDateAndTime(standardSI);
            sortedEvents.forEach((event) => {
                let rowValues = [];
                let shouldIncludeRow = true;
                switch (event.type) {
                    case 'PriceAtBookingPO': {
                        const currentItem = standardSI.StandardSaleInvoiceItems[currentItemIndex];
                        const itemPrice = parseFloat(currentItem.standardSaleInvoiceTotalStartPrice?.toString() || '0');
                        cumulativeBalance -= itemPrice;
                        rowValues = [
                            formatDateTime(event.data.priceChangeOnStandardSaleInvoiceDate),
                            event.data.priceChangeOnStandardSaleInvoiceRemarks ?? 'Price At Booking',
                            formatCurrency(itemPrice),
                            '',
                            formatCurrency(cumulativeBalance),
                        ];
                        currentItemIndex++;
                        break;
                    }
                    case 'LastCredit': {
                        const oldPrice = parseFloat(event.data.standardSaleInvoiceReverseOldPrice?.toString() || '0');
                        cumulativeBalance += oldPrice;
                        rowValues = [
                            formatDateTime(event.data.standardSaleInvoiceReverseDate),
                            event.data.standardSaleInvoiceReverseNewPriceAlertRemarks ?? 'Price Correction - Reversal',
                            '',
                            formatCurrency(oldPrice),
                            formatCurrency(cumulativeBalance),
                        ];
                        break;
                    }
                    case 'PriceChange': {
                        const newPrice = parseFloat(event.data.newTotalPriceAmountOnStandardSaleInvoice?.toString() || '0');
                        cumulativeBalance -= newPrice;
                        rowValues = [
                            formatDateTime(event.data.priceChangeOnStandardSaleInvoiceDate),
                            event.data.priceChangeOnStandardSaleInvoiceRemarks ?? 'Price Change',
                            formatCurrency(newPrice),
                            '',
                            formatCurrency(cumulativeBalance),
                        ];
                        break;
                    }
                    case 'Remittance': {
                        const remittedAmount = parseFloat(event.data.remittedAmountOnStandardSaleInvoice?.toString() || '0');
                        if (remittedAmount === 0) {
                            shouldIncludeRow = false;
                            break;
                        }
                        const remittanceDate = event.data.remittedDateOnStandardSaleInvoice || event.data.remitDateOnStandardSaleInvoice || event.data.priceChangeOnStandardSaleInvoiceDate;
                        const remarks = event.data.remittedRemarksOnStandardSaleInvoice || event.data.remittanceUpdateRemarksOnStandardSaleInvoice || 'Remittance';
                        cumulativeBalance += remittedAmount;
                        rowValues = [
                            formatDateTime(remittanceDate),
                            remarks,
                            '',
                            formatCurrency(remittedAmount),
                            formatCurrency(cumulativeBalance),
                        ];
                        break;
                    }
                    default:
                        console.warn('Unrecognized event type:', event.type);
                        shouldIncludeRow = false;
                }
                if (shouldIncludeRow) {
                    drawSectionBTransactionRows(rowValues, event, standardSI, headersSectionB, headersSectionB);
                }
            });
        }
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated On: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        ;
        handleStandardPurchaseOrderForPDF(standardSI);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default StandardSaleInvoicePDFController;
