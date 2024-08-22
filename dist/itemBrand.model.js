import { model, Schema } from 'mongoose';
export const itemBrandSchema = new Schema({
    itemBrandName: {
        type: String,
        unique: [true, 'Item name must be unique'],
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
export const ItemBrand = model('itembrands', itemBrandSchema);
