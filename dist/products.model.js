import { model, Schema } from 'mongoose';
;
export const productSchema = new Schema({
    productCategory: {
        type: String,
        required: true,
        default: 'Home Electronics and Appliances',
        enum: ['Home Electronics and Appliances', 'Phones and Tablets', 'Computer and Accessories', 'Heavy Duty Equipment', 'Power Solution', 'Jewelries (Gold, Pearls, Diamonds)', 'Cars and SUV']
    },
    productType: {
        type: String,
        required: true,
        default: 'TV/Audio',
        enum: ['TV/Audio', 'Refridgerator', 'Air Conditioner', 'Washing Machine/Dryer', 'Microwave Oven', 'Air Fryer', 'Freezer', 'Cookers']
    },
    productName: {
        type: String,
        required: true,
        unique: [true, 'Product name must be unique']
    },
    productImage: {
        type: String,
        required: false
    },
    productBrand: {
        type: String,
        required: true,
        default: 'LG',
        enum: ['LG', 'Hisense', 'Samsung', 'Panasonic', 'Tecno', 'Firman', 'Oraimo']
    },
    productDescription: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export const Products = model('products', productSchema);
