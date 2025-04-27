import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 4-digit short ID
function generateUOMShortId(): string {
    const min = 1010;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
};

//Exporting the function
console.log('UOM ID:', generateUOMShortId());
export {generateUOMShortId};