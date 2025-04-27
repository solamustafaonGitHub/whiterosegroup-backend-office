import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

//Function to generate a 15-digit short ID
function generateCombinedRemittanceShortId(): string {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
};

//Exporting the function
console.log('Combined Remittance ID:', generateCombinedRemittanceShortId());
export {generateCombinedRemittanceShortId};