"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePurchaseOrderPDF = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url = __importStar(require("url"));
const pdfkit_1 = __importDefault(require("pdfkit"));
;
// Function to generate the PDF
async function generatePurchaseOrderPDF(purchaseOrderId, outputFilePath, purchaseOrder) {
    const __dirname = path_1.default.dirname(url.fileURLToPath(import.meta.url));
    const doc = new pdfkit_1.default();
    const fileName = `PurchaseOrder_${purchaseOrder.purchaseOrderId || 'Unknown'}.pdf`;
    const filePath = path_1.default.join(__dirname, fileName);
    doc.pipe(fs_1.default.createWriteStream(filePath));
    // Add Company Logo
    try {
        const logoPath = path_1.default.resolve(__dirname, '../images/asset360LogoPP.png');
        try {
            const logo = fs_1.default.readFileSync(logoPath);
            doc.image(logo, 50, 50, { width: 60 });
        }
        catch (error) {
            console.error('Logo Not Found, Skipping Image Inclusion', error);
        }
        const logoWidth = 30; // Assuming the logo width is 100, you can adjust this
        const spacing = 3; // Add some spacing between the logo and text
        const textX = 80 + logoWidth + spacing; // Set the X position for the text to be after the logo
        //Add Company Information beside the logo
        doc.font('Helvetica-Bold').fontSize(9).text('Assets360 Nigeria Limited', textX, 50); // Position text beside the logo
        doc.font('Helvetica').fontSize(8.5).text('8, Solomon Kuku Street, Ikeja GRA Lagos', textX, 60);
        doc.font('Helvetica').fontSize(8.5).text('info@asset360nigeria.com', textX, 71);
        doc.font('Helvetica').fontSize(8.5).text('+234 913 327 1208', textX, 83);
        doc.text('_____________________________________________', { align: 'left' });
        doc.moveDown();
        //User Information & Purchase Order Details below the company info begin here
        const detailsX = 30; //Manually adjust Y position to create space between sections , far left for the details
        const newYPosition = doc.y + 10; // Add 50 units of space after the company info (you can adjust this value). Adjust this value to control the space between sections
        // Add Purchase Order Details on the far left
        doc.font('Helvetica-Bold').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfileFullName}`, detailsX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfileEmail}`, detailsX, newYPosition + 9);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserProfilePhoneNo}`, detailsX, newYPosition + 19);
        // Add some extra spacing before "Delivery Address"
        const addressYPosition = newYPosition + 40; // Adjust this value to increase space
        doc.font('Helvetica-Bold').fontSize(8.5).text('Delivery Address:', detailsX, addressYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`${purchaseOrder.pOrderUserDeliveryAddress}`, detailsX, addressYPosition + 9.5);
        doc.moveDown(5);
        // Calculate the far-right position for the title based on the A4 portrait page width
        const pageWidth = 595.28; // A4 width in points
        const rightMargin = 15; // Add some right margin to the page
        const offset = 250; // Adjusted offset based on the approximate text width
        const titleX = pageWidth - rightMargin - offset; // Shift the content further left
        // Add Purchase Order Date & Purchase Order ID on the far right
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order Date:${purchaseOrder.createdAt.toDateString()}`, titleX, newYPosition);
        doc.font('Helvetica').fontSize(8.5).text(`Purchase Order ID:${purchaseOrder.purchaseOrderId}`, titleX, newYPosition + 9.5);
        doc.moveDown(5);
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        // Section C: Title for the main content
        const contentX = detailsX; //Set the left margin for the main content, same as 'Add Purchase Order Details'. Reuse the same X position for consistency. 
        // Define the starting position and dimensions for the table (Table Configuration)
        const tableX = contentX; // Left margin for the table (same as contentX)
        let tableY = doc.y + 5; // Start from the current Y position
        const columnWidth = [60, 100, 110, 180, 102]; // Width of each column
        // Calculate total table width
        const totalTableWidth = columnWidth.reduce((sum, width) => sum + width, 0);
        doc.moveDown(3); // Add some space between the details and the table
        // Define headings & their corresponding values
        const headings = ['No. of Units', 'Item Code', 'Item Name', 'Item Description', 'PO Subscription Type'];
        const values = [
            (purchaseOrder.purchaseOrderNoOfUnitBought?.toString() || 'N/A') + ' ' + (purchaseOrder.purchaseOrderUnitOfMeasure || 'N/A'),
            purchaseOrder.purchaseOrderIntentItemCode || 'N/A',
            purchaseOrder.purchaseOrderIntentItemName || 'N/A',
            purchaseOrder.purchaseOrderIntentDesc || 'N/A',
            purchaseOrder.purchaseOrderAssetSubscType || 'N/A'
        ];
        // Function to draw a cell with borders, with left & middle alignment for the text
        function drawSectionCCell(x, y, width, height, text, isHeader = false) {
            // Draw the cell border
            doc.rect(x, y, width, height).stroke();
            // Set font style
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
            // Draw the text inside the cell with more padding
            const padding = 5; // Adjust padding for top and left (2 inches is excessive; using 10 units instead)
            doc.text(text, x + padding, y + padding, {
                width: width - padding * 2,
                align: 'left',
                lineBreak: true,
            });
        }
        ;
        // Function to draw the header row with dynamic row height
        function drawSectionCHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            // Calculate the maximum height needed for the header row
            headings.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, {
                    width: columnWidth[index] - 10, // Consider the padding when calculating height
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            // Draw each header cell
            headings.forEach((header, index) => {
                drawSectionCCell(currentX, tableY, columnWidth[index], maxHeaderHeight, header, true);
                currentX += columnWidth[index];
            });
            // Move to the next row after the header
            tableY += maxHeaderHeight;
        }
        ;
        // Function to draw the values row with dynamic row height
        function drawSectionCValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            // Calculate the maximum height needed for the values row
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidth[index] - 20, // Consider the padding when calculating height
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            // Draw each value cell
            values.forEach((value, index) => {
                drawSectionCCell(currentX, tableY, columnWidth[index], maxRowHeight, value);
                currentX += columnWidth[index];
            });
            // Move to the next row after the values
            tableY += maxRowHeight;
        }
        ;
        // Draw the header row for Section C
        drawSectionCHeaderRow();
        // Draw the values row for Section C
        drawSectionCValuesRow();
        // Move down slightly to separate Section C and the heading for Section D
        doc.moveDown(2); // Reduce this value to tighten the spacing
        // Update the Y position for Section D manually
        doc.y = tableY + 12; // Adjust this number to control the spacing, set it to a lower value for tighter spacing
        //Section D: Title for Transaction History
        //||<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>||//
        doc.font('Helvetica-Bold').fontSize(10).text('Transaction History', contentX, doc.y, { underline: true });
        // Move down slightly to separate the heading from the table
        doc.moveDown(0.2); // Use a smaller value for tighter spacing
        tableY = doc.y; // Update the tableY to the new Y position
        // Define column widths
        const columnWidths = [85, 260, 65, 65, 75]; // Column widths for Section D
        // Calculate total table width
        const totalTableWidths = columnWidths.reduce((sum, width) => sum + width, 0);
        // Calculate the position for the underline
        const underlineY = doc.y + 1; // Position it slightly below the heading
        // Draw the underline
        doc.moveTo(contentX, underlineY) // Start position for the line
            .lineTo(contentX + totalTableWidths, underlineY) // Draw to the right
            .stroke(); // Apply the stroke to draw the line
        //Add extra space before the table starts
        tableY = underlineY + 5; // Move down for the table
        doc.y = tableY; // Set the new Y position for the table
        //Now proceed to draw the table for Section D
        //Add extra spacing by adjusting tableY
        let tableYSectionD = doc.y + 5; // Set tableYSectionD to a new position, adding 10 units of space
        //Table headers
        const headers = ['Transaction Date', 'Transaction Remarks', 'DR', 'CR', 'Balance'];
        //Function to draw a cell with minimal padding for the text
        function drawCell(x, y, width, height, text, isHeader = false) {
            // Check for undefined width or height
            if (width === undefined || height === undefined) {
                console.error("Undefined width or height in drawCell:", width, height);
                return; // Or handle the error in another way, e.g., log or throw an exception
            }
            doc.rect(x, y, width, height).stroke(); // Draw the cell border
            // Set font style
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
            // Draw the text inside the cell with minimal padding and top alignment
            const padding = 2.85; // Minimal padding for top and left
            doc.text(text, x + padding, y + padding, {
                width: width - padding * 2, // Adjust the width to account for padding
                align: 'left',
                lineBreak: true,
                baseline: 'top', // Set baseline to top to reduce extra space
            });
        }
        ;
        // Function to draw the rows with dynamic row height and spillover support
        function drawRow(values, columnWidths, rowY) {
            let currentX = tableX;
            let maxRowHeight = 0;
            // Calculate the maximum row height based on the content
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidths[index] - 4, // Account for padding
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight); // Use text height directly for tighter fit
            });
            // Check available space before drawing the row
            const availableHeight = doc.page.height - doc.page.margins.bottom - rowY;
            if (maxRowHeight > availableHeight) {
                doc.addPage(); // Add a new page if the row doesn't fit
                rowY = doc.page.margins.top; // Reset rowY to the top margin of the new page
            }
            // Draw each cell in the row with minimal padding
            values.forEach((value, index) => {
                drawCell(currentX, rowY, columnWidths[index], maxRowHeight, value);
                currentX += columnWidths[index];
            });
            // Update the rowY position for the next row, considering current row height
            return rowY + maxRowHeight; // Return the new row position
        }
        ;
        // Function to draw the header row for Section D with dynamic row height
        function drawSectionDHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            // Calculate the maximum height needed for the header row
            headers.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, {
                    width: columnWidths[index] - 20, // Consider the padding when calculating height
                    align: 'left',
                    lineBreak: true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            // Draw each header cell with minimal padding
            headers.forEach((header, index) => {
                drawCell(currentX, tableY, columnWidths[index], maxHeaderHeight, header, true);
                currentX += columnWidths[index];
            });
            // Move to the next row after the header
            tableY += maxHeaderHeight;
        }
        ;
        // Function to draw the rows for each transaction with dynamic row height
        function drawSectionDRow(values, event) {
            let currentX = tableX;
            let maxRowHeight = 0;
            // Filter out rows where remittedAmountCROnPO is 0 (no remittance)
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
            // Determine the balance based on the event type
            function calculateBalance(event) {
                let balance;
                if (event.type === 'Remittance') {
                    // Find the matching remittance in the array
                    const matchingRemittance = purchaseOrder.remittanceBalanceToBePaidDetails.find((remittance) => remittance.remitDateOnPO === event.data.remitDateOnPO);
                    if (matchingRemittance) {
                        balance = matchingRemittance.EndingBalanceAfterLastRemittance?.toString() || '';
                    }
                    else {
                        console.warn('Matching remittance not found for:', event.data.remitDateOnPO);
                        balance = 'N/A'; // Handle missing data
                    }
                }
                else if (event.type === 'LastCredit') {
                    // Get the last TotalPaymentsMadeSoFar from purchaseOrder.totalRemittanceMadeSoFar
                    const lastTotalPayment = purchaseOrder.totalRemittanceMadeSoFar?.[purchaseOrder.totalRemittanceMadeSoFar.length - 1]?.TotalPaymentsMadeSoFar || '';
                    balance = lastTotalPayment.toString();
                }
                else if (event.type === 'PriceChange') {
                    // Handle the balance calculation for a PriceChange event
                    const priceChangeBalance = purchaseOrder.remittanceBalanceToBePaidDetails[0]?.RemittanceExpectedBalToBePaidOnPO || '';
                    balance = priceChangeBalance.toString();
                }
                else {
                    console.warn('Unrecognized event type:', event.type);
                    balance = '';
                }
                // Return the balance as a string
                return balance;
            }
            ;
            // Example usage to calculate and display the balance in the rowValues array
            const balance = calculateBalance(event);
            values[4] = balance; // Assign the calculated balance to the last column in rowValues
            // Calculate the maximum height needed for the row
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.5).heightOfString(value, {
                    width: columnWidths[index] - 20, // Consider the padding when calculating height
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 5);
            });
            // Draw each cell in the row with minimal padding
            values.forEach((value, index) => {
                drawCell(currentX, tableY, columnWidths[index], maxRowHeight, value);
                currentX += columnWidths[index];
            });
            // Move to the next row after the values
            tableY += maxRowHeight;
        }
        ;
        // Function to format date and time, with fallback for invalid dates
        function formatDateTime(date) {
            // Convert the date to a Date object if it is a string
            if (typeof date === 'string') {
                date = new Date(date);
            }
            // Check if the date is valid
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return 'N/A'; // Fallback to 'N/A' if the date is undefined, not a Date object, or invalid
            }
            return date.toLocaleDateString() + '\n' + date.toLocaleTimeString(); // Format the date and time
        }
        ;
        // Function to sort transactions by date and time
        function sortTransactionsByDateAndTime() {
            const events = [];
            // Add LastCredit events
            if (purchaseOrder.purchaseOrderPriceReverseAlertDetails) {
                purchaseOrder.purchaseOrderPriceReverseAlertDetails.forEach((detail) => {
                    events.push({ type: 'LastCredit', data: detail });
                });
            }
            // Add PriceChange events
            if (purchaseOrder.PriceChangeOnPOHistoryDetails) {
                purchaseOrder.PriceChangeOnPOHistoryDetails.forEach((detail) => {
                    events.push({ type: 'PriceChange', data: detail });
                });
            }
            // Add Remittance events
            if (purchaseOrder.remittanceBalanceToBePaidDetails) {
                purchaseOrder.remittanceBalanceToBePaidDetails.forEach((detail) => {
                    events.push({ type: 'Remittance', data: detail });
                });
            }
            // Sort events by date and time
            events.sort((a, b) => {
                const dateA = a.data.priceChangeOnPODate || a.data.purchaseOrderReverseDate || a.data.remitDateOnPO;
                const dateB = b.data.priceChangeOnPODate || b.data.purchaseOrderReverseDate || b.data.remitDateOnPO;
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            });
            return events;
        }
        function getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder) {
            // Check if remittanceBalanceToBePaidDetails is defined and contains at least one item
            if (!purchaseOrder.remittanceBalanceToBePaidDetails || purchaseOrder.remittanceBalanceToBePaidDetails.length === 0) {
                console.warn("Warning: remittanceBalanceToBePaidDetails is missing or empty.");
                return "No Balance Available"; // Fallback value
            }
            // Retrieve the balance value with optional chaining and fallback
            const balance = purchaseOrder.remittanceBalanceToBePaidDetails[0]?.RemittanceExpectedBalToBePaidOnPO;
            if (balance === undefined) {
                console.warn("Warning: RemittanceExpectedBalToBePaidOnPO is undefined.");
                return "No Balance Available"; // Fallback value if balance is undefined
            }
            // Return the balance as a string
            return balance.toString();
        }
        // Example function to log and draw rows in PDF, handling undefined values gracefully
        function handlePurchaseOrderForPDF(purchaseOrder) {
            console.log(`Searching for Purchase Order with ID: ${purchaseOrder.id}`);
            // Use the helper function to get the balance value for the last column
            const remittanceExpectedBalance = getRemittanceExpectedBalanceToBePaidOnPO(purchaseOrder);
            //sorted events & row drawing logic
            const sortedEvents = sortTransactionsByDateAndTime();
            // Draw the header row for Section D
            drawSectionDHeaderRow();
            sortedEvents.forEach((event) => {
                let rowValues = [];
                if (event.type === 'PriceChange') {
                    const { priceChangeOnPODate, priceChangeOnPORemarks, newPriceAmountOnPO } = event.data;
                    rowValues = [
                        formatDateTime(priceChangeOnPODate), // Format the date and time
                        priceChangeOnPORemarks ?? 'N/A',
                        newPriceAmountOnPO?.toString() ?? '',
                        '',
                        remittanceExpectedBalance
                    ];
                }
                else if (event.type === 'LastCredit') {
                    const { purchaseOrderReverseDate, purchaseOrderReverseNewPriceAlertRemarks, purchaseOrderReverseNewPriceAlert } = event.data;
                    rowValues = [
                        formatDateTime(purchaseOrderReverseDate), // Format the date and time
                        purchaseOrderReverseNewPriceAlertRemarks ?? 'N/A',
                        '',
                        purchaseOrderReverseNewPriceAlert?.toString() ?? '',
                        remittanceExpectedBalance
                    ];
                }
                else if (event.type === 'Remittance') {
                    const { remitDateOnPO, remittanceUpdateRemarksOnPO, remittedAmountCROnPO, EndingBalanceAfterLastRemittance } = event.data;
                    rowValues = [
                        formatDateTime(remitDateOnPO), // Date and time of the remittance
                        remittanceUpdateRemarksOnPO ?? 'N/A', // Remarks for remittance
                        '',
                        remittedAmountCROnPO?.toString() ?? '', // Remittance credit amount
                        EndingBalanceAfterLastRemittance?.toString() ?? '' // Updated balance after remittance
                    ];
                }
                ;
                // condition to determine when to draw rows based on the event type and data values
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
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
        // Add the footer with the current date
        // Function to draw the footer on the last page
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        }
        // Use onEnd callback
        doc.on('end', drawFooter);
        // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  
        // End the document
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
        // Call the function to generate the PDF
        await generatePurchaseOrderPDF('YourPurchaseOrderId', './path/to/output.pdf', purchaseOrder);
    }
    catch (error) {
        console.error('Error Generating PDF:', error);
    }
}
exports.generatePurchaseOrderPDF = generatePurchaseOrderPDF;
;
