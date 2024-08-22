import mongoose, { Schema } from 'mongoose';
const itemSubTypeSchema = new Schema({
    itemSubTypeName: { type: String, unique: [true, 'Item SubType name must be unique'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const ItemSubType = mongoose.model('ItemSubType', itemSubTypeSchema);
export { ItemSubType };
