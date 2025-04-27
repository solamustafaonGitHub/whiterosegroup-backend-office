import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';
import formatCurrency from '../utils/formatCurrency.utils.js';
 
 //Function to add text to the PDF with appropriate color
 const addFormatToCurrencyInThePDF = (doc:PDFKit.PDFDocument, value:number, x:number, y:number) => {
    //Set the color based on whether the value is negative
    if (value < 0) {
        doc.fillColor('red');
        } else { doc.fillColor('black');
    }
    //Format the value and add parentheses for negative numbers
    const formattedValue = value < 0 ? `(${formatCurrency(value)})` : formatCurrency(value);
    // Add the text to the PDF at the specified position
    doc.text(formattedValue, x, y);
};

export default addFormatToCurrencyInThePDF;
