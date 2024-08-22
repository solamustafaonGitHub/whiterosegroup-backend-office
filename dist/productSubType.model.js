import { model, Schema } from 'mongoose';
export const productSubTypeSchema = new Schema({
    productSubTypeName: {
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
}, {
    timestamps: true
});
export const ProductSubType = model('productSubType', productSubTypeSchema);
