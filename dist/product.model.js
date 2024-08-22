import { model, Schema } from 'mongoose';
function generateShortId() {
    const min = 1001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
console.log(generateShortId());
export const productSchema = new Schema({
    productCode: { type: String, required: true },
    productImage: { type: String, required: false },
    productID: { type: String, default: generateShortId, unique: true },
    productName: { type: String, unique: true, required: true },
    productCategory: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
    productType: { type: Schema.Types.ObjectId, ref: 'ProductType' },
    productSubType: { type: Schema.Types.ObjectId, ref: 'ProductSubType' },
    productBrand: { type: Schema.Types.ObjectId, ref: 'ProductBrand' },
    productDescription: { type: String, required: true },
    productCurrentMktPrice: { type: Number },
    productDatePredictFutureMktPrice: { type: Date },
    productFutureMktPrice: { type: Number },
    productDescWhyFuturePrice: { type: String },
    createdAt: { type: Date },
    lastUpdatedAt: { type: Date }
});
export const Product = model('products', productSchema);
