import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 3-digit short ID
function generateBlockShortId(): string {
    const min = 9001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
};

//Exporting the function
console.log('FOREA-Block ID:', generateBlockShortId());
export {generateBlockShortId};