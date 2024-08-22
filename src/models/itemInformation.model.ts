import mongoose, {model,Schema} from 'mongoose';
import {CallbackError} from 'mongoose';

import {ItemCategory, IItemCategory} from "../models/itemCategory.model.js"
import {ItemBrand, IItemBrand} from '../models/itemBrand.model.js'  
import {ItemType, IItemType} from '../models/itemType.model.js'
import {ItemSubType, IItemSubType} from '../models/itemSubType.model.js'
import {PurchaseOrder} from '../models/purchaseOrder.model.js'

// Function to generate a 4-digit short ID starting from 1001
function generateItemInfoShortId(): string {
    const min: number = 1001;
    const max: number = 9999; // Maximum value for the 4-digit number starting from 100020001
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4,'0'); // Ensure the ID is 4 digits long
}
console.log(generateItemInfoShortId())

//Define the interface for ItemInformation Price Update History
interface IItemIformationPriceUpdateHistory {
    itemInformationTranDateForNewPriceUpdate?: Date;
    itemInformationCurrentMktPrice?: number;
    itemInformationNewPriceUpdateRemarks?: string;
}

// Define the interface for Item Information
interface IItemInformation extends Document {
    itemInformationID: string;
    itemInformationCode: string;
    itemInformationName: string;
    itemInformationCategory: mongoose.Types.ObjectId;
    itemInformationBrand:mongoose.Types.ObjectId;
    itemInformationType:mongoose.Types.ObjectId;
    itemInformationSubType:mongoose.Types.ObjectId;
    itemInformationDescription:string;
    itemInformationImage?: string;
    itemInformationMktStartPrice?: number;
    createdAt: Date;
    lastUpdatedAt: Date;
    //New ItemInformation Price Update Alert
    itemInformationPriceUpdateDetails:IItemIformationPriceUpdateHistory[];
}

// Define the Item Information Schema
const ItemInformationSchema = new Schema<IItemInformation>({
    itemInformationID: {type:String, default:generateItemInfoShortId, unique:true},
    itemInformationCode: {type:String, required:true, unique:true},
    itemInformationName: {type:String, required:true},
    itemInformationCategory: {type:Schema.Types.ObjectId, ref:'ItemCategory', required:true},
    itemInformationBrand:{type:Schema.Types.ObjectId, ref:'ItemBrand', required:true},
    itemInformationType:{type:Schema.Types.ObjectId, ref:'ItemType', required:true},
    itemInformationSubType:{type:Schema.Types.ObjectId, ref:'ItemSubType', required:true},
    itemInformationDescription:{type:String, required:true},
    itemInformationImage: {type:String},
    itemInformationMktStartPrice: {type:Number},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now},
    //New ItemInformation Price Update Alert
    itemInformationPriceUpdateDetails:[{
        itemInformationTranDateForNewPriceUpdate: {type:Date},
        itemInformationNewPriceUpdateRemarks: {type:String},
        itemInformationCurrentMktPrice: {type:Number}
    }]
});
  
// Create & Export the Model. The collection name in the database is derived from the model name. 
// By default, Mongoose will pluralize the model name to determine the collection name.
const ItemInformation = mongoose.model<IItemInformation>('ItemInformation', ItemInformationSchema);
export {ItemInformation, IItemInformation};