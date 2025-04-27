import { Schema, model } from 'mongoose';
const UpdateSchemeSchema = new Schema({
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
const UpdateScheme = model('UpdateScheme', UpdateSchemeSchema);
export { UpdateScheme };
