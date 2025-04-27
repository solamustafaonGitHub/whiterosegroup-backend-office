import fs from "fs";
import path from "path";
const { default: PDFDocument } = await import("pdfkit");
import * as url from 'url';
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import { StandardPurchaseOrder } from '../models/standardPurchaseOrder.model.js';
;
;
import pkg from 'pdfkit';
const { x, y } = pkg;
;
;
;
;
export const StandardPurchaseOrderPDFController = async (req, res) => {
    const standardPurchaseOrderId = req.params.id;
    try {
        const standardPO = await StandardPurchaseOrder.findOne({ standardPurchaseOrderId });
        if (!standardPO) {
            return res.status(404).json({ error: "Standard Purchase Order Not Found" });
        }
        const standardPurchaseOrderObject = standardPO.toObject();
        standardPurchaseOrderObject.StandardPurchaseOrderItemsGrandTotal = [
            {
                standardPurchaseOrderItemsGrandTotal: standardPurchaseOrderObject.StandardPurchaseOrderItems.reduce((total, item) => total + (item.standardPurchaseOrderTotalStartPrice || 0), 0)
            }
        ];
        standardPurchaseOrderObject.transformedRemittance = [];
        standardPurchaseOrderObject.StandardPurchaseOrderItems.forEach((item) => {
            if ('TotalRemittanceMadeSoFarOnStandardPO' in item && item.TotalRemittanceMadeSoFarOnStandardPO) {
                const transformed = item.TotalRemittanceMadeSoFarOnStandardPO.map((remittance) => {
                    if (typeof remittance === 'object' && 'TotalPaymentsMadeSoFarOnStandardPO' in remittance) {
                        return {
                            TotalPaymentsMadeSoFarOnStandardPO: remittance.TotalPaymentsMadeSoFarOnStandardPO?.toString() || '0',
                            remittanceDateOnStandardPO: remittance.remittedDateOnStandardPO ? new Date(remittance.remittedDateOnStandardPO) : undefined,
                            remittanceAmountOnStandardPO: parseFloat(remittance.remittedAmountOnStandardPO?.toString() || '0'),
                            remittanceRemarksOnStandardPO: remittance.remittedRemarksOnStandardPO?.toString() || '',
                        };
                    }
                    else {
                        return null;
                    }
                }).filter(item => item !== null);
                standardPurchaseOrderObject.transformedRemittance.push(...transformed);
            }
        });
        const outputFilePath = path.resolve(`./pdfs/standardPO_${standardPurchaseOrderId}.pdf`);
        await generateStandardPurchaseOrderPDF(outputFilePath, standardPurchaseOrderObject);
        res.download(outputFilePath, `StandardPurchaseOrder_${standardPurchaseOrderId}.pdf`, (err) => {
            if (err) {
                console.error("Error during File Download:");
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Standard Purchase Order PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateStandardPurchaseOrderPDF(outputFilePath, standardPO) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `StandardPurchaseOrder_${standardPO.standardPurchaseOrderId || 'Unknown'}.pdf`;
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
        const userFullName = standardPO.standardPOrderUserProfileFullName || 'Unknown User';
        doc.font('Helvetica-Bold').fontSize(8.5).text(userFullName, detailsX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${standardPO.standardPOrderUserProfileEmail}`, detailsX, newYTextPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${standardPO.standardPOrderUserProfilePhoneNo}`, detailsX, newYTextPosition + 19);
        const addressYPosition = newYTextPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${standardPO.standardPOrderUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const purchaseOrderDate = standardPO.createdAt instanceof Date ? standardPO.createdAt.toDateString() : 'Unknown Date';
        doc.font('Helvetica').fontSize(8.5).text(`Standard Purchase Order Date: ${purchaseOrderDate}`, titleX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Standard Purchase Order ID:${standardPO.standardPurchaseOrderId}`, titleX, newYTextPosition + 9.5);
        doc.moveDown(7);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 10;
        const headersSectionA = [25, 36, 87, 85, 154, 40, 69, 69];
        doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, { underline: true });
        doc.moveDown(6);
        const headingsSectionA = ['S/N', 'Item ID', 'Item Code', 'Item Name', 'Item Description', 'No. of Units', 'Unit Price', 'Total Price'];
        const valuesSectionA = standardPO.StandardPurchaseOrderItems.map(item => [
            item.standardPurchaseOrderCount || 'N/A',
            item.standardPurchaseOrderIntentID || 'N/A',
            item.standardPurchaseOrderIntentItemCode || 'N/A',
            item.standardPurchaseOrderIntentItemName || 'N/A',
            item.standardPurchaseOrderIntentDesc || 'N/A',
            item.standardPurchaseOrderNoOfUnitBought?.toString() + ' ' + item.standardPurchaseOrderUnitOfMeasure || '0',
            formatCurrency(item.standardPurchaseOrderUnitPrice || 0),
            formatCurrency(item.standardPurchaseOrderTotalStartPrice || 0),
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
        function calculateBalance(event, standardPO) {
            if (!event || !event.type || !standardPO) {
                console.error('Invalid arguments: Event and Standard Purchase Order are required');
                return 0;
            }
            let totalBalance = 0;
            switch (event.type) {
                case 'Remittance': {
                    const matchingRemittance = standardPO.StandardPurchaseOrderItems
                        .flatMap((item) => item.RemittanceBalanceToBePaidDetailsOnStandardPO)
                        .find((remittance) => remittance.remitDateOnStandardPO && new Date(remittance.remitDateOnStandardPO).getTime() === new Date(event.data.remitDateOnStandardPO).getTime());
                    totalBalance = matchingRemittance?.endingBalanceAfterLastRemittanceOnStandardPO || 0;
                    break;
                }
                case 'LastCredit': {
                    const { purchaseOrderReverseDateOnStandardPO } = event.data;
                    const lastRemittance = standardPO.StandardPurchaseOrderItems
                        .flatMap((item) => 'TotalRemittanceMadeSoFarOnStandardPO' in item ? item.TotalRemittanceMadeSoFarOnStandardPO : [])
                        .filter((remittance) => remittance.remittedDateOnStandardPO && new Date(remittance.remittedDateOnStandardPO) < new Date(purchaseOrderReverseDateOnStandardPO))
                        .slice(-1)[0];
                    if (lastRemittance && typeof lastRemittance === 'object' && 'TotalPaymentsMadeSoFarOnStandardPO' in lastRemittance) {
                        totalBalance = parseFloat(lastRemittance.TotalPaymentsMadeSoFarOnStandardPO?.toString() || '0');
                    }
                    else {
                        totalBalance = 0;
                    }
                    break;
                }
                case 'PriceChange':
                case 'PriceAtBookingPO': {
                    totalBalance = event.data.cumulativeBalance || 0;
                    break;
                }
                default: {
                    console.warn('Unrecognized event type:', event.type);
                    break;
                }
            }
            return totalBalance;
        }
        function drawSectionBTransactionRows(values, event, standardPO, columnWidths, headersSectionB) {
            let currentX = tableX;
            let maxRowHeight = 0;
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
            const balance = calculateBalance(event, standardPO);
            const safeBalance = isNaN(balance) ? 0 : balance;
            const formattedBalance = formatCurrency(safeBalance);
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
                if (index === 4 && balance < 0) {
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
        function sortTransactionsByDateAndTime(standardPO) {
            const events = [];
            standardPO.StandardPurchaseOrderItems.forEach((item) => {
                if (item.PriceReverseAlertDetailsOnStandardPO) {
                    item.PriceReverseAlertDetailsOnStandardPO.forEach((detail) => {
                        events.push({ type: 'LastCredit', data: detail });
                    });
                }
                if (item.PriceChangeOnStandardPOHistoryDetails) {
                    item.PriceChangeOnStandardPOHistoryDetails.forEach((detail, index) => {
                        const eventType = index === 0 ? 'PriceAtBookingPO' : 'PriceChange';
                        events.push({ type: eventType, data: detail });
                    });
                }
                if (item.RemittanceBalanceToBePaidDetailsOnStandardPO) {
                    item.RemittanceBalanceToBePaidDetailsOnStandardPO.forEach((detail) => {
                        events.push({ type: 'Remittance', data: detail });
                    });
                }
            });
            events.sort((a, b) => {
                const dateA = a.data.priceChangeOnStandardPODate || a.data.standardPOReverseDate || a.data.remitDateOnStandardPO || 0;
                const dateB = b.data.priceChangeOnStandardPODate || b.data.standardPOReverseDate || b.data.remitDateOnStandardPO || 0;
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            });
            return events;
        }
        function getRemittanceExpectedBalanceToBePaidOnPO(standardPO) {
            let totalBalance = 0;
            standardPO.StandardPurchaseOrderItems.forEach((item) => {
                const balance = item.RemittanceBalanceToBePaidDetailsOnStandardPO?.[0]?.remittanceExpectedBalToBePaidStandardPO;
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
        function handleStandardPurchaseOrderForPDF(standardPO) {
            console.log(`Searching for Standard Purchase Order with ID: ${standardPO.standardPurchaseOrderId}`);
            let cumulativeBalance = 0;
            const sortedEvents = sortTransactionsByDateAndTime(standardPO);
            let currentItemIndex = 0;
            sortedEvents.forEach((event) => {
                let rowValues = [];
                let shouldIncludeRow = true;
                if (event.type === 'LastCredit') {
                    const { standardPOReverseDate, standardPOReverseNewPriceAlertRemarks, standardPOReverseOldPrice } = event.data;
                    const lastTotalRemittance = standardPO.StandardPurchaseOrderItems
                        .flatMap((item) => item.TotalRemittanceMadeSoFarOnStandardPO)
                        .filter((remittance) => remittance.remittedDateOnStandardPO && new Date(remittance.remittedDateOnStandardPO) < new Date(standardPOReverseDate))
                        .slice(-1)[0];
                    const creditAmount = parseFloat(lastTotalRemittance?.TotalPaymentsMadeSoFarOnStandardPO?.toString() || '0');
                    cumulativeBalance += creditAmount;
                    rowValues = [
                        formatDateTime(standardPOReverseDate),
                        standardPOReverseNewPriceAlertRemarks ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(standardPOReverseOldPrice?.toString() || '0')),
                        formatCurrency(cumulativeBalance),
                    ];
                }
                else if (event.type === 'PriceAtBookingPO' || event.type === 'PriceChange') {
                    const currentItem = standardPO.StandardPurchaseOrderItems[currentItemIndex];
                    cumulativeBalance += -(currentItem.standardPurchaseOrderTotalStartPrice) || 0;
                    event.data.cumulativeBalance = cumulativeBalance;
                    rowValues = [
                        formatDateTime(event.data.priceChangeOnStandardPODate),
                        event.data.priceChangeOnStandardPORemarks ?? 'N/A',
                        formatCurrency(parseFloat(event.data.newPriceAmountOnStandardPO?.toString() || '0')),
                        '',
                        formatCurrency(cumulativeBalance),
                    ];
                    currentItemIndex++;
                }
                else {
                    console.warn('Unrecognized event type:', event.type);
                }
                if (shouldIncludeRow) {
                    drawSectionBTransactionRows(rowValues, event, standardPO, headersSectionB, headersSectionB);
                }
            });
        }
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated On: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        ;
        handleStandardPurchaseOrderForPDF(standardPO);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default StandardPurchaseOrderPDFController;
