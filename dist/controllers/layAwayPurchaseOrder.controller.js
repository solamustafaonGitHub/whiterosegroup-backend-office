import fs from "fs";
import path from "path";
const { default: PDFDocument } = await import("pdfkit");
import * as url from 'url';
import { LayAwayPurchaseOrder } from "../models/layAwayPurchaseOrder.model.js";
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import pkg from 'pdfkit';
const { x, y } = pkg;
;
;
;
;
export const LayAwayPurchaseOrderPDFController = async (req, res) => {
    const layAwayPurchaseOrderId = req.params.id;
    try {
        const layAwayPO = await LayAwayPurchaseOrder.findOne({ layAwayPurchaseOrderId });
        if (!layAwayPO) {
            return res.status(404).json({ error: "LayAway Purchase Order Not Found" });
        }
        const layAwayPurchaseOrderObject = layAwayPO.toObject();
        if (layAwayPurchaseOrderObject.TotalRemittanceMadeSoFarOnLayAwayPO) {
            layAwayPurchaseOrderObject.transformedRemittance = layAwayPurchaseOrderObject.TotalRemittanceMadeSoFarOnLayAwayPO.map((item) => {
                if (typeof item === 'object' && 'TotalPaymentsMadeSoFarOnLayAwayPO' in item) {
                    return {
                        TotalPaymentsMadeSoFarOnLayAwayPO: item.TotalPaymentsMadeSoFarOnLayAwayPO?.toString() || '0',
                        remittanceDateOnLayAwayPO: item.remittedDateOnLayAwayPO ? new Date(item.remittedDateOnLayAwayPO) : undefined,
                        remittanceAmountOnLayAwayPO: parseFloat(item.remittedAmountOnLayAwayPO?.toString() || '0'),
                        remittanceRemarksOnLayAwayPO: item.remittedRemarksOnLayAwayPO?.toString() || '',
                    };
                }
                else {
                    return null;
                }
            }).filter(item => item !== null);
        }
        const outputFilePath = path.resolve(`./pdfs/layAwayPO_${layAwayPurchaseOrderId}.pdf`);
        await generateLayAwayPurchaseOrderPDF(outputFilePath, layAwayPurchaseOrderObject);
        res.download(outputFilePath, `LayAwayPurchaseOrder_${layAwayPurchaseOrderId}.pdf`, (err) => {
            if (err) {
                console.error("Error during File Download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Purchase Order PDF:");
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateLayAwayPurchaseOrderPDF(outputFilePath, layAwayPO) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `LayAwayPurchaseOrder_${layAwayPO.layAwayPurchaseOrderId || 'Unknown'}.pdf`;
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
        const userFullName = layAwayPO.layAwayPOrderUserProfileFullName || 'Unknown User';
        doc.font('Helvetica-Bold').fontSize(8.5).text(userFullName, detailsX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${layAwayPO.layAwayPOrderUserProfileEmail}`, detailsX, newYTextPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${layAwayPO.layAwayPOrderUserProfilePhoneNo}`, detailsX, newYTextPosition + 19);
        const addressYPosition = newYTextPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${layAwayPO.layAwayPOrderUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const purchaseOrderDate = layAwayPO.createdAt instanceof Date ? layAwayPO.createdAt.toDateString() : 'Unknown Date';
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order Date: ${purchaseOrderDate}`, titleX, newYTextPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order ID:${layAwayPO.layAwayPurchaseOrderId}`, titleX, newYTextPosition + 9.5);
        doc.moveDown(7);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 10;
        const headersSectionA = [43, 54, 87, 100, 183, 85];
        doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, { underline: true });
        doc.moveDown(6);
        const headingsSectionA = ['Item ID', 'No. of Units', 'Item Code', 'Item Name', 'Item Description', 'PO Subscription Type'];
        const valuesSectionA = [
            layAwayPO.layAwayPurchaseOrderIntentID || 'N/A',
            (layAwayPO.layAwayPurchaseOrderNoOfUnitBought?.toString() || 'N/A') + ' ' + (layAwayPO.layAwayPurchaseOrderUnitOfMeasure || 'N/A'),
            layAwayPO.layAwayPurchaseOrderIntentItemCode || 'N/A',
            layAwayPO.layAwayPurchaseOrderIntentItemName || 'N/A',
            layAwayPO.layAwayPurchaseOrderIntentDesc || 'N/A',
            layAwayPO.layAwayPurchaseOrderAssetSubscType || 'N/A'
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
        function calculateBalance(event, layAwayPO) {
            if (!event || !event.type || !layAwayPO) {
                console.error('Invalid arguments: Event & LayAway PurchaseOrder are required');
                return 0;
            }
            switch (event.type) {
                case 'Remittance': {
                    const matchingRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.find((remittance) => new Date(remittance.remitDateOnLayAwayPO).getTime() === new Date(event.data.remitDateOnLayAwayPO).getTime());
                    return matchingRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
                }
                case 'LastCredit': {
                    const { layAwayPurchaseOrderReverseDate } = event.data;
                    console.log("🔎 Last Price Change Date:", layAwayPurchaseOrderReverseDate);
                    const lastRemittanceBeforePriceChange = layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO
                        .filter(remittance => new Date(remittance.remittedDateOnLayAwayPO).getTime() < new Date(layAwayPurchaseOrderReverseDate).getTime())
                        .sort((a, b) => new Date(b.remittedDateOnLayAwayPO).getTime() - new Date(a.remittedDateOnLayAwayPO).getTime())[0];
                    const totalBeforePriceChange = parseFloat(lastRemittanceBeforePriceChange?.TotalPaymentsMadeSoFarOnLayAwayPO || '0');
                    console.log("🔎 Total Payments Before Price Change:", totalBeforePriceChange);
                    return totalBeforePriceChange;
                }
                case 'PriceChange': {
                    const { priceChangeOnLayAwayPODate } = event.data;
                    const matchingRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO
                        .filter(remittance => new Date(remittance.remitDateOnLayAwayPO).getTime() <= new Date(priceChangeOnLayAwayPODate).getTime())
                        .sort((a, b) => b.remitDateOnLayAwayPO.getTime() - a.remitDateOnLayAwayPO.getTime())[0];
                    return matchingRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
                }
                case 'PriceAtBookingPO': {
                    const initialPriceChange = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.find(remittance => remittance.isRemittanceAfterPriceChangeOnLayAwayPO);
                    return (initialPriceChange?.endingBalanceAfterLastRemittanceOnLayAwayPO ||
                        layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO[0]?.remittanceExpectedBalToBePaidOnLayAwayPO || 0);
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
        function sortTransactionsByDateAndTime(layAwayPO) {
            const events = [];
            if (layAwayPO.PriceChangeOnLayAwayPOHistoryDetails) {
                layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.forEach((detail, index) => {
                    const eventType = index === 0 ? 'PriceAtBookingPO' : 'PriceChange';
                    events.push({ type: eventType, data: detail });
                });
            }
            if (layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO) {
                layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.forEach((detail) => {
                    events.push({ type: 'Remittance', data: detail });
                });
            }
            if (layAwayPO.PriceReverseAlertDetailsOnLayAwayPO) {
                layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.forEach((detail) => {
                    events.push({ type: 'LastCredit', data: detail });
                });
            }
            const eventPriority = { 'PriceAtBookingPO': 1, 'LastCredit': 2, 'Remittance': 3, 'PriceChange': 4 };
            events.sort((a, b) => {
                const dateA = new Date(a.data.priceChangeOnLayAwayPODate || a.data.layAwayPurchaseOrderReverseDate || a.data.remitDateOnLayAwayPO || 0).getTime();
                const dateB = new Date(b.data.priceChangeOnLayAwayPODate || b.data.layAwayPurchaseOrderReverseDate || b.data.remitDateOnLayAwayPO || 0).getTime();
                if (dateA !== dateB) {
                    return dateA - dateB;
                }
                return eventPriority[a.type] - eventPriority[b.type];
            });
            return events;
        }
        ;
        function getRemittanceExpectedBalanceToBePaidOnPO(layAwayPO) {
            const balance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO?.[0]?.remittanceExpectedBalToBePaidOnLayAwayPO;
            return balance !== undefined ? balance.toString() : 'No Balance Available';
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
        function handleLayAwayPurchaseOrderForPDF(layAwayPO) {
            console.log(`🔍 Searching for LayAway Purchase Order with ID: ${layAwayPO.id}`);
            const remittanceExpectedBalance = getRemittanceExpectedBalanceToBePaidOnPO(layAwayPO);
            const sortedEvents = sortTransactionsByDateAndTime(layAwayPO);
            let runningBalance = 0;
            sortedEvents.forEach(event => {
                let rowValues = [];
                let shouldIncludeRow = true;
                if (event.type === 'LastCredit') {
                    const { layAwayPurchaseOrderReverseDate, layAwayPurchaseOrderReverseNewPriceAlertRemarks, layAwayPurchaseOrderReverseOldPrice } = event.data;
                    const totalBeforePriceChange = layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO
                        .filter(remittance => new Date(remittance.remittedDateOnLayAwayPO).getTime() < new Date(layAwayPurchaseOrderReverseDate).getTime())
                        .reduce((acc, remittance) => acc + parseFloat(remittance.TotalPaymentsMadeSoFarOnLayAwayPO || '0'), 0);
                    console.log("🔹 Total Payments Before Price Change (Used in PDF):", totalBeforePriceChange);
                    runningBalance = totalBeforePriceChange;
                    rowValues = [
                        formatDateTime(layAwayPurchaseOrderReverseDate),
                        layAwayPurchaseOrderReverseNewPriceAlertRemarks ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(layAwayPurchaseOrderReverseOldPrice?.toString() || '0')),
                        formatCurrency(runningBalance)
                    ];
                    addBalanceToPDF(doc, runningBalance, 100, 100);
                }
                else if (event.type === 'PriceAtBookingPO' || event.type === 'PriceChange') {
                    const { priceChangeOnLayAwayPODate, priceChangeOnLayAwayPORemarks, newPriceAmountOnLayAwayPO } = event.data;
                    rowValues = [
                        formatDateTime(priceChangeOnLayAwayPODate),
                        priceChangeOnLayAwayPORemarks ?? 'N/A',
                        formatCurrency(parseFloat(newPriceAmountOnLayAwayPO?.toString() || '0')),
                        '',
                        formatCurrency(runningBalance)
                    ];
                    addBalanceToPDF(doc, runningBalance, 100, 100);
                }
                else if (event.type === 'Remittance') {
                    const { remitDateOnLayAwayPO, remittanceUpdateRemarksOnLayAwayPO, remittedAmountCROnLayAwayPO, endingBalanceAfterLastRemittanceOnLayAwayPO } = event.data;
                    if (parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0') === 0) {
                        shouldIncludeRow = false;
                    }
                    runningBalance -= parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0');
                    rowValues = [
                        formatDateTime(remitDateOnLayAwayPO),
                        remittanceUpdateRemarksOnLayAwayPO ?? 'N/A',
                        '',
                        formatCurrency(parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0')),
                        formatCurrency(runningBalance)
                    ];
                    addBalanceToPDF(doc, runningBalance, 100, 100);
                }
                if (shouldIncludeRow) {
                    drawSectionBTransactionRows(rowValues, event, layAwayPO, headersSectionB, headersSectionB);
                }
            });
        }
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated On: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        }
        ;
        handleLayAwayPurchaseOrderForPDF(layAwayPO);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default LayAwayPurchaseOrderPDFController;
