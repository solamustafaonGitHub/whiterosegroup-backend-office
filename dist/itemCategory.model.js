import { model, Schema } from 'mongoose';
export const itemCategorySchema = new Schema({
    itemCategoryName: {
        type: String,
        unique: [true, 'Item Category name must be unique'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
});
export const ItemCategory = model('itemcategories', itemCategorySchema);
