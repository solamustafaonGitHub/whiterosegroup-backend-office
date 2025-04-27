import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 6-digit short ID
function generatePropertyListingShortId(): string {
    const min = 600250;
    const max = 799999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
};

//Exporting the function
console.log('Combined Property Listing ID:', generatePropertyListingShortId());
export {generatePropertyListingShortId};