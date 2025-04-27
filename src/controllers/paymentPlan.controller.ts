import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import {fileURLToPath} from 'url';
import * as url from 'url';
import {Request, Response} from 'express';
import {PaymentPlan, IPaymentPlan, AmortizationSchedule, IAmortizationSchedule} from '../models/paymentPlan.model.js';
import formatCurrency from '../utils/addFormatToCurrency.utils.js';
import addFormatToCurrencyInThePDF from '../utils/addFormatToCurrency.utils.js';
import formatDateTime from '@src/utils/formatDateTime.utils.js';

interface PaymentPlan {
   amortizationSchedule: IAmortizationSchedule[];
};

export const PaymentPlanPDFController = async (req:Request, res:Response) => {
    console.log("Received Request Params:", req.params);
    const paymentPlanId = req.params.id;
    console.log("Payment Plan ID:", paymentPlanId);
    if (!paymentPlanId) {
        console.error("Error: Payment Plan ID is undefined!");
        return res.status(400).send({message:"Payment Plan ID is required"});
    }

    try{
        const paymentPlan = await PaymentPlan.findOne({paymentPlanId});
        if(!paymentPlan){
            return res.status(404).send({message:"Payment Plan Not Found"});
        }
        const paymentPlanObject = paymentPlan.toObject() as IPaymentPlan;
        const outputFilePath = path.resolve(`./pdfs/paymentPlan_${paymentPlanId}.pdf`);
        await generatePaymentPlanPDF(outputFilePath, paymentPlanObject);
        res.download(outputFilePath, `PaymentPlan_${paymentPlanId}.pdf`, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({error: "Error Downloading PDF"});
            }
        });
    }catch(error){
        console.error("Error Generating Scheme Information PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${(error as Error).message}`});
    }
};


