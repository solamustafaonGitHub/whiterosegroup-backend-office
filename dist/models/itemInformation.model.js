import mongoose, { Schema } from 'mongoose';
function generateItemInfoShortId() {
    const min = 1001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
console.log(generateItemInfoShortId());
const ItemInformationSchema = new Schema({
    itemInformationID: { type: String, default: generateItemInfoShortId, unique: true },
    itemInformationCode: { type: String, required: true, unique: true },
    itemInformationName: { type: String, required: true },
    itemInformationCategory: { type: Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
    itemInformationBrand: { type: Schema.Types.ObjectId, ref: 'ItemBrand', required: true },
    itemInformationType: { type: Schema.Types.ObjectId, ref: 'ItemType', required: true },
    itemInformationSubType: { type: Schema.Types.ObjectId, ref: 'ItemSubType', required: true },
    itemInformationDescription: { type: String, required: true },
    itemInformationImage: { type: String },
    itemInformationMktStartPrice: { type: Number },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    itemInformationPriceUpdateDetails: [{
            itemInformationTranDateForNewPriceUpdate: { type: Date },
            itemInformationNewPriceUpdateRemarks: { type: String },
            itemInformationCurrentMktPrice: { type: Number }
        }]
});
const ItemInformation = mongoose.model('ItemInformation', ItemInformationSchema);
export { ItemInformation };
