import fs from "fs";
import path from "path";
const {default: PDFDocument} = await import("pdfkit");
import * as url from 'url';
import {Request, Response} from "express";

import formatCurrency from "../utils/formatCurrency.utils.js";
import formatDateTime from "../utils/formatDateTime.utils.js";

import {StandardPurchaseOrder, IStandardPurchaseOrder} from '../models/standardPurchaseOrder.model.js';

import pkg from 'pdfkit';
const {x,y} = pkg;


//Define the ITransformedRemittance interface
interface ITransformedRemittance {
    TotalPaymentsMadeSoFarOnStandardPO: string;
    remittanceDateOnStandardPO?: Date;
    remittanceAmountOnStandardPO: number;
    remittanceRemarksOnStandardPO: string;
};

//Define the IStandardPurchaseOrderItemsGrandTotal interface
interface IStandardPurchaseOrderItemsGrandTotal {
    standardPurchaseOrderItemsGrandTotal: number;
};

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


//Function to generate the purchase order PDF
export const StandardPurchaseOrderPDFController = async (req:Request, res:Response) => {
    const standardPurchaseOrderId = req.params.id;
    try {
        //Fetch the standard purchase order
        const standardPO = await StandardPurchaseOrder.findOne({standardPurchaseOrderId});
        if (!standardPO) {
            return res.status(404).json({error: "Standard Purchase Order Not Found"});
        }
        //Convert the document to a plain object
        const standardPurchaseOrderObject = standardPO.toObject() as IStandardPurchaseOrder & {transformedRemittance?:ITransformedRemittance[]};
        //Calculate the grand total of all items
        standardPurchaseOrderObject.StandardPurchaseOrderItemsGrandTotal = [
            {
                standardPurchaseOrderItemsGrandTotal: standardPurchaseOrderObject.StandardPurchaseOrderItems.reduce((total, item) => total + (item.standardPurchaseOrderTotalStartPrice || 0), 0)
            }
        ] as IStandardPurchaseOrderItemsGrandTotal[];
        //Transform remittance data for each item
        standardPurchaseOrderObject.transformedRemittance = [];
        standardPurchaseOrderObject.StandardPurchaseOrderItems.forEach((item) => {
            if ('TotalRemittanceMadeSoFarOnStandardPO' in item && item.TotalRemittanceMadeSoFarOnStandardPO) {
                const transformed = (item.TotalRemittanceMadeSoFarOnStandardPO as Array<{ TotalPaymentsMadeSoFarOnStandardPO?: number; remittedDateOnStandardPO?: string; remittedAmountOnStandardPO?: number; remittedRemarksOnStandardPO?: string }>).map((remittance) => {
                    if (typeof remittance === 'object' && 'TotalPaymentsMadeSoFarOnStandardPO' in remittance) {
                        return {
                            TotalPaymentsMadeSoFarOnStandardPO: remittance.TotalPaymentsMadeSoFarOnStandardPO?.toString() || '0',
                            remittanceDateOnStandardPO: remittance.remittedDateOnStandardPO ? new Date(remittance.remittedDateOnStandardPO) : undefined,
                            remittanceAmountOnStandardPO: parseFloat(remittance.remittedAmountOnStandardPO?.toString() || '0'),
                            remittanceRemarksOnStandardPO: remittance.remittedRemarksOnStandardPO?.toString() || '',
                        } as ITransformedRemittance;
                    } else {
                        return null;
                    }
                }).filter(item => item !== null) as ITransformedRemittance[];
                // Add transformed remittance data to the main object
                standardPurchaseOrderObject.transformedRemittance.push(...transformed);
                }
            });
            //Generate the PDF
            const outputFilePath = path.resolve(`./pdfs/standardPO_${standardPurchaseOrderId}.pdf`);
            await generateStandardPurchaseOrderPDF(outputFilePath, standardPurchaseOrderObject);
            //Send the PDF as a response
            res.download(outputFilePath, `StandardPurchaseOrder_${standardPurchaseOrderId}.pdf`, (err) => {
                if (err) {
                    console.error("Error during File Download:");
                    return res.status(500).json({ error:"Error Downloading PDF" });
                }
            });
         } catch (error) {
            console.error("Error Generating Standard Purchase Order PDF:", error);
            res.status(500).json({ error: `Error Generating PDF: ${(error as Error).message}` });
            }
        };

