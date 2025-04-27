import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 4-digit short ID
function generateCombinedFOREAShortId(): string {
    const min = 700500;
    const max = 999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6,'0');
};

//Exporting the function
console.log('Combined FOREA-Project ID:', generateCombinedFOREAShortId());
export {generateCombinedFOREAShortId};