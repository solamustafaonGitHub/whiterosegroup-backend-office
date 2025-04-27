import fs from 'fs';
import path from 'path';
import * as url from 'url';
import PDFDocument from 'pdfkit';
import { Project214Information } from '../models/project214Information.model.js';
import formatDateTime from '../utils/formatDateTime.utils.js';
export const Project214PDFController = async (req, res) => {
    console.log("Received Request Params:", req.params);
    const projectShortId = req.params.id;
    console.log("Received Project214 Id:", projectShortId);
    if (!projectShortId) {
        console.error("Error: projectShortId is undefined!");
        return res.status(400).json({ error: "Invalid request, projectShortId is required" });
    }
    try {
        const project214Information = await Project214Information.findOne({ projectShortId });
        if (!project214Information) {
            return res.status(404).json({ error: "Project 214 Information Not Found" });
        }
        const project214InformationObject = project214Information.toObject();
        const outputFilePath = path.resolve(`./pdfs/project214information_${projectShortId}.pdf`);
        console.log("Generating PDF at:", outputFilePath);
        await generateProject214InformationPDF(outputFilePath, project214InformationObject);
        if (!fs.existsSync(outputFilePath)) {
            console.error("Error: Generated PDF file not found at:", outputFilePath);
            return res.status(500).json({ error: "PDF Generation Failed" });
        }
        res.download(outputFilePath, `Project214Information_${projectShortId}.pdf`, (err) => {
            if (err) {
                console.error("Error during file download:", err);
                return res.status(500).json({ error: "Error Downloading PDF" });
            }
        });
    }
    catch (error) {
        console.error("Error Generating Project 214 Information PDF:", error);
        res.status(500).json({ error: `Error Generating PDF: ${error.message}` });
    }
};
async function generateProject214InformationPDF(outputFilePath, project214Information) {
    const doc = new PDFDocument();
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const fileName = `Project214Information_${project214Information.projectShortId || 'Unknown'}.pdf`;
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
        doc.font('Helvetica-Bold').fontSize(8.5).text(`Project ID:${project214Information.projectShortId}`, detailsX, newYPosition);
        doc.moveDown(0.25);
        const pageWidth = 595.28;
        const rightMargin = 15;
        const offset = 250;
        const titleX = pageWidth - rightMargin - offset;
        const contentX = detailsX;
        const tableX = contentX;
        let tableY = doc.y + 15;
        const headersSectionA = [63, 129, 60, 57, 60, 87, 95];
        const headingsSectionA = ['Project Name', 'Project Description', 'Project Start Date', 'Project Completion Length (in Months)', 'Project Current Acquisition Phase', 'Project Completion Date', 'Acceptable Payment Plan(s)'];
        const values = [
            project214Information.projectName || 'N/A',
            project214Information.projectDescription || 'N/A',
            formatDateTime(project214Information.projectStartDate) || 'N/A',
            project214Information.projectCompletionLengthInMonths || 'N/A',
            project214Information.projectCurrentAcquisitionPhase || 'N/A',
            project214Information.projectCompletionDate || 'N/A',
            project214Information.MultiSelectPaymentPlan.selectedPlans.map(plan => plan.selectedPlanName).join(', ') || 'N/A'
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
            values.forEach((value, index) => {
                const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headersSectionA[index] - 20, align: 'left', lineBreak: true });
                maxRowHeight = Math.max(maxRowHeight, textHeight + 10);
            });
            values.forEach((value, index) => {
                drawSectionACell(currentX, tableY, headersSectionA[index], maxRowHeight, value);
                currentX += headersSectionA[index];
            });
            tableY += maxRowHeight;
        }
        ;
        drawSectionAHeaderRow();
        drawSectionAValuesRow();
        doc.moveDown(9);
        const headerSectionB = [35, 140, 120, 90, 90];
        doc.y = tableY + 25;
        doc.font('Helvetica-Bold').fontSize(8.5).text('Project214 Information', tableX, doc.y, { underline: true });
        let tableYSectionB = doc.y + 5;
        const headingsSectionB = ['Count', 'Property Fr. Unit Identifier', 'Fr. Unit Allocation No.', 'Fr. Unit Sale Price', 'Fr. Unit Sale Status'];
        const formatCurrency = (value) => {
            const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'NGN' });
            const formattedValue = formatter.format(Math.abs(value));
            return value < 0 ? `(${formattedValue})` : formattedValue;
        };
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
        ;
        const getAllFractionalUnitDetails = (projectStructure) => {
            const allFractionalUnits = [];
            projectStructure.forEach((block) => {
                block.houseDetails.forEach((house) => {
                    house.fractionalUnitDetails.forEach((fractionalUnit) => {
                        const values = [
                            fractionalUnit.propertyCount || 'N/A',
                            fractionalUnit.fractionalUnitUniqueIdentifier || 'N/A',
                            fractionalUnit.propertyAllocationNumber || 'N/A',
                            formatCurrency(fractionalUnit.fractionUnitSalesPrice) || 'N/A',
                            fractionalUnit.fractionalUnitSalesTag || 'N/A',
                        ];
                        allFractionalUnits.push(values);
                    });
                });
            });
            return allFractionalUnits;
        };
        function drawSectionBValuesRow() {
            const allFractionalUnits = getAllFractionalUnitDetails(project214Information.projectStructure);
            allFractionalUnits.forEach((values) => {
                let currentX = tableX;
                let maxRowHeight = 0;
                values.forEach((value, index) => {
                    const textHeight = doc.font('Helvetica').fontSize(8.0).heightOfString(value.toString(), { width: headerSectionB[index] - 20, align: 'left', lineBreak: true });
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
        }
        drawSectionBHeaderRow();
        drawSectionBValuesRow();
        doc.moveDown(0.1);
        function drawFooter() {
            const generatedDate = new Date().toDateString();
            doc.fontSize(7).text(`Generated on Service: ${generatedDate}`, 30, doc.page.height - 50, { align: 'center' });
        }
        doc.on('end', drawFooter);
        doc.end();
        console.log('PDF Generated Successfully on Controller:', filePath);
    }
    catch (error) {
        console.error("Error Generating PDF:", error);
    }
}
;
export default Project214PDFController;
