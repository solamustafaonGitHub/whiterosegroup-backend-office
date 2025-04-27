import fs from "fs";
import path from "path";
const { default: PDFDocument } = await import("pdfkit");
import * as url from 'url';
import { PurchaseOrder } from "../models/purchaseOrder.model.js";
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import pkg from 'pdfkit';
const { x, y } = pkg;
;
;
;
;
export const PurchaseOrderPDFController = async (req, res) => {
    const purchaseOrderId = req.params.id;
    try {
        const purchaseOrder = await PurchaseOrder.findOne({ purchaseOrderId });
        if (!purchaseOrder) {
            return res.status(404).json({ error: "Purchase Order Not Found" });
        }
        const purchaseOrderObject = purchaseOrder.toObject();
        if (purchaseOrderObject.TotalRemittanceMadeSoFar) {
            purchaseOrderObject.transformedRemittance = purchaseOrderObject.TotalRemittanceMadeSoFar.map((item) => {
                if (typeof item === 'object' && 'TotalPaymentsMadeSoFar' in item) {
                    return {
                        TotalPaymentsMadeSoFar: item.TotalPaymentsMadeSoFar?.toString() || '0',
                        remittanceDate: item.remittedDate ? new Date(item.remittedDate) : undefined,
                        remittanceAmount: parseFloat(item.remittedAmount?.toString() || '0'),
                        remittanceRemarks: item.remittedRemarks?.toString() || '',
                    };
                }
                else {
                    return null;
                }
            }).filter(item => item !== null);
        }
        const outputFilePath = path.resolve(`./pdfs/purchaseOrder_${purchaseOrderId}.pdf`);
        await generatePurchaseOrderPDF(outputFilePath, purchaseOrderObject);
        res.download(outputFilePath, `PurchaseOrder_${purchaseOrderId}.pdf`, (err) => {
            if (err) {
                console.error("Error during File Download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Purchase Order PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generatePurchaseOrderPDF(outputFilePath, purchaseOrder) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `PurchaseOrder_${purchaseOrder.purchaseOrderId || 'Unknown'}.pdf`;
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
        const userFullName = purchaseOrder.pOrderUserProfileFullName || 'Unknown User';
        doc.font('Helvetica-Bold').fontSize(8.5).text(userFullName, detailsX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfileEmail}`, detailsX, newYTextPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfilePhoneNo}`, detailsX, newYTextPosition + 19);
        const addressYPosition = newYTextPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const purchaseOrderDate = purchaseOrder.createdAt instanceof Date ? purchaseOrder.createdAt.toDateString() : 'Unknown Date';
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order Date: ${purchaseOrderDate}`, titleX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order ID:${purchaseOrder.purchaseOrderId}`, titleX, newYTextPosition + 9.5);
        doc.moveDown(7);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 10;
        const headersSectionA = [43, 54, 87, 100, 183, 85];
        doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, { underline: true });
        doc.moveDown(6);
        const headingsSectionA = ['Item ID', 'No. of Units', 'Item Code', 'Item Name', 'Item Description', 'PO Subscription Type'];
        const valuesSectionA = [
            purchaseOrder.purchaseOrderIntentID || 'N/A',
            (purchaseOrder.purchaseOrderNoOfUnitBought?.toString() || 'N/A') + ' ' + (purchaseOrder.purchaseOrderUnitOfMeasure || 'N/A'),
            purchaseOrder.purchaseOrderIntentItemCode || 'N/A',
            purchaseOrder.purchaseOrderIntentItemName || 'N/A',
            purchaseOrder.purchaseOrderIntentDesc || 'N/A',
            purchaseOrder.purchaseOrderAssetSubscType || 'N/A'
        ];
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
            valuesSectionA.forEach((value, index) => {
                const textHeightSectionA = doc.font('Helvetica').fontSize(7.5).heightOfString(value, { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeightSectionA + 10);
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
        doc.moveDown(2);
        doc.y = tableY + 12;
        doc.font('Helvetica-Bold').fontSize(8).text('Transaction History', contentX, doc.y, { underline: true });
        tableY = doc.y;
        const headersSectionB = [75, 240, 75, 75, 85];
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
        function calculateBalance(event, purchaseOrder) {
            if (!event || !event.type || !purchaseOrder) {
                console.error('Invalid arguments: Event & PurchaseOrder are required');
                return 0;
            }
            switch (event.type) {
                case 'Remittance':
                    {
                        const matchingRemittance = purchaseOrder.RemittanceBalanceToBePaidDetails.find((remittance) => remittance.remitDateOnPO.getTime() === new Date(event.data.remitDateOnPO).getTime());
                        return matchingRemittance?.endingBalanceAfterLastRemittance || 0;
                    }
                    ;
                case 'LastCredit':
                    {
                        const { purchaseOrderReverseDate } = event.data;
                        const lastRemittance = purchaseOrder.TotalRemittanceMadeSoFar
                            .filter((remittance) => new Date(remittance.remittedDate) < new Date(purchaseOrderReverseDate))
                            .slice(-1)[0];
                        return parseFloat(lastRemittance?.TotalPaymentsMadeSoFar?.toString() || '0');
                    }
                    ;
                case 'PriceChange':
                    {
                        const { priceChangeOnPODate } = event.data;
                        const matchingRemittance = purchaseOrder.RemittanceBalanceToBePaidDetails
                            .filter((remittance) => new Date(remittance.remitDateOnPO) <= new Date(priceChangeOnPODate))
                            .sort((a, b) => b.remitDateOnPO.getTime() - a.remitDateOnPO.getTime())[0];
                        return matchingRemittance?.endingBalanceAfterLastRemittance || 0;
                    }
                    ;
                case 'PriceAtBookingPO': {
                    const initialPriceChange = purchaseOrder.RemittanceBalanceToBePaidDetails.find((remittance) => remittance.isRemittanceAfterPriceChange);
                    return (initialPriceChange?.endingBalanceAfterLastRemittance || purchaseOrder.RemittanceBalanceToBePaidDetails[0]?.remittanceExpectedBalToBePaidOnPO || 0);
                }
                default: {
                    console.warn('Unrecognized event type:', event.type);
                    return 0;
                }
            }
        }
        ;
        function drawSectionBTransactionRows(values, event, purchaseOrder, columnWidths, headersSectionB) {
            let currentX = tableX;
            let maxRowHeight = 0;
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
            ;
            const balance = calculateBalance(event, purchaseOrder);
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
        ;
        function sortTransactionsByDateAndTime(purchaseOrder) {
            const events = [];
            if (purchaseOrder.PurchaseOrderPriceReverseAlertDetails) {
                purchaseOrder.PurchaseOrderPriceReverseAlertDetails.forEach((detail) => {
                    events.push({ type: 'LastCredit', data: detail });
                });
            }
            if (purchaseOrder.PriceChangeOnPOHistoryDetails) {
                purchaseOrder.PriceChangeOnPOHistoryDetails.forEach((detail, index) => {
                    const eventType = index === 0 ? 'PriceAtBookingPO' : 'PriceChange';
                    events.push({ type: eventType, data: detail });
                });
            }
            if (purchaseOrder.RemittanceBalanceToBePaidDetails) {
                purchaseOrder.RemittanceBalanceToBePaidDetails.forEach((detail) => {
                    events.push({ type: 'Remittance', data: detail });
                });
            }
            events.sort((a, b) => {
                const dateA = a.data.priceChangeOnPODate || a.data.purchaseOrderReverseDate || a.data.remitDateOnPO || 0;
                const dateB = b.data.priceChangeOnPODate || b.data.purchaseOrderReverseDate || b.data.remitDateOnPO || 0;
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            });
            return events;
        }
        ;
        function getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder) {
            const balance = purchaseOrder.RemittanceBalanceToBePaidDetails?.[0]?.remittanceExpectedBalToBePaidOnPO;
            return balance !== undefined ? balance.toString() : 'No Balance Available on Controller';
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
        function handlePurchaseOrderForPDF(purchaseOrder) {
            console.log(`Searching for Purchase Order with ID on Controller: ${purchaseOrder.id}`);
            const remittanceExpectedBalance = getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder);
            const sortedEvents = sortTransactionsByDateAndTime(purchaseOrder);
            sortedEvents.forEach((event) => {
                let rowValues = [];
                let shouldIncludeRow = true;
                if (event.type === 'LastCredit') {
                    const { purchaseOrderReverseDate, purchaseOrderReverseNewPriceAlertRemarks, purchaseOrderReverseOldPrice } = event.data;
                    const lastTotalRemittance = purchaseOrder.TotalRemittanceMadeSoFar
                        .filter((remittance) => new Date(remittance.remittedDate) < new Date(purchaseOrderReverseDate))
                        .slice(-1)[0];
                    const balance = formatCurrency(parseFloat(lastTotalRemittance?.TotalPaymentsMadeSoFar || '0'));
                    addBalanceToPDF(doc, parseFloat(balance), 100, 100);
                    rowValues = [
                        formatDateTime(purchaseOrderReverseDate),
                        purchaseOrderReverseNewPriceAlertRemarks ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(purchaseOrderReverseOldPrice?.toString() || '0')),
                        balance
                    ];
                    addBalanceToPDF(doc, parseFloat(balance), 100, 100);
                }
                else if (event.type === 'PriceAtBookingPO' || event.type === 'PriceChange') {
                    const { priceChangeOnPODate, priceChangeOnPORemarks, newPriceAmountOnPO } = event.data;
                    const formattedBalance = formatCurrency(parseFloat(remittanceExpectedBalance));
                    rowValues = [
                        formatDateTime(priceChangeOnPODate),
                        priceChangeOnPORemarks ?? 'N/A',
                        formatCurrency(parseFloat(newPriceAmountOnPO?.toString() || '0')),
                        '',
                        formattedBalance,
                    ];
                    addBalanceToPDF(doc, parseFloat(formattedBalance), 100, 100);
                }
                else if (event.type === 'Remittance') {
                    const { remitDateOnPO, remittanceUpdateRemarksOnPO, remittedAmountCROnPO, endingBalanceAfterLastRemittance } = event.data;
                    if (parseFloat(remittedAmountCROnPO?.toString() || '0') === 0) {
                        shouldIncludeRow = false;
                    }
                    const formattedBalance = formatCurrency(parseFloat(endingBalanceAfterLastRemittance?.toString() || '0'));
                    rowValues = [
                        formatDateTime(remitDateOnPO),
                        remittanceUpdateRemarksOnPO ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(remittedAmountCROnPO?.toString() || '0')),
                        formattedBalance,
                    ];
                    addBalanceToPDF(doc, parseFloat(formattedBalance), 100, 100);
                }
                if (shouldIncludeRow) {
                    drawSectionBTransactionRows(rowValues, event, purchaseOrder, headersSectionB, headersSectionB);
                }
            });
        }
        ;
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        }
        ;
        handlePurchaseOrderForPDF(purchaseOrder);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default PurchaseOrderPDFController;
