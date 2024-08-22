import mongoose, { Schema } from 'mongoose';
const itemBrandSchema = new Schema({
    itemBrandName: { type: String, unique: [true, 'Item Brand name must be unique'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const ItemBrand = mongoose.model('ItemBrand', itemBrandSchema);
export { ItemBrand };
