// import {RecordJSON} from 'adminjs'
// import {jsPDF} from 'jspdf'

// const pdfGenerator = (record: RecordJSON): string => {
//   const {params} = record
//   const doc = new jsPDF()
  
//   doc.text(params.orderNum, 10, 10) // example database column called orderNum
//   doc.text(params.shippingAddress, 150, 10) // example database column called shippingAddress
  
//   const filename = `/${params.id}.pdf`
//   doc.save(`./pdfs${filename}`)
  
//   return filename
// }
// export default pdfGenerator