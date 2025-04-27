import fs from "fs";
import path from "path";
const {default: PDFDocument} = await import("pdfkit");
import * as url from 'url';
import {Request, Response} from "express";
import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder, ITransformedRemittance} from "../models/layAwayPurchaseOrder.model.js";
import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";

import pkg from 'pdfkit';
const {x,y} = pkg;

//Define the interfaces for the event, purchase order, remittance details, and total remittance
interface Event {
    type: string;
    data?: any;
};
interface PurchaseOrder {
    remittanceBalanceToBePaidDetails?: RemittanceDetails[];
    totalRemittanceMadeSoFar?: TotalRemittance[];
};
interface RemittanceDetails {
    remitDateOnPO?: string;
    endingBalanceAfterLastRemittance?: number;
};
interface TotalRemittance {
    TotalPaymentsMadeSoFar?: number;
};


//function to generate the purchase order PDF
export const LayAwayPurchaseOrderPDFController = async (req:Request, res:Response) => {
    const layAwayPurchaseOrderId = req.params.id;
    try {
        const layAwayPO = await LayAwayPurchaseOrder.findOne({layAwayPurchaseOrderId});
        if (!layAwayPO) {
            return res.status(404).json({error: "LayAway Purchase Order Not Found"}); 
        }
        const layAwayPurchaseOrderObject = layAwayPO.toObject() as ILayAwayPurchaseOrder & {transformedRemittance?:ITransformedRemittance[]};
        if (layAwayPurchaseOrderObject.TotalRemittanceMadeSoFarOnLayAwayPO) {
            layAwayPurchaseOrderObject.transformedRemittance = layAwayPurchaseOrderObject.TotalRemittanceMadeSoFarOnLayAwayPO.map((item) => {
                if (typeof item === 'object' && 'TotalPaymentsMadeSoFarOnLayAwayPO' in item) {
                    return {
                        TotalPaymentsMadeSoFarOnLayAwayPO: item.TotalPaymentsMadeSoFarOnLayAwayPO?.toString() || '0',
                        remittanceDateOnLayAwayPO: item.remittedDateOnLayAwayPO ? new Date(item.remittedDateOnLayAwayPO) : undefined,
                        remittanceAmountOnLayAwayPO: parseFloat(item.remittedAmountOnLayAwayPO?.toString() || '0'),
                        remittanceRemarksOnLayAwayPO: item.remittedRemarksOnLayAwayPO?.toString() || '',
                    } as ITransformedRemittance;
                } else {
                    return null; // Handle unexpected data type (optional) Or throw an error
                }
            }).filter(item => item !== null) as ITransformedRemittance[];
        }
        const outputFilePath = path.resolve(`./pdfs/layAwayPO_${layAwayPurchaseOrderId}.pdf`);
        await generateLayAwayPurchaseOrderPDF(outputFilePath, layAwayPurchaseOrderObject);
        res.download(outputFilePath, `LayAwayPurchaseOrder_${layAwayPurchaseOrderId}.pdf`, (err) => {
            if (err) {
                console.error("Error during File Download:", err);
                return res.status(500).json({ error: "Error Downloading PDF"});
            }
        });
    } catch (error) {
        console.error("Error Generating Purchase Order PDF:");
        res.status(500).json({error:`Error Generating PDF: ${(error as Error).message}`});
    }
};

        // Function to generate the purchase order PDF
        async function generateLayAwayPurchaseOrderPDF(outputFilePath:string, layAwayPO:ILayAwayPurchaseOrder & {transformedRemittance?: ITransformedRemittance[]}):Promise<void> {
            const doc = new PDFDocument();
            const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
            const fileName = `LayAwayPurchaseOrder_${layAwayPO.layAwayPurchaseOrderId || 'Unknown'}.pdf`;
            const filePath = path.join(__dirname, fileName);
            doc.pipe(fs.createWriteStream(filePath));
        try {
            const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
            try {
            const logo = fs.readFileSync(logoPath);
            doc.image(logo,50,50, {width:60});
            }catch(error) {
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
            const purchaseOrderDate = layAwayPO.createdAt instanceof Date ? layAwayPO.createdAt.toDateString(): 'Unknown Date';
            doc.font('Helvetica').fontSize(8.5).text(`Purchase Order Date: ${purchaseOrderDate}`, titleX, newYTextPosition);
            doc.font('Helvetica').fontSize(8.5).text(`Purchase Order ID:${layAwayPO.layAwayPurchaseOrderId}`, titleX, newYTextPosition + 9.5);

        doc.moveDown(7);

    //DRAW RECTANGLE A AROUND PURCHASE ORDER DETAILS
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 10;
        const headersSectionA = [43, 54, 87, 100, 183, 85];
        //const totalTableWidth = columnWidth.reduce((sum, width) => sum + width, 0);
        doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, {underline:true});
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
        // Function to draw a cell of Section A.
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
            const padding = 5;
            doc.text(text, x + padding, y + padding, {width:width - padding * 2, align:'left', lineBreak:true});
        };
        // Function to draw the header row of Section A.
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA.forEach((header, index) => {
                const textHeightSectionA = doc.font('Helvetica-Bold').fontSize(8.5).heightOfString(header, {width:headersSectionA[index] - 10, align:'left', lineBreak:true});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeightSectionA + 10);
            });
            headingsSectionA.forEach((header, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxHeaderHeight, header, true);
                currentX += headersSectionA[index];
            });
            tableY += maxHeaderHeight;
        };
        // Function to draw the values row of section A
        function drawSectionAValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionA.forEach((value, index) => {
                const textHeightSectionA = doc.font('Helvetica').fontSize(7.5).heightOfString(value, {width: headersSectionA[index] - 20, align:'left', lineBreak:true});
                maxRowHeight = Math.max(maxRowHeight, textHeightSectionA + 10);
            });
            valuesSectionA.forEach((value, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                currentX += headersSectionA[index];
            });
            tableY += maxRowHeight;
        };
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(2);

    
       
    //---DRAW RECTANGLE B AROUND TRANSACTION HISTORY---
        doc.y = tableY + 12;
        doc.font('Helvetica-Bold').fontSize(8).text('Transaction History', contentX, doc.y, {underline:true});
        tableY = doc.y;
        const headersSectionB = [75, 240, 75, 75, 85];
        const totalSectionBTableWidth = headersSectionB.reduce((sum, width) => sum + width, 0);
        const underlineSectionB = doc.y + 1;

        doc.moveTo(contentX, underlineSectionB).lineTo(contentX + totalSectionBTableWidth, underlineSectionB).stroke();

        tableY = underlineSectionB + 5;
        doc.y = tableY;

        const headingsSectionB = ['Transaction Date', 'Transaction Remarks', 'DR Amount', 'CR Amount', 'Ending Balance'];

        //Function to draw a cell of Section B with conditional borders to avoid unnecessary underlines
        function drawSectionBHeaderCell(x, y, width, height, text, isHeader = false) {
        // Draw borders only if there's meaningful content in the cell
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
            doc.text(text, x + padding, y + padding, {width: width - padding * 2, align:'left', lineBreak: true});
        };

        // Function to draw the header row of Section B
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8).heightOfString(header, {width:headersSectionB[index] - 10, align: 'left'});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 5);
            });
            headingsSectionB.forEach((header, index) => {
                drawSectionBHeaderCell(currentX, tableY, headersSectionB[index], maxHeaderHeight, header, true);
                currentX += headersSectionB[index];
            });
            tableY += maxHeaderHeight;
        };
        drawSectionBHeaderRow();        

        //Function to calculate balance for each event type
        function calculateBalance(event:any, layAwayPO:ILayAwayPurchaseOrder):number {
        if (!event || !event.type || !layAwayPO) {
        console.error('Invalid arguments: Event & LayAway PurchaseOrder are required');
        return 0;
        }

        switch (event.type) {
            case 'Remittance': {
                const matchingRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.find(
                (remittance) => new Date(remittance.remitDateOnLayAwayPO).getTime() === new Date(event.data.remitDateOnLayAwayPO).getTime());
                return matchingRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
            }
            case 'LastCredit': {
                const { layAwayPurchaseOrderReverseDate } = event.data;
                console.log("🔎 Last Price Change Date:", layAwayPurchaseOrderReverseDate);
                //Find the last remittance before the price change
                const lastRemittanceBeforePriceChange = layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO
                .filter(remittance => 
                    new Date(remittance.remittedDateOnLayAwayPO).getTime() < new Date(layAwayPurchaseOrderReverseDate).getTime())
                .sort((a, b) => new Date(b.remittedDateOnLayAwayPO).getTime() - new Date(a.remittedDateOnLayAwayPO).getTime())[0]; // Get latest one
                const totalBeforePriceChange = parseFloat(lastRemittanceBeforePriceChange?.TotalPaymentsMadeSoFarOnLayAwayPO || '0');
                console.log("🔎 Total Payments Before Price Change:", totalBeforePriceChange);
                return totalBeforePriceChange;
            }
            case 'PriceChange': {
                const { priceChangeOnLayAwayPODate } = event.data;
                //Get balance just before the price change
                const matchingRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO
                .filter(remittance => new Date(remittance.remitDateOnLayAwayPO).getTime() <= new Date(priceChangeOnLayAwayPODate).getTime())
                .sort((a, b) => b.remitDateOnLayAwayPO.getTime() - a.remitDateOnLayAwayPO.getTime())[0];
                return matchingRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
            }
            case 'PriceAtBookingPO': {
                const initialPriceChange = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.find(
                remittance => remittance.isRemittanceAfterPriceChangeOnLayAwayPO);
                return (
                initialPriceChange?.endingBalanceAfterLastRemittanceOnLayAwayPO ||
                layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO[0]?.remittanceExpectedBalToBePaidOnLayAwayPO || 0);
            }
            default: {
                console.warn('Unrecognized event type:', event.type);
                return 0;
            }
            }
        };

        //Function to draw each row of the table with proper handling for page breaks, with the statement balance, skip row if it's a remittance with zero balance
        function drawSectionBTransactionRows(values:any[], event:any, purchaseOrder:ILayAwayPurchaseOrder, columnWidths:number[], headersSectionB:number[]) {
            let currentX = tableX;
            let maxRowHeight = 0;
            // Skip row if it's a 'Remittance' with zero balance
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            };
            //Calculate and format the balance for the row
            const balance = calculateBalance(event, purchaseOrder);
            const safeBalance = isNaN(balance) ? 0 : balance;
            const formattedBalance = formatCurrency(safeBalance);
            values[4] = formattedBalance;
            //Measure row height and calculate the maximum height for the row
            values.forEach((value, index) => {
            const textHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(value || '', {width:columnWidths[index] - 20, align:'left', lineBreak:true});
            maxRowHeight = Math.max(maxRowHeight, textHeight + 7);
            });
            //Check if there’s enough space on the current page for the row
            const availableSpace = doc.page.height - tableY - doc.page.margins.bottom;
            if (maxRowHeight > availableSpace) {
            // Add a new page and reset table position
            doc.addPage();
            tableY = doc.page.margins.top; // Reset table Y position to top margin
            drawSectionBHeaderRow(); // Redraw the header row
            }
            //Render cells for the row
            values.forEach((value, index) => {
            //Apply conditional coloring for the balance column
            if (index === 4 && balance < 0) {
                doc.fillColor('red');
            } else {
            doc.fillColor('black');
            }
            //Draw the cell
            drawSectionBHeaderCell(currentX, tableY, columnWidths[index], maxRowHeight, value || '', false);
            currentX += columnWidths[index];
            });
            //Update table position for the next row
            tableY += maxRowHeight;
            doc.fillColor('black'); // Reset fill color for subsequent rows
        };


        //Function to sort transactions by date and time ensure "LastCredit" appears before "PriceChange"
        function sortTransactionsByDateAndTime(layAwayPO: ILayAwayPurchaseOrder) {
        const events: any[] = [];
        if (layAwayPO.PriceChangeOnLayAwayPOHistoryDetails) {
            layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.forEach((detail, index) => {
                const eventType = index === 0 ? 'PriceAtBookingPO' : 'PriceChange';
                events.push({type:eventType, data:detail});
            });
        }
        if (layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO) {
            layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.forEach((detail) => {
            events.push({type:'Remittance', data:detail});
        });
        }
        if (layAwayPO.PriceReverseAlertDetailsOnLayAwayPO) {
        layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.forEach((detail) => {
            events.push({type:'LastCredit', data:detail});
            });
        }
        //Define custom priority for event types
        const eventPriority: Record<string, number> = {'PriceAtBookingPO':1, 'LastCredit':2, 'Remittance':3, 'PriceChange':4};
        //Sort events by date first, then by priority if dates are the same
        events.sort((a, b) => {
            const dateA = new Date(a.data.priceChangeOnLayAwayPODate || a.data.layAwayPurchaseOrderReverseDate || a.data.remitDateOnLayAwayPO || 0).getTime();
            const dateB = new Date(b.data.priceChangeOnLayAwayPODate || b.data.layAwayPurchaseOrderReverseDate || b.data.remitDateOnLayAwayPO || 0).getTime();
            if (dateA !== dateB) {
                return dateA - dateB; //✅Sort by date first
            }
            return eventPriority[a.type] - eventPriority[b.type]; //✅ Sort by priority if dates are equal
        });
        return events;
        };

        //Function to get the remittance balance to be paid on the purchase order
        function getRemittanceExpectedBalanceToBePaidOnPO(layAwayPO: ILayAwayPurchaseOrder) {
            const balance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO?.[0]?.remittanceExpectedBalToBePaidOnLayAwayPO;
            return balance !== undefined ? balance.toString() : 'No Balance Available';
        };

        //Function to add text to the PDF with appropriate color
        const addBalanceToPDF = (doc:PDFKit.PDFDocument, value:number, x:number, y:number) => {
        //Set the color based on whether the value is negative
            if (value < 0) {
            doc.fillColor('red');
            } else {
            doc.fillColor('black');
            };

        //Format the value and add parentheses for negative numbers
        const formattedValue = value < 0 ? `(${formatCurrency(value)})` : formatCurrency(value);
        // Add the text to the PDF at the specified position
        doc.text(formattedValue, x, y);
        };

        
        //Function to handle the PDF for the purchase order
        function handleLayAwayPurchaseOrderForPDF(layAwayPO: ILayAwayPurchaseOrder) {
        console.log(`🔍 Searching for LayAway Purchase Order with ID: ${layAwayPO.id}`);
        const remittanceExpectedBalance = getRemittanceExpectedBalanceToBePaidOnPO(layAwayPO);
        
        const sortedEvents = sortTransactionsByDateAndTime(layAwayPO);
        let runningBalance = 0; // Track the running balance

        sortedEvents.forEach(event => {
            let rowValues: string[] = [];
            let shouldIncludeRow = true; // Flag to determine if the row should be included

        if (event.type === 'LastCredit') {
            const {layAwayPurchaseOrderReverseDate, layAwayPurchaseOrderReverseNewPriceAlertRemarks, layAwayPurchaseOrderReverseOldPrice } = event.data;
            //Get total remittances before price change
            const totalBeforePriceChange = layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO
                .filter(remittance => 
                    new Date(remittance.remittedDateOnLayAwayPO).getTime() < new Date(layAwayPurchaseOrderReverseDate).getTime())
                .reduce((acc, remittance) => acc + parseFloat(remittance.TotalPaymentsMadeSoFarOnLayAwayPO || '0'), 0);
            console.log("🔹 Total Payments Before Price Change (Used in PDF):", totalBeforePriceChange);
            runningBalance = totalBeforePriceChange; //Update running balance

            rowValues = [
                formatDateTime(layAwayPurchaseOrderReverseDate),
                layAwayPurchaseOrderReverseNewPriceAlertRemarks ?? 'N/A',
                '',
                formatCurrency(parseFloat(layAwayPurchaseOrderReverseOldPrice?.toString() || '0')),
                formatCurrency(runningBalance)
            ];
            addBalanceToPDF(doc, runningBalance, 100, 100);
        } else if (event.type === 'PriceAtBookingPO' || event.type === 'PriceChange') {
            const {priceChangeOnLayAwayPODate, priceChangeOnLayAwayPORemarks, newPriceAmountOnLayAwayPO} = event.data;
            rowValues = [
                formatDateTime(priceChangeOnLayAwayPODate),
                priceChangeOnLayAwayPORemarks ?? 'N/A',
                formatCurrency(parseFloat(newPriceAmountOnLayAwayPO?.toString() || '0')),
                '',
                formatCurrency(runningBalance)
            ];
            addBalanceToPDF(doc, runningBalance, 100, 100);
        } else if (event.type === 'Remittance') {
            const {remitDateOnLayAwayPO, remittanceUpdateRemarksOnLayAwayPO, remittedAmountCROnLayAwayPO, endingBalanceAfterLastRemittanceOnLayAwayPO} = event.data;
            if (parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0') === 0) {
                shouldIncludeRow = false; // Skip this row if the CR column value is 0
            }
            runningBalance -= parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0'); // Deduct payment from balance
            rowValues = [
                formatDateTime(remitDateOnLayAwayPO),
                remittanceUpdateRemarksOnLayAwayPO ?? 'N/A',
                '',
                formatCurrency(parseFloat(remittedAmountCROnLayAwayPO?.toString() || '0')),
                formatCurrency(runningBalance)
            ];
            addBalanceToPDF(doc, runningBalance, 100, 100);
            }
            //Only draw the row if the `shouldIncludeRow` flag is true
            if (shouldIncludeRow) {
                drawSectionBTransactionRows(rowValues, event, layAwayPO, headersSectionB, headersSectionB);
                }
            });
        }

        //Function to draw the footer on the PDF
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated On: ${generatedDate}`, 30, doc.page.height - 50, {
                align: 'center'
            });
        };

        //Function to generate the purchase order PDF
        handleLayAwayPurchaseOrderForPDF(layAwayPO);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);

    }catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
};

//Export the controller function
export default LayAwayPurchaseOrderPDFController;


