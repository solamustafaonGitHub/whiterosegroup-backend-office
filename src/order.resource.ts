// const orderResource = {
//     resource: Order,
//     options: {
//         actions: {
//             PDFGenerator: {
//                 actionType: 'record',
//                 icon: 'GeneratePdf',
//                 component: Components.PDFGenerator,
//                 handler: (request, response, context) => {
//                     const { record, currentAdmin } = context
//                     return {
//                         record: record.toJSON(currentAdmin),
//                         url: pdfgenerator(record.toJSON(currentAdmin))
//                     }
//                 }
//             }
//         }
//     }
// }