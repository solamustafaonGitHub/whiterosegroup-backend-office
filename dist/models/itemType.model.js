import mongoose, { Schema } from 'mongoose';
const itemTypeSchema = new Schema({
    itemTypeName: { type: String, unique: [true, 'Item Tyoe name must be unique'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const ItemType = mongoose.model('ItemType', itemTypeSchema);
export { ItemType };
