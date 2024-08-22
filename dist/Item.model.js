import { model, Schema } from 'mongoose';
function generateShortId() {
    const min = 1001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
console.log(generateShortId());
export const itemSchema = new Schema({
    itemCode: { type: String, required: true },
    itemImage: { type: String, required: false },
    itemID: { type: String, default: generateShortId, unique: true },
    itemName: { type: String, unique: true, required: true },
    itemCategory: { type: Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
    itemBrand: { type: Schema.Types.ObjectId, ref: 'ItemBrand' },
    itemType: { type: Schema.Types.ObjectId, ref: 'ItemType' },
    itemSubType: { type: Schema.Types.ObjectId, ref: 'ItemSubType' },
    itemDescription: { type: String, required: true },
    itemCurrentMktPrice: { type: Number },
    itemDatePredictFutureMktPrice: { type: Date },
    itemFutureMktPrice: { type: Number },
    itemDescWhyFuturePrice: { type: String },
    createdAt: { type: Date },
    lastUpdatedAt: { type: Date }
});
export const Item = model('items', itemSchema);
