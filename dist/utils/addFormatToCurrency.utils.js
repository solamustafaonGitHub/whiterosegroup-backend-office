import formatCurrency from '../utils/formatCurrency.utils.js';
const addFormatToCurrencyInThePDF = (doc, value, x, y) => {
    if (value < 0) {
        doc.fillColor('red');
    }
    else {
        doc.fillColor('black');
    }
    const formattedValue = value < 0 ? `(${formatCurrency(value)})` : formatCurrency(value);
    doc.text(formattedValue, x, y);
};
export default addFormatToCurrencyInThePDF;
