import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 4-digit short ID
function generateCombinedPropertyID(): string {
    const min = 5388001;
    const max = 9999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7,'0');
};

//Exporting the function
console.log('Combined Property ID:', generateCombinedPropertyID());
export {generateCombinedPropertyID};