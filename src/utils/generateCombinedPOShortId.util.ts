import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 11-digit short ID starting from 1000200010
function generateCombinedPOShortId(): string {
    const min: number = 10002000100;
    const max: number = 99999100000; // Maximum value for the 9-digit number starting from 1000200010
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(11,'0'); // Ensure the ID is 11 digits long
};
console.log('General Combined PO Short ID:', generateCombinedPOShortId())
export default generateCombinedPOShortId;