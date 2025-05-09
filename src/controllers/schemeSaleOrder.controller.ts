import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import {fileURLToPath} from 'url';
import * as url from 'url';
import {Request, Response} from 'express';
import {SchemeSaleOrder, ISchemeSaleOrder} from "../models/schemeSaleOrder.model.js";
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";
import addFormatToCurrencyInThePDF from '../utils/addFormatToCurrency.utils.js';

import pkg from 'pdfkit';
const {x,y} = pkg;

export const SchemeSaleOrderPDFController = async (req:Request, res:Response) => {
    console.log("Received Request Params:", req.params);
    const userSchemeTransactionID = req.params.id;
    console.log("Received Scheme Order Transaction ID:", userSchemeTransactionID); // Log the received ID
    try {
        const schemeSO = await SchemeSaleOrder.findOne({userSchemeTransactionID});
        //console.log("User Scheme Information Query Result:", userScheme); // Log query result
        if (!schemeSO) {
            return res.status(404).json({error:"Scheme Sale Order Information Not Found"});
        }
        const schemeSaleOrderObject = schemeSO.toObject() as ISchemeSaleOrder;

        const outputFilePath = path.resolve(`./pdfs/schemeSO_${userSchemeTransactionID}.pdf`);
        await generateSchemeSaleOderPDF(outputFilePath, schemeSaleOrderObject);
        res.download(outputFilePath, `SchemeSaleOrder_${userSchemeTransactionID}.pdf`, (err) => {
            if (err) {
                //console.error("Error during file download:", err);
                return res.status(500).json({error:"Error Downloading PDF"});
            }
        });
    } catch (error) {
        //console.error("Error Generating Sales Order Information PDF:", error);
        res.status(500).json({error: `Error Generating PDF: ${(error as Error).message}`});
    }
};

