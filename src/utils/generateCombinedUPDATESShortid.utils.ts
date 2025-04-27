//Importing mongoose and other required modules
import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

//Function to generate a 8-digit short ID starting from 70000300 to 99999999
function generateUpdateItemPriceShortId(): string {
  const min:number = 70000300;
  const max:number = 99999999;
  const randomId:number = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomId.toString().padStart(8,'0');
};

//Exporting the function
console.log('Combined UPDATES ShortID:', generateUpdateItemPriceShortId());
export {generateUpdateItemPriceShortId};