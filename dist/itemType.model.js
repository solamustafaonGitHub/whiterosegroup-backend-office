import { model, Schema } from 'mongoose';
export const itemTypeSchema = new Schema({
    itemTypeName: {
        type: String,
        unique: [true, 'Item Tyoe name must be unique'],
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
export const ItemType = model('itemtypes', itemTypeSchema);
