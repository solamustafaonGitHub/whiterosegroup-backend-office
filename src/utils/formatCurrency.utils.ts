import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

//Function to format currency values
const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const formattedValue = formatter.format(Math.abs(value)); // Format the absolute value
    return value < 0 ? `(${formattedValue})` : formattedValue; // Add parentheses for negative values
  };

export default formatCurrency;


