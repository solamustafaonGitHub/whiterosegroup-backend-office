import mongoose, {Schema, Document, Model} from 'mongoose';
import {generateUOMShortId} from '../utils/generateUOMShortId.utils.js';

// Define the interface for PaymentClass
interface IUnitOfMeaasureOfSale extends Document {
    //unitofMeasureID: string;
    unitMeaseureName: string;
    unitMeasureShortDesc: string;
    createdAt: Date;
    lastUpdatedAt: Date;
};

const UnitOfMeasureSchema = new Schema<IUnitOfMeaasureOfSale>({
    //unitofMeasureID: {type:String, default:generateUOMShortId},
    unitMeaseureName: {type:String, required:true, require:true},
    unitMeasureShortDesc: String,
    createdAt: {type:Date, default:Date.now, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});


//Create & Export the Model. The collection name in the database is derived from the model name. By default, 
//Mongoose will pluralize the model name to determine the collection name.
const UOM = mongoose.model<IUnitOfMeaasureOfSale>('UOM', UnitOfMeasureSchema);
export {UOM, IUnitOfMeaasureOfSale};