import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import * as url from 'url';
import { PaymentPlanForFractionalOwnership } from '../models/paymentPlanForFractionalOwnership.model.js';
;
export const PaymentPlanPDFController = async (req, res) => {
    console.log("Received Request Params:", req.params);
    const paymentPlanId = req.params.id;
    console.log("Payment Plan ID:", paymentPlanId);
    if (!paymentPlanId) {
        console.error("Error:Payment Plan ID is undefined!");
        return res.status(400).send({ message: "Payment Plan ID is required" });
    }
    try {
        const paymentPlan = await PaymentPlanForFractionalOwnership.findOne({ paymentPlanId });
        if (!paymentPlan) {
            return res.status(404).send({ message: "Payment Plan Not Found" });
        }
        const paymentPlanObject = paymentPlan.toObject();
        const outputFilePath = path.resolve(`./pdfs/paymentPlan_${paymentPlanId}.pdf`);
        await generatePaymentPlanPDF(outputFilePath, paymentPlanObject);
        res.download(outputFilePath, `PaymentPlan_${paymentPlanId}.pdf`, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Scheme Information PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generatePaymentPlanPDF(outputFilePath, paymentPlan) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `PaymentPlan_${paymentPlan.paymentPlanId || "Unknown"}.pdf`;
    const filePath = path.join(__dirname, fileName);
    doc.pipe(fs.createWriteStream(filePath));
    try {
        const logoPath = path.resolve(__dirname, '../images/asset360LogoPP.png');
        try {
            const logo = fs.readFileSync(logoPath);
            doc.image(logo, 50, 50, { width: 60 });
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
        doc.text('__________________________________________________________________________________________', { align: 'left' });
        doc.moveDown();
        const detailsX = 30;
        const newYPosition = doc.y + 10;
        doc.font('Helvetica-Bold').fontSize(8.5).text(`Payment Plan ID:${paymentPlan.paymentPlanId}`, detailsX, newYPosition);
        doc.moveDown(0.25);
        const formatCurrency = (value) => {
            const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return formatter.format(Math.abs(value));
        };
        function formatDate(date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleDateString();
        }
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;
        const headersSectionA = [105, 190, 48, 57, 87, 53];
        const headingsSectionA = ['Payment Plan Name', 'Payment Plan Desc.', 'Payment Type', 'Payment Frequency', 'Fr.Unit Amount', 'Amort. Duration'];
        const valuesSectionA = [paymentPlan.paymentPlanName || 'N/A',
            paymentPlan.paymentPlanDescription || 'N/A',
            paymentPlan.paymentType || 'N/A',
            paymentPlan.paymentFrequency || 'N/A',
            formatCurrency(paymentPlan.fractionalUnitPropertyAmount || 0),
            paymentPlan.paymentDurationInMonths || 'N/A'
        ];
        function drawSectionACell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionAHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headersSectionA[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
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
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
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
        doc.moveDown(0.2);
        const headerSectionA2 = [180, 180, 180];
        doc.y = tableY + 15;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Applicable Interest & Other Fees', contentX, doc.y, { underline: true });
        doc.moveDown(0.05);
        let tableYSectionA2 = doc.y + 5;
        const headingsSectionA2 = ['Interest Face Value Details', 'Other Fees (Mandatory)', 'Other Fees (Percent)'];
        function drawSectionA2Cell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionA2HeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionA2.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionA2[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxHeaderHeight > availableSpace) {
                doc.addPage();
                tableYSectionA2 = 50;
            }
            headingsSectionA2.forEach((header, index) => {
                drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxHeaderHeight, header, true);
                currentX += headerSectionA2[index];
            });
            tableYSectionA2 += maxHeaderHeight;
        }
        function drawSectionA2ValuesRows() {
            let currentX = tableX;
            let maxRowHeight = 0;
            const mandatoryFees = paymentPlan.OtherApplicableFlatFees
                .map(fee => `${fee.flatFeeName}: ${formatCurrency(fee.flatFeeFaceValue)}`)
                .join(paymentPlan.OtherApplicableFlatFees.length > 1 ? '\n' : ',');
            const otherFees = paymentPlan.OtherApplicablePercentageFees
                .map(fee => `${fee.percentageFeeName + ' ' + '(' + fee.percentageRate + '%)'}: ${formatCurrency(fee.percentageFaceValue)}`)
                .join(paymentPlan.OtherApplicablePercentageFees.length > 1 ? '\n' : ',');
            const values = [
                `Interest Rate (If Applicable):${paymentPlan.interestRateIfRequired + '% Per Annum' || 'N/A'} \nInterest Face Value:${paymentPlan.interestFeeAccumulatedFaceValue !== undefined ? formatCurrency(paymentPlan.interestFeeAccumulatedFaceValue) : 'N/A'}`,
                mandatoryFees,
                otherFees
            ];
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value || '', { width: headerSectionA2[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            if (tableYSectionA2 + maxRowHeight > doc.page.height - 50) {
                doc.addPage();
                tableYSectionA2 = 50;
                drawSectionA2HeaderRow();
            }
            values.forEach((value, index) => {
                drawSectionA2Cell(currentX, tableYSectionA2, headerSectionA2[index], maxRowHeight, value);
                currentX += headerSectionA2[index];
            });
            tableYSectionA2 += maxRowHeight;
        }
        drawSectionA2HeaderRow();
        drawSectionA2ValuesRows();
        doc.moveDown(2);
        const headerSectionB = [45, 65, 68, 68, 68, 70, 70, 83];
        doc.y = tableY + 125;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Amortization Schedule', contentX, doc.y, { underline: true });
        doc.moveDown(0.2);
        let tableYSectionB = doc.y + 5;
        const headingsSectionB = ['Payment No.', 'Payment Due Date', 'Payment Due Amount', 'Interest Payable', 'Other Fees (Mandatory)', 'Other Fees (Percent)', 'Total Payable', 'Balance To Be Paid'];
        function drawSectionBCell(x, y, width, height, text, isHeader = false) {
            x = x || 0;
            y = y || 0;
            width = width || 50;
            height = height || 20;
            doc.rect(x, y, width, height).stroke();
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.0);
            const padding = 5;
            doc.text(text || 'N/A', x + padding, y + padding, { width: width - padding * 2, align: 'left', lineBreak: true });
        }
        ;
        function drawSectionBHeaderRow() {
            let currentX = tableX;
            let maxHeaderHeight = 0;
            headingsSectionB.forEach((header, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(header, { width: headerSectionB[index] - 10, align: 'left', lineBreak: true });
                maxHeaderHeight = Math.max(maxHeaderHeight, textHeight + 10);
            });
            const availableSpace = doc.page.height - doc.y - doc.page.margins.bottom;
            if (maxHeaderHeight > availableSpace) {
                doc.addPage();
                tableYSectionB = doc.page.margins.top;
            }
            headingsSectionB.forEach((header, index) => {
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxHeaderHeight, header, true);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxHeaderHeight;
        }
        function drawSectionDValuesRows() {
            let currentX = tableX;
            let maxRowHeight = 0;
            const aggregatedAmount = paymentPlan.fractionalUnitPropertyAmount
                + (paymentPlan.interestFeeAccumulatedFaceValue || 0)
                + paymentPlan.OtherApplicableFlatFees.reduce((sum, fee) => sum + fee.flatFeeFaceValue, 0)
                + paymentPlan.OtherApplicablePercentageFees.reduce((sum, fee) => sum + fee.percentageFaceValue, 0);
            console.log('Aggregated Amount:', aggregatedAmount);
            const firstRowValues = ["-", "-", "-", "-", "-", "-", "-", formatCurrency(aggregatedAmount)];
            firstRowValues.forEach((value, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(value || '', { width: headerSectionB[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                doc.addPage();
                tableYSectionB = 50;
                drawSectionBHeaderRow();
            }
            firstRowValues.forEach((value, index) => {
                doc.font('Helvetica-Bold');
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxRowHeight;
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
                values.forEach((value, index) => {
                    const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString() || '', { width: headerSectionB[index] - 20, align: 'left', lineBreak: true });
                    maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
                });
                if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                    doc.addPage();
                    tableYSectionB = 50;
                    drawSectionBHeaderRow();
                }
                values.forEach((value, index) => {
                    drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                    currentX += headerSectionB[index];
                });
                tableYSectionB += maxRowHeight;
            });
            const lastRowValues = ['Total', '-', '', '', '', '', '', '-'];
            const duePaymentAmountSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.DuePaymentAmountPerFrequency, 0);
            const interestFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.InterestFeesPayablePerFrequency, 0);
            const otherFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.OtherFlatFeePayablePerFrequency, 0);
            const otherPercentageFeesSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.OtherPercentageFeePayablePerFrequency, 0);
            const totalPayableSum = paymentPlan.AmortizationSchedule.reduce((sum, schedule) => sum + schedule.TotalPayablePerFrequency, 0);
            lastRowValues[2] = formatCurrency(duePaymentAmountSum);
            lastRowValues[3] = formatCurrency(interestFeesSum);
            lastRowValues[4] = formatCurrency(otherFeesSum);
            lastRowValues[5] = formatCurrency(otherPercentageFeesSum);
            lastRowValues[6] = formatCurrency(totalPayableSum);
            currentX = tableX;
            maxRowHeight = 0;
            lastRowValues.forEach((value, index) => {
                const textHeight = doc.font('Helvetica-Bold').fontSize(8.0).heightOfString(value || '', { width: headerSectionB[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            if (tableYSectionB + maxRowHeight > doc.page.height - 50) {
                doc.addPage();
                tableYSectionB = 50;
                drawSectionBHeaderRow();
            }
            lastRowValues.forEach((value, index) => {
                doc.font('Helvetica-Bold');
                drawSectionBCell(currentX, tableYSectionB, headerSectionB[index], maxRowHeight, value);
                currentX += headerSectionB[index];
            });
            tableYSectionB += maxRowHeight;
        }
        drawSectionBHeaderRow();
        drawSectionDValuesRows();
        doc.moveDown(3);
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        ;
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error('Error Generating PDF on Controller:', error);
    }
}
;
export default PaymentPlanPDFController;
