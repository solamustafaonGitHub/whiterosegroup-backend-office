import { PurchaseOrder } from 'src/models/purchaseOrder.model.js';
import PDFDocument from 'pdfkit';
const resourceOptions = {
    actions: {
        exportToPDF: {
            actionType: 'record',
            icon: 'Export',
            isVisible: true,
            component: false,
            handler: async (request, response, context) => {
                const { record } = context;
                if (record && record.params) {
                    try {
                        const data = await PurchaseOrder.findById(record.params._id).exec();
                        const tabularData = processDataForPDF(data);
                        function processDataForPDF(data) {
                            return {
                                purchaseOrderId: data.purchaseOrderId,
                                pOrderUserProfileFullName: data.pOrderUserProfileFullName,
                                pOrderUserProfilePhoneNo: data.pOrderUserProfilePhoneNo,
                                pOrderUserProfileEmail: data.pOrderUserProfileEmail,
                                purchaseOrderIntentItemName: data.purchaseOrderIntentItemName,
                                purchaseOrderUnitPrice: data.purchaseOrderUnitPrice,
                                purchaseOrderTotalStartPrice: data.purchaseOrderTotalStartPrice,
                                createdAt: data.createdAt,
                                lastUpdatedAt: data.lastUpdatedAt,
                            };
                        }
                        const pdfDocument = generatePDF(tabularData);
                        function generatePDF(data) {
                            const doc = new PDFDocument();
                            doc.fontSize(12).text(`Purchase Order ID: ${data.purchaseOrderId}`);
                            doc.fontSize(12).text(`User Full Name: ${data.pOrderUserProfileFullName}`);
                            doc.fontSize(12).text(`User Phone No: ${data.pOrderUserProfilePhoneNo}`);
                            doc.fontSize(12).text(`User Email: ${data.pOrderUserProfileEmail}`);
                            doc.fontSize(12).text(`Item Name: ${data.purchaseOrderIntentItemName}`);
                            doc.fontSize(12).text(`Unit Price: ${data.purchaseOrderUnitPrice}`);
                            doc.fontSize(12).text(`Total Start Price: ${data.purchaseOrderTotalStartPrice}`);
                            doc.fontSize(12).text(`Created At: ${data.createdAt}`);
                            doc.fontSize(12).text(`Last Updated At: ${data.lastUpdatedAt}`);
                            return doc;
                        }
                        response.setHeader('Content-Type', 'application/pdf');
                        response.setHeader('Content-Disposition', 'attachment; filename="export.pdf"');
                        pdfDocument.pipe(response);
                        pdfDocument.end();
                        return {
                            record: record.toJSON(),
                            params: { pdfGenerated: true },
                        };
                    }
                    catch (error) {
                        console.error('Error generating PDF:', error);
                        return {
                            notice: {
                                message: 'Error generating PDF. Please try again later.',
                                type: 'error',
                            },
                        };
                    }
                }
                return response;
            },
        },
    },
};
export default resourceOptions;
