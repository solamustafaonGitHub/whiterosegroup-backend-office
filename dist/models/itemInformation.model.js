import mongoose, { Schema } from 'mongoose';
import { ECommerceProfile } from './eCommerceProfile.model.js';
function generateItemInfoShortId() {
    const min = 1001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
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
    itemInformationECommerceProfile: { type: Schema.Types.ObjectId, ref: 'ECommerceProfile', required: true },
    itemInformationECommerceProfileName: { type: String },
    itemInformationECommerceProfileDisplay: { type: String },
    itemInformationMktStartPrice: { type: Number, required: true },
    itemInformationClassification: {
        type: String,
        enum: ['STANDARD', 'PREMIUM (Higher Quality)', 'LUXURY (Exclusive Luxury)'],
        required: true
    },
    createdAt: { type: Date, default: new Date() },
    lastUpdatedAt: { type: Date, default: new Date() },
    itemInformationPriceUpdateDetails: [{
            itemInformationTranDateForNewPriceUpdate: { type: Date, default: new Date() },
            itemInformationNewPriceUpdateRemarks: { type: String },
            itemInformationCurrentMktPrice: { type: Number }
        }]
});
ItemInformationSchema.pre('save', function (next) {
    if (!this.itemInformationID) {
        this.itemInformationID = generateItemInfoShortId();
    }
    next();
});
ItemInformationSchema.pre('save', async function (next) {
    try {
        if (this.itemInformationECommerceProfile) {
            const eCommerceProfile = await ECommerceProfile.findById(this.itemInformationECommerceProfile).exec();
            if (eCommerceProfile) {
                this.itemInformationECommerceProfileName = eCommerceProfile.eCommerceProfileName;
                this.itemInformationECommerceProfileDisplay = eCommerceProfile.itemProfiling.toString();
            }
        }
    }
    catch (err) {
        console.error(err);
    }
    next();
});
const ItemInformation = mongoose.model('ItemInformation', ItemInformationSchema);
export { ItemInformation };
