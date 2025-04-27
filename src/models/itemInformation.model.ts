import mongoose, { model, Schema, Document } from 'mongoose';
import { ItemCategory, IItemCategory } from "../models/itemCategory.model.js";
import { ItemBrand, IItemBrand } from '../models/itemBrand.model.js';
import { ItemType, IItemType } from '../models/itemType.model.js';
import { ItemSubType, IItemSubType } from '../models/itemSubType.model.js';
import { PurchaseOrder } from '../models/purchaseOrder.model.js';
import { ECommerceProfile } from './eCommerceProfile.model.js';

// Function to generate a 4-digit short ID starting from 1001
function generateItemInfoShortId(): string {
    const min: number = 1001;
    const max: number = 9999; // Maximum value for the 4-digit number starting from 1001
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0'); // Ensure the ID is 4 digits long
}

// Interface for Item Information Price Update History
interface IItemIformationPriceUpdateHistory {
    itemInformationTranDateForNewPriceUpdate?: Date;
    itemInformationCurrentMktPrice?: number;
    itemInformationNewPriceUpdateRemarks?: string;
}

// Interface for Item Information
interface IItemInformation extends Document {
    itemID: string;
    itemName: string;
    itemDescription: string;
    itemCode: string;
    itemInformationID: string;
    itemInformationCode: string;
    itemInformationName: string;
    itemInformationCategory: mongoose.Types.ObjectId;
    itemInformationBrand: mongoose.Types.ObjectId;
    itemInformationType: mongoose.Types.ObjectId;
    itemInformationSubType: mongoose.Types.ObjectId;
    itemInformationDescription: string;
    itemInformationImage?: string;
    itemInformationECommerceProfile: mongoose.Types.ObjectId;
    itemInformationECommerceProfileName: string;
    itemInformationECommerceProfileDisplay: string;
    itemInformationMktStartPrice?: number;
    itemInformationClassification:  {type: String, enum:['STANDARD', 'PREMIUM (Higher Quality)', 'LUXURY (Exclusive Luxury)'], required:true},
    createdAt: Date;
    lastUpdatedAt: Date;
    itemInformationPriceUpdateDetails: IItemIformationPriceUpdateHistory[];

    getClassificationWithTag: () => { classification: string;tag:string };
}

// Define the Item Information Schema
const ItemInformationSchema = new Schema<IItemInformation>({
    itemInformationID: {type:String, default:generateItemInfoShortId, unique:true},
    itemInformationCode: {type:String, required:true, unique:true},
    itemInformationName: {type:String, required:true},
    itemInformationCategory: {type:Schema.Types.ObjectId, ref:'ItemCategory', required:true},
    itemInformationBrand: {type:Schema.Types.ObjectId, ref:'ItemBrand', required:true},
    itemInformationType: {type:Schema.Types.ObjectId, ref:'ItemType', required:true},
    itemInformationSubType: {type:Schema.Types.ObjectId, ref:'ItemSubType', required:true},
    itemInformationDescription: {type:String, required: true},
    itemInformationImage: {type: String},
    itemInformationECommerceProfile: {type:Schema.Types.ObjectId, ref:'ECommerceProfile', required:true},
    itemInformationECommerceProfileName: {type:String},
    itemInformationECommerceProfileDisplay:{type:String},
    itemInformationMktStartPrice: {type:Number, required:true},
    itemInformationClassification: { 
        type: String, 
        enum: ['STANDARD', 'PREMIUM (Higher Quality)', 'LUXURY (Exclusive Luxury)'], 
        required: true 
    },
    createdAt: {type:Date, default: new Date()},
    lastUpdatedAt: {type:Date, default: new Date()},
    itemInformationPriceUpdateDetails: [{
        itemInformationTranDateForNewPriceUpdate: {type:Date, default:new Date()},
        itemInformationNewPriceUpdateRemarks: {type:String},
        itemInformationCurrentMktPrice: {type:Number}
    }]
});


//1. Pre-Save Hook to ensure itemInformationID is generated before saving
ItemInformationSchema.pre<IItemInformation>('save', function (next) {
    if (!this.itemInformationID) {
        this.itemInformationID = generateItemInfoShortId(); // Ensure itemInformationID is generated if missing
    }
    next();
});

//2. Pre-save hook to set the itemProfiling of eCommerceProfile
ItemInformationSchema.pre<IItemInformation>('save', async function (next) {
   try{
    if(this.itemInformationECommerceProfile) {
        const eCommerceProfile = await ECommerceProfile.findById(this.itemInformationECommerceProfile).exec();
        if(eCommerceProfile){
            this.itemInformationECommerceProfileName = eCommerceProfile.eCommerceProfileName as unknown as string;
            this.itemInformationECommerceProfileDisplay = eCommerceProfile.itemProfiling.toString();
        }
    }
   }catch(err){
         console.error(err);
    }
    next();
});

// Create & Export the Model. The collection name in the database is derived from the model name. 
// By default, Mongoose will pluralize the model name to determine the collection name.
const ItemInformation = mongoose.model<IItemInformation>('ItemInformation', ItemInformationSchema);
export {ItemInformation, IItemInformation, IItemIformationPriceUpdateHistory};
