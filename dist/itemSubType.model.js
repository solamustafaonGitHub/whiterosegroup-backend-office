import { model, Schema } from 'mongoose';
export const itemSubTypeSchema = new Schema({
    itemSubTypeName: {
        type: String,
        unique: [true, 'Item SubType name must be unique'],
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
export const ItemSubType = model('itemsubtypes', itemSubTypeSchema);
