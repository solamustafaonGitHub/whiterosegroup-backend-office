import mongoose, { Schema, model, Document, CallbackError } from 'mongoose';

// Define the interface for updateItemPrice
interface IUpdateScheme extends Document {
  itemToBeUpdatedRefID: mongoose.Types.ObjectId;
  updateItemPriceID: string;
  itemToBeUpdatedID: string;
  itemToBeUppdatedDisplayItemCode?: string;
  itemToBeupdatedDisplayName?: string;
  itemToBeUpdatedDisplayItemDesc?: string;
  itemToBeUpdatedStartPrice?: number;
  updatedItemNewPriceByInflation: number;
  updatedItemReasonForNewPrice?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

// Define the UpdateItemPrice Schema
const UpdateSchemeSchema = new Schema<IUpdateScheme>({
  itemToBeUpdatedRefID: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
  updateItemPriceID: { type: String, unique: true },
  itemToBeUpdatedID: { type: String },
  itemToBeUppdatedDisplayItemCode: { type: String },
  itemToBeupdatedDisplayName: { type: String },
  itemToBeUpdatedDisplayItemDesc: { type: String },
  itemToBeUpdatedStartPrice: { type: Number },
  updatedItemNewPriceByInflation: { type: Number, required: true },
  updatedItemReasonForNewPrice: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  lastUpdatedAt: { type: Date, default: new Date() },
});

//export the model
const UpdateScheme = model<IUpdateScheme>('UpdateScheme', UpdateSchemeSchema);
export {UpdateScheme, IUpdateScheme};