async function generatePaymentPlanPDF(outputFilePath:string, paymentPlan:IPaymentPlan): Promise<void> {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `PaymentPlan_${paymentPlan.paymentPlanId || "Unknown"}.pdf`;
    const filePath = path.join(__dirname, fileName);

        doc.pipe(fs.createWriteStream(filePath));
        try {
            const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
            try {
                const logo = fs.readFileSync(logoPath);
                doc.image(logo, 50, 50, {width:60});
            }catch (error) {
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
            
        doc.font('Helvetica-Bold').fontSize(8.5).text(`Payment Plan ID:${paymentPlan.paymentPlanId}`, detailsX, newYPosition);
        doc.moveDown(0.25);
            
        //Function to format currency
        const formatCurrency = (value:number): string => {
        const formatter = new Intl.NumberFormat('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        return formatter.format(Math.abs(value)); // Format the absolute value
        };

        //Function to format date
        function formatDate(date) {
            if (typeof date === 'string') {
                date = new Date(date); // Convert string to Date object
            }
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return 'N/A'; // Return 'N/A' for invalid dates
            }
            return date.toLocaleDateString(); // Return only the date
        }
            
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
    
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;

        //------------------Draw a Rectangle A around the Payment Plan Information---------------------------------------
        const headersSectionA = [105, 190, 48, 57, 87, 53];
        const headingsSectionA = ['Payment Plan Name', 'Payment Plan Desc.','Payment Type','Payment Frequency','Fr.Unit Amount', 'Amort. Duration'];
        const valuesSectionA = [paymentPlan.paymentPlanName || 'N/A', 
                                paymentPlan.paymentPlanDescription || 'N/A',
                                paymentPlan.paymentType || 'N/A',
                                paymentPlan.paymentFrequency || 'N/A',
                                formatCurrency(paymentPlan.fractionalUnitPropertyAmount || 0),
                                paymentPlan.paymentDurationInMonths || 'N/A'
                            ];
        //function to draw a cell in the table
        function drawSectionACell(x, y, width, height, text, isHeader = false) {x = x || 0; y = y || 0; width = width || 50; height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {width:width - padding * 2, align:'left', lineBreak:true});
        };
        //function to draw the header row for the table
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, {width: headersSectionA[index] - 10, align:'left', lineBreak:true});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            headingsSectionA.forEach((header, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxHeaderHeight, header, true);
                currentX += headersSectionA[index];
            });
            tableY += maxHeaderHeight;
        };
        //function to draw the values row for the table
        function drawSectionAValuesRow() {
            let currentX = tableX;
            let maxRowHeight = 0;
            valuesSectionA.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), {width: headersSectionA[index] - 20, align:'left', lineBreak:true});
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            valuesSectionA.forEach((value, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                currentX += headersSectionA[index];
            });
            tableY += maxRowHeight;
        };
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(0.2);


        //---------------------Draw a Rectangle A2 around Interest Rate & Other Fees-------------------------------------------
        const headerSectionA2 = [180, 180, 180]; 
        doc.y = tableY + 15;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Applicable Interest & Other Fees', contentX, doc.y, {underline:true});
        doc.moveDown(0.05);

        let tableYSectionA2 = doc.y + 5;
        const headingsSectionA2 = ['Interest Face Value Details', 'Other Fees (Mandatory)', 'Other Fees (Percent)'];

        //Function to draw a cell in the table
        function drawSectionA2Cell(x, y, width, height, text, isHeader = false) {x = x || 0; y = y || 0; width = width || 50; height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {width: width - padding * 2, align:'left', lineBreak:true});
        };

        // Function to draw the header row for the table
        function drawSectionA2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            // Measure header height
            headingsSectionA2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionA2[index] - 10, align:'left', lineBreak:true});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            // Check if there's enough space for the header
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxHeaderHeight > availableSpace) {
                doc.addPage();
                tableYSectionA2 = 50; // Reset table Y position for the new page
            }
            // Draw header cells
            headingsSectionA2.forEach((header, index) => {
                drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxHeaderHeight, header, true);
                currentX += headerSectionA2[index];
            });
                tableYSectionA2 += maxHeaderHeight;
            }

            //Function to draw value rows for the table
            function drawSectionA2ValuesRows() {
            let currentX = tableX;
            let maxRowHeight = 0;
            
            // Draw the first row with interest rate and face value
            const mandatoryFees = paymentPlan.OtherApplicableFlatFees
                .map(fee => `${fee.flatFeeName}: ${formatCurrency(fee.flatFeeFaceValue)}`)
                .join(paymentPlan.OtherApplicableFlatFees.length > 1 ? '\n' : ','); 
            // Draw the second row with mandatory fees
            const otherFees = paymentPlan.OtherApplicablePercentageFees
                .map(fee => `${fee.percentageFeeName + ' ' + '(' + fee.percentageRate + '%)'}: ${formatCurrency(fee.percentageFaceValue)}`)
                .join(paymentPlan.OtherApplicablePercentageFees.length > 1 ? '\n' : ',');
            
            const values = [
                `Interest Rate (If Applicable):${paymentPlan.interestRateIfRequired + '% Per Annum' || 'N/A'} \nInterest Face Value:${paymentPlan.interestFeeAccumulatedFaceValue !== undefined ? formatCurrency(paymentPlan.interestFeeAccumulatedFaceValue) : 'N/A'}`,
                mandatoryFees,
                otherFees
            ];
            // Calculate height for the row
            values.forEach((value, index) => {
            const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value || '', { width: headerSectionA2[index] - 20, align:'left', lineBreak:true});
            maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            }
            );
            // Check if row fits on the page
            if (tableYSectionA2 + maxRowHeight > doc.page.height - 50) {
            doc.addPage();
            tableYSectionA2 = 50; // Reset Y for new page
            drawSectionA2HeaderRow(); // Re-draw header
            }
            // Draw the row
            values.forEach((value, index) => {
            drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxRowHeight, value);
            currentX += headerSectionA2[index];
            }
            );
            tableYSectionA2 += maxRowHeight; // Move Y down for next row
            }
            // Draw the table with header and rows
            drawSectionA2HeaderRow();
            drawSectionA2ValuesRows();
            doc.moveDown(2);



        //---------------------Draw a Rectangle B around Amortization Schedule & add currency formatting-------------------------------------------
        const headerSectionB = [45, 65, 68, 68, 68, 70, 70, 83]; // Column widths
        doc.y = tableY + 125;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Amortization Schedule', contentX, doc.y, {underline:true});
        doc.moveDown(0.2);
        
        let tableYSectionB = doc.y + 5;
        const headingsSectionB = ['Payment No.', 'Payment Due Date', 'Payment Due Amount', 'Interest Payable', 'Other Fees (Mandatory)', 'Other Fees (Percent)', 'Total Payable', 'Balance To Be Paid'];

        //Function to draw a cell in the table
        function drawSectionBCell(x, y, width, height, text, isHeader = false) {x = x || 0; y = y || 0; width = width || 50; height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, {width: width - padding * 2, align:'left', lineBreak:true});
        };

        // Function to draw the header row for the table
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            // Measure header height
            headingsSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionB[index] - 10, align:'left', lineBreak:true});
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            // Check if there's enough space for the header
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxHeaderHeight > availableSpace) {
                doc.addPage();
                tableYSectionB = doc.page.margins.top; // Reset table Y position for the new page
            }
            // Draw header cells
            headingsSectionB.forEach((header, index) => {
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxHeaderHeight, header, true);
                currentX += headerSectionB[index];
            });
                tableYSectionB += maxHeaderHeight;
            }

        //Function to draw value rows for the table
        function drawSectionDValuesRows() {
            let currentX = tableX;
            let maxRowHeight = 0;
        
            // Calculate the aggregated amount
            const aggregatedAmount = paymentPlan.fractionalUnitPropertyAmount
                + (paymentPlan.interestFeeAccumulatedFaceValue || 0)
                + paymentPlan.OtherApplicableFlatFees.reduce((sum, fee) => sum + fee.flatFeeFaceValue, 0)
                + paymentPlan.OtherApplicablePercentageFees.reduce((sum, fee) => sum + fee.percentageFaceValue, 0);
            console.log('Aggregated Amount:', aggregatedAmount);
        
            //FIRST ROW (Special case with aggregated amount)
            const firstRowValues = ["-", "-", "-", "-", "-", "-", "-", formatCurrency(aggregatedAmount)];
        
           //Calculate height for first row
            firstRowValues.forEach((value, index) => {
            const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(value || '', {width:headerSectionB[index] - 20, align:'left', lineBreak:true});
            maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });

            // Check if first row fits on the page
            if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                doc.addPage();
                tableYSectionB = 50; // Reset Y for new page
                drawSectionBHeaderRow(); // Re-draw header
            }
        
            //Draw first row
            firstRowValues.forEach((value, index) => {
                doc.font('Helvetica-Bold'); // Set font to bold
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxRowHeight; // Move Y down for next row
        
            // Draw the remaining rows
            paymentPlan.AmortizationSchedule.forEach((amortizationSchedule, rowIndex) => {
                currentX = tableX;
                maxRowHeight = 0;
        
                const values = [
                    amortizationSchedule.PaymentNoCount.toString(),
                    formatDate(amortizationSchedule.PaymentDueDatePerFrequency),
                    formatCurrency(amortizationSchedule.DuePaymentAmountPerFrequency),
                    formatCurrency(amortizationSchedule.InterestFeesPayablePerFrequency),
                    formatCurrency(amortizationSchedule.OtherFlatFeePayablePerFrequency),
                    formatCurrency(amortizationSchedule.OtherPercentageFeePayablePerFrequency),
                    formatCurrency(amortizationSchedule.TotalPayablePerFrequency),
                    formatCurrency(amortizationSchedule.BalanceToBePaidPerFrequency)
                ];
        
                //Calculate height for the current row
                values.forEach((value, index) => {
                    const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString() || '', {width:headerSectionB[index] - 20, align:'left', lineBreak: true });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
                });
        
                //Check if row fits on the current page
                if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                    doc.addPage();
                    tableYSectionB = 50; // Reset Y position for new page
                    drawSectionBHeaderRow(); // Redraw header on the new page
                }
        
                //Draw each cell in the row
                values.forEach((value, index) => {
                    drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                    currentX += headerSectionB[index];
                });
                tableYSectionB += maxRowHeight; // Move Y position for the next row
            });
        
            //LAST ROW (Sum Totals row)
            const lastRowValues = ['Total', '-', '', '', '', '', '', '-'];
        
            // Calculate sums for the last row
            const duePaymentAmountSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.DuePaymentAmountPerFrequency, 0);
            const interestFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.InterestFeesPayablePerFrequency, 0);
            const otherFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.OtherFlatFeePayablePerFrequency, 0);
            const otherPercentageFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.OtherPercentageFeePayablePerFrequency, 0);
            const totalPayableSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.TotalPayablePerFrequency, 0);
        
            // Populate the last row with calculated sums
            lastRowValues[2] = formatCurrency(duePaymentAmountSum);
            lastRowValues[3] = formatCurrency(interestFeesSum);
            lastRowValues[4] = formatCurrency(otherFeesSum);
            lastRowValues[5] = formatCurrency(otherPercentageFeesSum);
            lastRowValues[6] = formatCurrency(totalPayableSum);
        
           //Calculate height for the last row
            currentX = tableX;
            maxRowHeight = 0;
            lastRowValues.forEach((value, index) => {
            const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(value || '', {width:headerSectionB[index] - 20, align:'left', lineBreak:true});
            maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
        
            // Check if last row fits on the page
            if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                doc.addPage();
                tableYSectionB = 50; // Reset Y for new page
                drawSectionBHeaderRow(); // Re-draw header
            }
           //Draw last row
            lastRowValues.forEach((value, index) => {
            doc.font('Helvetica-Bold'); // Set font to bold
            drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
            currentX += headerSectionB[index];
            });
            tableYSectionB += maxRowHeight; // Move Y down for next row
        }
        // Draw the table with header and rows
        drawSectionBHeaderRow();
        drawSectionDValuesRows();
        doc.moveDown(3);

        //Function to draw the footer on the PDF
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, {align:'center'});
        };

        //handlePaymentPlanInformationForPDF(paymentPlan, doc, tableX, tableY);
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);


    }catch (error) {
        console.error('Error Generating PDF on Controller:', error);
        }
    };
        
export default PaymentPlanPDFController;