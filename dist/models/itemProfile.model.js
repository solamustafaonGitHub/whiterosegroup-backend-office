import mongoose, { Schema } from 'mongoose';
function generateProfiledItemShortId() {
    const min = 1001;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
console.log(generateProfiledItemShortId());
const ProfiledItemSchema = new Schema({
    itemProfileID: { type: String, default: generateProfiledItemShortId },
    itemProfileCode: { type: String, required: true },
    itemProfileName: { type: String, required: true },
    itemProfileCategory: { type: Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
    itemProfileBrand: { type: Schema.Types.ObjectId, ref: 'ItemBrand', required: true },
    itemProfileType: { type: Schema.Types.ObjectId, ref: 'ItemType', required: true },
    itemProfileSubType: { type: Schema.Types.ObjectId, ref: 'ItemSubType', required: true },
    itemProfileDescription: { type: String, required: true },
    itemProfileImage: { type: String },
    itemProfileCurrentMktPrice: {
        type: String,
        virtual: true,
        get() {
            const itemprofcurmktprice = this.itemProfileCurrentMktPrice;
            if (!itemprofcurmktprice)
                return null;
            return `₦<span class="math-inline">\{price\.toFixed\(2\)\.replace\(/\\d\(?\=\(\\d\{3\}\)\+</span>)/g, ',')}`;
        }
    },
    itemProfileDateNewPriceByInflation: { type: Date },
    itemProfileNewPriceByInflation: {
        type: String,
        virtual: true,
        get() {
            const itemprofpricebyinflation = this.itemProfileNewPriceByInflation;
            if (!itemprofpricebyinflation)
                return null;
            return `₦<span class="math-inline">\{price\.toFixed\(2\)\.replace\(/\\d\(?\=\(\\d\{3\}\)\+</span>)/g, ',')}`;
        }
    },
    itemProfileReasonForNewPrice: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
});
const ItemProfile = mongoose.model('Item', ProfiledItemSchema);
export { ItemProfile };
