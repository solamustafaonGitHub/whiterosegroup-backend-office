import fs from 'fs';
import path from 'path';
import * as url from 'url';
import PDFDocument from 'pdfkit';
;
async function generatePurchaseOrderPDF(purchaseOrderId, outputFilePath, purchaseOrder) {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const doc = new PDFDocument();
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
            console.error('Logo Not Found, Skipping Image Inclusion', error);
        }
        const logoWidth = 30;
        const spacing = 3;
        const textX = 80 + logoWidth + spacing;
        doc.font('Helvetica-Bold').fontSize(9).text('Assets360 Nigeria Limited', textX, 50);
        doc.font('Helvetica').fontSize(8.5).text('8, Solomon Kuku Street, Ikeja GRA Lagos', textX, 60);
        doc.font('Helvetica').fontSize(8.5).text('info@asset360nigeria.com', textX, 71);
        doc.font('Helvetica').fontSize(8.5).text('+234 913 327 1208', textX, 83);
        doc.text('_____________________________________________', { align: 'left' });
        doc.moveDown();
        const detailsX = 30;
        const newYPosition = doc.y + 10;
        doc.font('Helvetica-Bold').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfileFullName}`, detailsX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfileEmail}`, detailsX, newYPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfilePhoneNo}`, detailsX, newYPosition + 19);
        const addressYPosition = newYPosition + 40;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order Date:${purchaseOrder.createdAt.toDateString()}`, titleX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order ID:${purchaseOrder.purchaseOrderId}`, titleX, newYPosition + 9.5);
        doc.moveDown(5);
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 5;
        const columnWidth = [60, 100, 110, 180, 102];
        const totalTableWidth = columnWidth.reduce((sum, width) => sum + width, 0);
        doc.moveDown(3);
        const headings = ['No. of Units', 'Item Code', 'Item Name', 'Item Description', 'PO Subscription Type'];
        const values = [
            (purchaseOrder.purchaseOrderNoOfUnitBought?.toString() || 'N/A') + ' ' + (purchaseOrder.purchaseOrderUnitOfMeasure || 'N/A'),
            purchaseOrder.purchaseOrderIntentItemCode || 'N/A',
            purchaseOrder.purchaseOrderIntentItemName || 'N/A',
            purchaseOrder.purchaseOrderIntentDesc || 'N/A',
            purchaseOrder.purchaseOrderAssetSubscType || 'N/A'
        ];
        function drawSectionCCell(x, y, width, height, text, isHeader = false) {
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
            const padding = 5;
            doc.text(text, x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
            });
        }
        ;
        function drawSectionCHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headings.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, {
                    width: columnWidth[index] - 10,
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headings.forEach((header, index) => {
                drawSectionCCell(currentX, tableY, columnWidth[index], maxHeaderHeight, header, true);
                currentX += columnWidth[index];
            });
            tableY += maxHeaderHeight;
        }
        ;
        function drawSectionCValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidth[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            values.forEach((value, index) => {
                drawSectionCCell(currentX, tableY, columnWidth[index], maxRowHeight, value);
                currentX += columnWidth[index];
            });
            tableY += maxRowHeight;
        }
        ;
        drawSectionCHeaderRow();
        drawSectionCValuesRow();
        doc.moveDown(2);
        doc.y = tableY + 12;
        doc.font('Helvetica-Bold').fontSize(10).text('Transaction History', contentX, doc.y, { underline: true });
        doc.moveDown(0.2);
        tableY = doc.y;
        const columnWidths = [85, 260, 65, 65, 75];
        const totalTableWidths = columnWidths.reduce((sum, width) => sum + width, 0);
        const underlineY = doc.y + 1;
        doc.moveTo(contentX, underlineY)
            .lineTo(contentX + totalTableWidths, underlineY)
            .stroke();
        tableY = underlineY + 5;
        doc.y = tableY;
        let tableYSectionD = doc.y + 5;
        const headers = ['Transaction Date', 'Transaction Remarks', 'DR', 'CR', 'Balance'];
        function drawCell(x, y, width, height, text, isHeader = false) {
            if (width === undefined || height === undefined) {
                console.error("Undefined width or height in drawCell:", width, height);
                return;
            }
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
            const padding = 2.85;
            doc.text(text, x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
                baseline: 'top',
            });
        }
        ;
        function drawRow(values, columnWidths, rowY) {
            let currentX = tableX;
            let maxRowHeight = 0;
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidths[index] - 4,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight);
            });
            const availableHeight = doc.page.height - doc.page.margins.bottom - rowY;
            if (maxRowHeight > availableHeight) {
                doc.addPage();
                rowY = doc.page.margins.top;
            }
            values.forEach((value, index) => {
                drawCell(currentX, rowY, columnWidths[index], maxRowHeight, value);
                currentX += columnWidths[index];
            });
            return rowY + maxRowHeight;
        }
        ;
        function drawSectionDHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headers.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, {
                    width: columnWidths[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            headers.forEach((header, index) => {
                drawCell(currentX, tableY, columnWidths[index], maxHeaderHeight, header, true);
                currentX += columnWidths[index];
            });
            tableY += maxHeaderHeight;
        }
        ;
        function drawSectionDRow(values, event) {
            let currentX = tableX;
            let maxRowHeight = 0;
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
            function calculateBalance(event) {
                let balance;
                if (event.type === 'Remittance') {
                    const matchingRemittance = purchaseOrder.remittanceBalanceToBePaidDetails.find((remittance) => remittance.remitDateOnPO === event.data.remitDateOnPO);
                    if (matchingRemittance) {
                        balance = matchingRemittance.EndingBalanceAfterLastRemittance?.toString() || '';
                    }
                    else {
                        console.warn('Matching remittance not found for:', event.data.remitDateOnPO);
                        balance = 'N/A';
                    }
                }
                else if (event.type === 'LastCredit') {
                    const lastTotalPayment = purchaseOrder.totalRemittanceMadeSoFar?.[purchaseOrder.totalRemittanceMadeSoFar.length - 1]?.TotalPaymentsMadeSoFar || '';
                    balance = lastTotalPayment.toString();
                }
                else if (event.type === 'PriceChange') {
                    const priceChangeBalance = purchaseOrder.remittanceBalanceToBePaidDetails[0]?.RemittanceExpectedBalToBePaidOnPO || '';
                    balance = priceChangeBalance.toString();
                }
                else {
                    console.warn('Unrecognized event type:', event.type);
                    balance = '';
                }
                return balance;
            }
            ;
            const balance = calculateBalance(event);
            values[4] = balance;
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidths[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 5);
            });
            values.forEach((value, index) => {
                drawCell(currentX, tableY, columnWidths[index], maxRowHeight, value);
                currentX += columnWidths[index];
            });
            tableY += maxRowHeight;
        }
        ;
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
        function sortTransactionsByDateAndTime() {
            const events = [];
            if (purchaseOrder.purchaseOrderPriceReverseAlertDetails) {
                purchaseOrder.purchaseOrderPriceReverseAlertDetails.forEach((detail) => {
                    events.push({ type: 'LastCredit', data: detail });
                });
            }
            if (purchaseOrder.PriceChangeOnPOHistoryDetails) {
                purchaseOrder.PriceChangeOnPOHistoryDetails.forEach((detail) => {
                    events.push({ type: 'PriceChange', data: detail });
                });
            }
            if (purchaseOrder.remittanceBalanceToBePaidDetails) {
                purchaseOrder.remittanceBalanceToBePaidDetails.forEach((detail) => {
                    events.push({ type: 'Remittance', data: detail });
                });
            }
            events.sort((a, b) => {
                const dateA = a.data.priceChangeOnPODate || a.data.purchaseOrderReverseDate || a.data.remitDateOnPO;
                const dateB = b.data.priceChangeOnPODate || b.data.purchaseOrderReverseDate || b.data.remitDateOnPO;
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            });
            return events;
        }
        function getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder) {
            if (!purchaseOrder.remittanceBalanceToBePaidDetails || purchaseOrder.remittanceBalanceToBePaidDetails.length === 0) {
                console.warn("Warning: remittanceBalanceToBePaidDetails is missing or empty.");
                return "No Balance Available";
            }
            const balance = purchaseOrder.remittanceBalanceToBePaidDetails[0]?.RemittanceExpectedBalToBePaidOnPO;
            if (balance === undefined) {
                console.warn("Warning: RemittanceExpectedBalToBePaidOnPO is undefined.");
                return "No Balance Available";
            }
            return balance.toString();
        }
        function handlePurchaseOrderForPDF(purchaseOrder) {
            console.log(`Searching for Purchase Order with ID: ${purchaseOrder.id}`);
            const remittanceExpectedBalance = getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder);
            const sortedEvents = sortTransactionsByDateAndTime();
            drawSectionDHeaderRow();
            sortedEvents.forEach((event) => {
                let rowValues = [];
                if (event.type === 'PriceChange') {
                    const { priceChangeOnPODate, priceChangeOnPORemarks, newPriceAmountOnPO } = event.data;
                    rowValues = [
                        formatDateTime(priceChangeOnPODate),
                        priceChangeOnPORemarks ?? 'N/A',
                        newPriceAmountOnPO?.toString() ?? '',
                        '',
                        remittanceExpectedBalance
                    ];
                }
                else if (event.type === 'LastCredit') {
                    const { purchaseOrderReverseDate, purchaseOrderReverseNewPriceAlertRemarks, purchaseOrderReverseNewPriceAlert } = event.data;
                    rowValues = [
                        formatDateTime(purchaseOrderReverseDate),
                        purchaseOrderReverseNewPriceAlertRemarks ?? 'N/A',
                        '',
                        purchaseOrderReverseNewPriceAlert?.toString() ?? '',
                        remittanceExpectedBalance
                    ];
                }
                else if (event.type === 'Remittance') {
                    const { remitDateOnPO, remittanceUpdateRemarksOnPO, remittedAmountCROnPO, EndingBalanceAfterLastRemittance } = event.data;
                    rowValues = [
                        formatDateTime(remitDateOnPO),
                        remittanceUpdateRemarksOnPO ?? 'N/A',
                        '',
                        remittedAmountCROnPO?.toString() ?? '',
                        EndingBalanceAfterLastRemittance?.toString() ?? ''
                    ];
                }
                ;
                if (event.type === 'Remittance' && event.data.remittedAmountCROnPO !== 0) {
                    console.log("Row Values:", rowValues);
                    drawSectionDRow(rowValues, event);
                }
                else if (event.type !== 'Remittance') {
                    console.log("Row Values:", rowValues);
                    drawSectionDRow(rowValues, event);
                }
            });
        }
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        }
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
        await generatePurchaseOrderPDF('YourPurchaseOrderId', './path/to/output.pdf', purchaseOrder);
    }
    catch (error) {
        console.error('Error Generating PDF:', error);
    }
}
;
export { generatePurchaseOrderPDF };
