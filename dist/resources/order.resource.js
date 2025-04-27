import { PurchaseOrder } from "../models/purchaseOrder.model.js";
import PDFGeneratorComponent from "../components/Pdfgenerator.component.js";
import pdfGenerator from "../resources/pdfGenerator.js";
const exportPurchaseOrder = {
    resource: PurchaseOrder,
    options: {
        actions: {
            PDFGenerator: {
                actionType: 'record',
                icon: 'GeneratePdf',
                component: PDFGeneratorComponent,
                handler: (request, response, context) => {
                    const { record, currentAdmin } = context;
                    return {
                        record: record.toJSON(currentAdmin),
                        url: pdfGenerator(record.toJSON(currentAdmin))
                    };
                }
            }
        }
    }
};
export default exportPurchaseOrder;