//Function to handle the PDF Generation for the Sale Order Information
async function generateSchemeSaleOderPDF(outputFilePath:string, schemeSO:ISchemeSaleOrder): Promise<void> {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `SchemeSaleOrder_${schemeSO.userSchemeTransactionID || 'Unknown'}.pdf`;
    const filePath = path.join(__dirname, fileName);

    doc.pipe(fs.createWriteStream(filePath));
        try {
            const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
            try {
                const logo = fs.readFileSync(logoPath);
                doc.image(logo, 50, 50, {width:60});
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
            doc.text('__________________________________________________________________________________________', {align:'left'});
    
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


        //Draw a Rectangle A around the UserScheme Information
        const headersSectionA = [60, 97, 177, 63, 70, 90];
        const headings = ['Scheme ID', 'Scheme Name', 'Scheme Short Desc.', 'Item Original Price', 'Scheme Unit Price', 'Scheme Payment Structure'];
        const values = [
            schemeSO.schemeIDUserSchemed || 'N/A',
            schemeSO.schemeNameUserSchemed || 'N/A',
            schemeSO.schemeShortDescUserSchemed || 'N/A',
            formatCurrency(schemeSO.schemeItemOriginalPriceUserSchemed) || 'N/A',
            formatCurrency(schemeSO.schemeUnitPriceUserSchemed) ||'N/A',
            schemeSO.schemePaymentStructureUserSchemed || 'N/A'
        ];
        //Function to draw a cell in the table
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            x = x || 0; // Ensure default values
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
        };
        //Function to draw the header row for the table
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headings.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header.toString(), {
                    width: headersSectionA[index] - 10,
                    align:'left',
                    lineBreak:true,
                });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headings.forEach((header, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxHeaderHeight, header, true);
                currentX += headersSectionA[index];
            });
            tableY += maxHeaderHeight;
        };
        //Function to draw the values row for the table
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
        };
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(0.1);


        //Draw a Rectangle A2 around the UserScheme Information
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
        //Function to draw a cell in the table
        function drawSectionA2Cell(x, y, width, height, text, isHeader = false) {
            x = x || 0; // Ensure default values
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
        };
        //Function to draw the header row for the table
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
        };
        //Function to draw the values row for the table
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
        };
        drawSectionA2HeaderRow();
        drawSectionA2ValuesRow();

        doc.moveDown(10);


        //Draw Rectangle B around Item Information
        const headerSectionB = [65, 65, 122, 150, 76, 76];
        doc.y = tableY + 115;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Schemed Item Information', contentX, doc.y, {underline:true});
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
        //Function to draw a cell in the table.
        function drawSectionB2Cell(x, y, width, height, text, isHeader = false) {
            x = x || 0; // Ensure default values
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
        };
        //Function to draw the header row for the table.
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
        };
        //Function to draw the values row for the table.
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
        };
        drawSectionBHeaderRow();
        drawSectionBValuesRow();
        doc.moveDown(0.1);

    //----------Draw Rectangle B2 around Transaction History--------------------------------------------------
        doc.y = tableYSectionB2 + 10;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Transaction History', contentX, doc.y, {underline:true});
        tableY = doc.y;
        const headersSectionB2 = [75, 241, 75, 75, 87];
        const totalSectionB2TableWidth = headersSectionB2.reduce((sum, width) => sum + width, 0);
        const underlineSectionB2 = doc.y + 1;
    
        doc.moveTo(contentX, underlineSectionB2).lineTo(contentX + totalSectionB2TableWidth, underlineSectionB2).stroke();

        tableY = underlineSectionB2 + 5;
        doc.y = tableY;

        const headingsSectionB2 = ['Transaction Date', 'Transaction Remarks', 'DR Amount', 'CR Amount', 'Ending Balance'];

        //Function to draw a cell of Section B2 with conditional borders to avoid unnecessary underlines
        function drawSectionB2HeaderCell(x, y, width, height, text, isHeader = false) {
            //Draw borders only if there's meaningful content in the cell
            if (text) {
            // Draw the full rectangle for cells with content
            doc.rect(x, y, width, height).stroke();
            } else {
            // Draw only the top and bottom borders for empty cells
            doc.moveTo(x, y).lineTo(x + width, y).stroke(); // Top border
            doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke(); // Bottom border
            }
            // Set font style based on whether the cell is a header
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
            const padding = 5;
            // Draw the text
            doc.text(text, x + padding, y + padding, {width:width - padding * 2, align:'left', lineBreak:true});
        };

        //Function to draw the header row of Section B
        function drawSectionB2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8).heightOfString(header, {width:headersSectionB2[index] - 10, align:'left'});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            headingsSectionB2.forEach((header, index) => {
                drawSectionB2HeaderCell(currentX, tableY, headersSectionB2[index], maxHeaderHeight, header, true);
                currentX += headersSectionB2[index];
                });
                tableY += maxHeaderHeight;
            };
            drawSectionB2HeaderRow();        

        //Function to calculate Balance for each event type
        function calculateSchemeBalance(event:any, schemeSO:ISchemeSaleOrder) {
             if (!event || !event.type || !schemeSO) {
            console.error('Invalid Event or Scheme Sale Order Information Provided');
            return 0;
            }
            switch (event.type) {
                case 'BookScheme': {
                    const schemePaymentBalanceAtBooking = schemeSO.RemittanceBalanceToBePaidDetails.find(
                        (bookScheme) => bookScheme.isRemittanceForSchemeFirstPayment);
                    return (schemePaymentBalanceAtBooking?.remittanceExpectedBalToBePaidOnScheme ?? schemeSO.RemittanceBalanceToBePaidDetails[0]?.remittanceExpectedBalToBePaidOnScheme ?? 0);
                }
                case 'FirstRemittanceSchemeUponBooking': {
                    // Retrieve the first ending balance after remittance
                    const firstRemittanceUponBooking = schemeSO.RemittanceBalanceToBePaidDetails.find(
                        (firstRemittancePayment) => firstRemittancePayment.isRemittanceForSchemeFirstPayment);
                    return (firstRemittanceUponBooking?.endingBalanceAfterLastRemittanceOnScheme ?? schemeSO.RemittanceBalanceToBePaidDetails[0]?.endingBalanceAfterLastRemittanceOnScheme ?? 0 );
                }
                case 'SubsequentRemittance': {
                    // Retrieve the latest remittance balance
                    const remittanceEntries = schemeSO.RemittanceBalanceToBePaidDetails.filter(
                        (remittanceScheme) =>new Date(remittanceScheme.remitDateOnScheme).getTime() === new Date(event.data.remitDateOnScheme).getTime());
                    // Get the latest remittance entry
                    const latestRemittance = remittanceEntries.length > 0 ? remittanceEntries[remittanceEntries.length - 1] : null;
                    return latestRemittance?.endingBalanceAfterLastRemittanceOnScheme ?? 0;
                }
                default: {
                    console.error('Unrecognized Event Type:', event.type);
                    return 0;
                }
            }
        };

