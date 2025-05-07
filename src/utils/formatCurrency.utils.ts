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

// function formatCurrency(value: number | string): string {
//   const numericValue = typeof value === 'string' ? parseFloat(value) : value;

//   if (isNaN(numericValue)) {
//       console.warn('Invalid number passed to formatCurrency:', value);
//       return '0';
//   }

//   return numericValue
//       .toFixed(2)                            // Ensure two decimal places
//       .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // Add commas
// }

export default formatCurrency;