//Function to generate the purchase order PDF
async function generateStandardPurchaseOrderPDF(outputFilePath:string, standardPO:IStandardPurchaseOrder & {transformedRemittance?: ITransformedRemittance[]}):Promise<void> {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `StandardPurchaseOrder_${standardPO.standardPurchaseOrderId || 'Unknown'}.pdf`;
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
    const purchaseOrderDate = standardPO.createdAt instanceof Date ? standardPO.createdAt.toDateString(): 'Unknown Date';
    doc.font('Helvetica').fontSize(8.5).text(`Standard Purchase Order Date: ${purchaseOrderDate}`, titleX, newYTextPosition);
    doc.font('Helvetica').fontSize(8.5).text(`Standard Purchase Order ID:${standardPO.standardPurchaseOrderId}`, titleX, newYTextPosition + 9.5);

    doc.moveDown(7);

    //DRAW RECTANGLE A AROUND PURCHASE ORDER DETAILS
    const contentX = detailsX;
    const tableX = contentX;
    let tableY = doc.y + 10;
    const headersSectionA = [25, 36, 87, 85, 154, 40, 69, 69];
    //const totalTableWidth = columnWidth.reduce((sum, width) => sum + width, 0);
    doc.font('Helvetica-Bold').fontSize(8).text('Item Information', contentX, doc.y, {underline:true});
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

    //Function to draw a cell of Section A.
    function drawSectionACell(x, y, width, height, text, isHeader = false) {
        doc.rect(x, y, width, height).stroke();
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
        const padding = 5;
        doc.text(text, x + padding, y + padding, {width:width - padding * 2, align:'left', lineBreak:true});
    };

    //Function to draw the header row of Section A.
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
    
    //Function to draw the values row of section A
    function drawSectionAValuesRow() {
        let currentX = tableX;
        let maxRowHeight = 0;
        //Iterate over each row in valuesSectionA
        valuesSectionA.forEach((row) => {
        //Calculate the maximum height for the current row
        row.forEach((value, index) => {const textHeightSectionA = doc.font('Helvetica').fontSize(7.5)
            .heightOfString(value.toString(), {width:headersSectionA[index] - 20, align:'left', lineBreak:true});
                    maxRowHeight = Math.max(maxRowHeight, textHeightSectionA + 10);
        });
        //Draw each cell in the current row
        row.forEach((value, index) => {
            drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
            currentX += headersSectionA[index];
        });
        //Move to the next row
        tableY += maxRowHeight;
        currentX = tableX; // Reset X position for the next row
            });
        };
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(2);


       //-----------DRAW RECTANGLE B AROUND TRANSACTION HISTORY--------------
       doc.y = tableY + 12;
       doc.font('Helvetica-Bold').fontSize(8).text('Transaction History', contentX, doc.y, {underline:true});
       tableY = doc.y;
       const headersSectionB = [75, 240, 80, 81, 88];
       const totalSectionBTableWidth = headersSectionB.reduce((sum, width) => sum + width, 0);
       const underlineSectionB = doc.y + 1;

       doc.moveTo(contentX, underlineSectionB).lineTo(contentX + totalSectionBTableWidth, underlineSectionB).stroke();

       tableY = underlineSectionB + 5;
       doc.y = tableY;

       const headingsSectionB = ['Transaction Date', 'Transaction Remarks', 'DR Amount', 'CR Amount', 'Ending Balance'];

       //Function to draw a cell of Section B with conditional borders to avoid unnecessary underlines
       function drawSectionBHeaderCell(x, y, width, height, text, isHeader = false) {
        //Draw borders only if there's meaningful content in the cell
            if (text) {
            //Draw the full rectangle for cells with content
            doc.rect(x, y, width, height).stroke();
            } else {
            //Draw only the top and bottom borders for empty cells
            doc.moveTo(x, y).lineTo(x + width, y).stroke(); // Top border
            doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke(); // Bottom border
            }
            //Set font style based on whether the cell is a header
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
            const padding = 5;
            //Draw the text
            doc.text(text, x + padding, y + padding, {width: width - padding * 2, align:'left', lineBreak: true});
        };

        //Function to draw the header row of Section B
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

        
        //Function to draw each row of the table with proper handling for page breaks, with the statement balance, skip row if it's a remittance with zero balance
        function drawSectionBTransactionRows(
            values: any[],
            event: any,
            standardPO: IStandardPurchaseOrder,
            columnWidths: number[],
            headersSectionB: number[]
        ) {
            let currentX = tableX;
            let maxRowHeight = 0;
        
            // Skip row if it's a 'Remittance' with zero balance
            if (event.type === 'Remittance' && values[3] === '0') {
                return;
            }
        
            // ✅ DO NOT override values[4] anymore
            // We now fully trust handleStandardPurchaseOrderForPDF() to pass correct cumulativeBalance
        
            // Measure row height and determine max height
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(7.5).heightOfString(value || '', {
                    width: columnWidths[index] - 20,
                    align: 'left',
                    lineBreak: true,
                });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 7);
            });
        
            // Check for page break and add new page if necessary
            const availableSpace = doc.page.height - tableY - doc.page.margins.bottom;
            if (maxRowHeight > availableSpace) {
                doc.addPage();
                tableY = doc.page.margins.top;
                drawSectionBHeaderRow();
            }
        
            // Render row cells
            values.forEach((value, index) => {
                if (index === 4 && typeof value === 'string' && value.includes('(')) {
                    doc.fillColor('red');
                } else {
                    doc.fillColor('black');
                }
                drawSectionBHeaderCell(currentX, tableY, columnWidths[index], maxRowHeight, value || '', false);
                currentX += columnWidths[index];
            });
        
            tableY += maxRowHeight;
            doc.fillColor('black');
        }
        
        

        //Function to sort transactions by date and time
        // function sortTransactionsByDateAndTime(standardPO: IStandardPurchaseOrder) {
        //     const events: any[] = [];
        //     //Iterate over each item in standardPurchaseOrderItems
        //     standardPO.StandardPurchaseOrderItems.forEach((item) => {
        //         // Process PriceReverseAlertDetailsOnStandardPO
        //         if (item.PriceReverseAlertDetailsOnStandardPO) {
        //             item.PriceReverseAlertDetailsOnStandardPO.forEach((detail) => {
        //                 events.push({type:'LastCredit', data:detail});
        //             });
        //         }
        //         //Process PriceChangeOnStandardPOHistoryDetails
        //         if (item.PriceChangeOnStandardPOHistoryDetails) {
        //             item.PriceChangeOnStandardPOHistoryDetails.forEach((detail, index) => {
        //                 const eventType = index === 0 ? 'PriceAtBookingPO' : 'PriceChange';
        //                 events.push({type:eventType, data:detail});
        //             });
        //         }
        //     });
        //     //Sort events by date and time
        //     events.sort((a, b) => {
        //         const dateA = a.data.priceChangeOnStandardPODate || a.data.standardPOReverseDate || a.data.remitDateOnStandardPO || 0;
        //         const dateB = b.data.priceChangeOnStandardPODate || b.data.standardPOReverseDate || b.data.remitDateOnStandardPO || 0;
        //         return new Date(dateA).getTime() - new Date(dateB).getTime();
        //     });
        //     return events;
        // }
        function sortTransactionsByDateAndTime(standardPO: IStandardPurchaseOrder): any[] {
            const events: any[] = [];
            standardPO.StandardPurchaseOrderItems.forEach((item, itemIndex) => {
              //Price changes (booking and updates)
              item.PriceChangeOnStandardPOHistoryDetails?.forEach((detail) => {
                events.push({
                  type: 'PriceChange',
                  date: new Date(detail.priceChangeOnStandardPODate),
                  data: detail,
                  itemIndex,
                });
              });
          
              //Reversals (LastCredit)
              item.PriceReverseAlertDetailsOnStandardPO?.forEach((detail) => {
                events.push({
                  type: 'LastCredit',
                  date: new Date(detail.standardPOReverseDate),
                  data: detail,
                  itemIndex,
                });
              });
          
              //Item-level remittances
              item.RemittanceBalanceToBePaidDetailsOnStandardPO?.forEach((detail) => {
                events.push({
                  type: 'Remittance',
                  date: new Date(
                    detail.remitDateOnStandardPO ||
                    detail.remitDateOnStandardPO ||
                    detail.priceChangeOnStandardPODate
                  ),
                  data: detail,
                  itemIndex,
                });
              });
            });
          
            //Global remittances
            standardPO.TotalRemittanceMadeSoFarOnStandardPO?.forEach((entry) => {
              events.push({
                type: 'Remittance',
                date: new Date(entry.remittedDateOnStandardPO || entry.remitDateOnStandardPO),
                data: entry,
              });
            });
          
            //Priority index for sorting if dates are equal
            const priority = {
              LastCredit: 0,
              PriceChange: 1,
              Remittance: 2,
            };
          
            //Final sort
            events.sort((a, b) => {
              const timeDiff = a.date.getTime() - b.date.getTime();
              if (timeDiff !== 0) return timeDiff;
              return (priority[a.type] ?? 99) - (priority[b.type] ?? 99);
            });
          
            return events;
          }
          
        //Function to get the remittance balance to be paid on the purchase order
        function getRemittanceExpectedBalanceToBePaidOnPO(standardPO:IStandardPurchaseOrder):string {
            let totalBalance = 0;
            //Iterate over each item in standardPurchaseOrderItems
            standardPO.StandardPurchaseOrderItems.forEach((item) => {
                const balance = item.RemittanceBalanceToBePaidDetailsOnStandardPO?.[0]?.remittanceExpectedBalToBePaidStandardPO;
                if (balance !== undefined) {
                    totalBalance += balance;
                }
            });
            //Return the total balance or a message if no balance is available
            return totalBalance !== 0 ? totalBalance.toString() : 'No Balance Available on Controller';
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
        //Add the text to the PDF at the specified position
        doc.text(formattedValue, x, y);
        };

        //Function to handle the PDF for the purchase order
        function handleStandardPurchaseOrderForPDF(standardPO: IStandardPurchaseOrder) {
            console.log(`Searching for Standard Purchase Order with ID: ${standardPO.standardPurchaseOrderId}`);
        
        let cumulativeBalance = 0;
        let currentItemIndex = 0;
        
        const sortedEvents = sortTransactionsByDateAndTime(standardPO);
            sortedEvents.forEach((event) => {
                let rowValues: string[] = [];
                let shouldIncludeRow = true;
        
                switch (event.type) {
                    case 'PriceAtBookingPO': {
                        const currentItem = standardPO.StandardPurchaseOrderItems[currentItemIndex];
                        const itemPrice = parseFloat(currentItem.standardPurchaseOrderTotalStartPrice?.toString() || '0');
                        cumulativeBalance -= itemPrice;
                        rowValues = [
                            formatDateTime(event.data.priceChangeOnStandardPODate),
                            event.data.priceChangeOnStandardPORemarks ?? 'Price At Booking',
                            formatCurrency(itemPrice),
                            '',
                            formatCurrency(cumulativeBalance),
                        ];
                        currentItemIndex++;
                        break;
                    }
                    case 'LastCredit': {
                        const oldPrice = parseFloat(event.data.standardPOReverseOldPrice?.toString() || '0');
                        cumulativeBalance += oldPrice;
                        rowValues = [
                            formatDateTime(event.data.standardPOReverseDate),
                            event.data.standardPOReverseNewPriceAlertRemarks ?? 'Price Correction - Reversal',
                            '',
                            formatCurrency(oldPrice),
                            formatCurrency(cumulativeBalance),
                        ];
                        break;
                    }
                    case 'PriceChange': {
                        const newPrice = parseFloat(event.data.newTotalPriceAmountOnStandardPO?.toString() || '0');
                        cumulativeBalance -= newPrice;
                        rowValues = [
                            formatDateTime(event.data.priceChangeOnStandardPODate),
                            event.data.priceChangeOnStandardPORemarks ?? 'Price Change',
                            formatCurrency(newPrice),
                            '',
                            formatCurrency(cumulativeBalance),
                        ];
                        break;
                    }
                    case 'Remittance': {
                        const remittedAmount = parseFloat(event.data.remittedAmountOnStandardPO?.toString() || '0');
                        if (remittedAmount === 0) {
                          shouldIncludeRow = false;
                          break;
                        }
                        const remittanceDate = event.data.remittedDateOnStandardPO || event.data.remitDateOnStandardPO || event.data.priceChangeOnStandardPODate;
                        const remarks = event.data.remittedRemarksOnStandardPO || event.data.remittanceUpdateRemarksOnStandardPO || 'Remittance';
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
                    drawSectionBTransactionRows(rowValues, event, standardPO, headersSectionB, headersSectionB);
                }
            });
        }
        

        //Function to draw the footer on the PDF
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated On: ${generatedDate}`, 30, doc.page.height - 50, {align:'center'});
        };
        
        //Call the Function to handle the generation of the purchase order PDF
        handleStandardPurchaseOrderForPDF(standardPO);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully:', filePath);
        
        }catch (error) {
            console.error('Error Generating PDF on Controller:', error);
        }     
};
        
//Export the controller function
export default StandardPurchaseOrderPDFController;
        