//Function to draw the rows of the Section B2 Transaction History
function drawSectionB2TransactionRows(values: any[], event: any, schemeSaleOrder:ISchemeSaleOrder, columnWidths:number[], headersSectionB2:number[]) {
    let currentX = tableX;
    let maxRowHeight = 0;

    // Skip row if it's a 'Remittance' with zero remittance amount
    if (event.type === 'RemittanceScheme' && parseFloat(values[3]) === 0) {
        console.log('Skipping row due to zero remittance amount');
        return;
    }

    // Extract and format the balance correctly
    let balance = parseFloat(values[4]) || calculateSchemeBalance(event, schemeSaleOrder); 
    const safeSchemeBalance = isNaN(balance) ? 0 : balance;
    const formattedBalance = formatCurrency(safeSchemeBalance);
    // Update the values array with the formatted balance
    values[4] = formattedBalance; 

    // Measure row height and calculate the maximum height for the row
    values.forEach((value, index) => {
        const textHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(value || '', { width:columnWidths[index] - 20, align:'left', lineBreak:true});
        maxRowHeight = Math.max(maxRowHeight, textHeight + 7);
    });

    // Check if there’s enough space on the current page for the row
    const availableSpace = doc.page.height - tableY - doc.page.margins.bottom;
    if (maxRowHeight > availableSpace) {
        // Add a new page and reset table position
        doc.addPage();
        tableY = doc.page.margins.top; // Reset table Y position to top margin
        drawSectionBHeaderRow(); // Redraw the header row
    }

    // Render cells for the row
    values.forEach((value, index) => {
        // Apply conditional coloring for the balance column
        if (index === 4 && safeSchemeBalance < 0) {
            doc.fillColor('red');
        } else {
            doc.fillColor('black');
        }
        // Draw the cell
        drawSectionB2HeaderCell(currentX, tableY, columnWidths[index], maxRowHeight, value || '', false);
        currentX += columnWidths[index];
    });

    // Update table position for the next row
    tableY += maxRowHeight;
    doc.fillColor('black'); // Reset fill color for subsequent rows
}

//Function to sort the events between BookScheme, FirstRemittanceUponBooking, RemittanceScheme
const sortSchemeEvents = (schemeSaleOrder: ISchemeSaleOrder) => {
    const events: any[] = [];
    console.log("🔍 Sorted Events:", events);
    //Handle the BookScheme event
    if (schemeSaleOrder.StatingBalanceOnSchemeHistory) {
        schemeSaleOrder.StatingBalanceOnSchemeHistory.forEach((detail) => {
        events.push({ type: 'BookScheme', data: detail });
    });
}
//Handle Remittance events (Ensure they are sorted in chronological order)
if (schemeSaleOrder.RemittanceBalanceToBePaidDetails) {
    const sortedRemittanceHistory = schemeSaleOrder.RemittanceBalanceToBePaidDetails.sort(
        (a, b) => new Date(a.remitOnSchemeDate).getTime() - new Date(b.remitOnSchemeDate).getTime());
        sortedRemittanceHistory.forEach((detail, index) => {
        if (index === 0) {
            events.push({ type:'FirstRemittanceSchemeUponBooking', data:detail});
        } else {events.push({type:'SubsequentRemittance', data:detail});
    }
});
    }
    return events;
};

