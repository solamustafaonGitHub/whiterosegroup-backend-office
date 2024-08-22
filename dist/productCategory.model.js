import { model, Schema } from 'mongoose';
export const productCategorySchema = new Schema({
    productCategoryName: {
        type: String,
        unique: [true, 'Product Category name must be unique'],
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
export const ProductCategory = model('productCategory', productCategorySchema);
