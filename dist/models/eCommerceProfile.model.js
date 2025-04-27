import { model, Schema } from 'mongoose';
function generateECommerceProfilingShortId() {
    const min = 1;
    const max = 999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(3, '0');
}
;
;
const eCommerceProfileSchema = new Schema({
    eCommerceProfileId: { type: String, default: generateECommerceProfilingShortId },
    eCommerceProfileName: { type: String, required: true },
    itemProfiling: {
        itemAvailability: { type: String, enum: ['IN-STOCK/AVAILABLE', 'OUT-OF-STOCK', 'BACKORDER', 'DISCONTINUED', 'OTHERS'], required: true },
        itemPricingValue: { type: String, enum: ['BUDGET/VALUE', 'MID-RANGE', 'HIGH-END', 'OTHERS'], required: true },
        itemProductLifeCycle: { type: String, enum: ['BEST SELLERS', 'CLEARANCE/SALE', 'SEASONAL', 'OTHERS'], required: true },
        itemCustomization: { type: String, enum: ['STANDARD', 'PERSONALIZED', 'MADE-TO-ORDER', 'OTHERS'], required: true },
        itemSustainability: { type: String, enum: ['ECO-FRIENDLY/SUSTAINABLE', 'ORGANIC', 'FAIR-TRADE', 'OTHERS'], required: true },
        itemAttributes: { type: String, enum: ['COLOR', 'SIZE', 'STYLE', 'MATERIAL', 'OTHERS'], required: true },
        itemOtherAttrbutes: { type: String, enum: ['STANDARD', 'EXCLUSIVE', 'LIMITED EDITION', 'REFURBISHED', 'OPEN-BOX', 'OTHERS'], required: true },
    },
    createdAt: { type: Date, default: Date },
    lastUpdatedAt: { type: Date, default: Date },
});
eCommerceProfileSchema.pre('save', function (next) {
    if (!this.eCommerceProfileId) {
        this.eCommerceProfileId = generateECommerceProfilingShortId();
    }
    next();
});
const ECommerceProfile = model('ECommerceProfile', eCommerceProfileSchema);
export { ECommerceProfile };