//Function to get the expected balance to be paid on scheme
function getRemittanceExpectedBalanceToBePaidOnScheme(userScheme:ISchemeSaleOrder): string {
    if (!userScheme.RemittanceBalanceToBePaidDetails || userScheme.RemittanceBalanceToBePaidDetails.length === 0) {
        return 'No Balance Available';
    }
    //Get the last (latest) entry safely
    const balanceHistory = userScheme.RemittanceBalanceToBePaidDetails;
    const latestBalance = balanceHistory[balanceHistory.length - 1]?.endingBalanceAfterLastRemittanceOnScheme;
        return latestBalance !== undefined ? latestBalance.toString() : 'No Balance Available';
};
    
        
//Function To handle the PDF for the Scheme Transaction based on the following event types are handled: RemittanceScheme, BookScheme
function handleSchemeInformationForPDF(schemeSaleOrder: ISchemeSaleOrder) {
    console.log(`Searching for UserScheme ID: ${schemeSaleOrder.userSchemeTransactionID}`);
    const sortEvents = sortSchemeEvents(schemeSaleOrder);

    let currentPage = doc.page;
    let tableY = tableX + 50; // Adjust the initial table position as needed

    sortEvents.forEach((event) => {
        let rowValues: string[] = [];
        let shouldIncludeRow = true; // Flag to determine if the row should be included

        if (event.type === 'BookScheme') {
            const {startSchemeDate, startingBalanceRemarksOnScheme, startingBalanceOnScheme} = event.data;
            const getStartBalance = formatCurrency(parseFloat(startingBalanceOnScheme?.toString() || '0'));

            //Get the first RemittanceExpectedBalToBePaidOnScheme
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
        } else if (event.type === 'FirstRemittanceSchemeUponBooking') {
            const {remitOnSchemeDate, remitOnSchemeRemarks, remittedAmountCROnScheme, endingBalanceAfterLastRemittanceOnScheme} = event.data;
            const getRemittanceBalanceDue = parseFloat(endingBalanceAfterLastRemittanceOnScheme?.toString() || '0');
            console.log('Get Remittance Balance Due', getRemittanceBalanceDue)
            rowValues = [
                formatDateTime(remitOnSchemeDate) ?? 'N/A',
                remitOnSchemeRemarks ?? 'N/A', 
                '',
                formatCurrency(parseFloat(remittedAmountCROnScheme?.toString() || '0')), 
                getRemittanceBalanceDue 
            ];
            addFormatToCurrencyInThePDF(doc, parseFloat(getRemittanceBalanceDue.toString()), 100, 100);
        } else if (event.type === 'SubsequentRemittance') {
            const {remitOnSchemeDate, remitOnSchemeRemarks, remittedAmountCROnScheme, endingBalanceAfterLastRemittanceOnScheme} =event.data;
            const getRemittanceDueUponSubsequentRemittance = parseFloat(endingBalanceAfterLastRemittanceOnScheme?.toString() || '0');
            console.log('Get Remittance Upon Subsequent Remittance:', getRemittanceDueUponSubsequentRemittance)
            rowValues = [
                formatDateTime(remitOnSchemeDate) ?? 'N/A',
                remitOnSchemeRemarks ?? 'N/A',
                '',
                formatCurrency(parseFloat(remittedAmountCROnScheme?.toString() || '0')), 
                getRemittanceDueUponSubsequentRemittance 
            ];
        }
        //Only draw the row if the `shouldIncludeRow` flag is true
        if (shouldIncludeRow) {
            drawSectionB2TransactionRows(rowValues, event, schemeSaleOrder, headersSectionB2, headersSectionB2); 
        }
    });
}

//Function to draw the footer on the PDF
function drawFooter() {
    const generatedDate = new Date().toDateString();
    doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, {align:'center'});
};

//Function to generate the Scheme PDF
handleSchemeInformationForPDF(schemeSO);
    doc.on('end', drawFooter);
    doc.end();
    console.log('PDF Generated Successfully on Controller:', filePath);


}catch (error) {
    console.error('Error Including Logo:', error);
}
    console.log('PDF Generation Completed:', filePath);
};

//Export the UserSchemePDFController
export default SchemeSaleOrderPDFController;