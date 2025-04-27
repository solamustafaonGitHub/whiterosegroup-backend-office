import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 4-digit short ID
function generateHouseShortId(): string {
    const min = 2001;
    const max = 2999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
};

//Exporting the function
console.log('Combined FOREA-House ID:', generateHouseShortId());
export {generateHouseShortId};