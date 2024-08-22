import { model, Schema } from 'mongoose';
export const productBrandSchema = new Schema({
    productBrandName: {
        type: String,
        unique: [true, 'Product name must be unique'],
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
export const ProductBrand = model('productBrand', productBrandSchema);
