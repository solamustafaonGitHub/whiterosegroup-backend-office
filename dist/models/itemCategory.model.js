import mongoose, { Schema } from 'mongoose';
const itemCategorySchema = new Schema({
    itemCategoryName: { type: String, unique: [true, 'Item Category name must be unique'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
const ItemCategory = mongoose.model('ItemCategory', itemCategorySchema);
export { ItemCategory };
