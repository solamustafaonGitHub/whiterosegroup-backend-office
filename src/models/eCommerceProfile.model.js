"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECommerceProfile = void 0;
const mongoose_1 = require("mongoose");
// Function to generate a 4-digit short ID starting from 1001
function generateECommerceProfilingShortId() {
    const min = 1;
    const max = 999; // Maximum value for the 3-digit number starting from 1001
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(3, '0'); // Ensure the ID is 3 digits long
}
;
;
const eCommerceProfileSchema = new mongoose_1.Schema({
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
//Pre-Save Hook to ensure eCommerceProfileId is generated before saving
eCommerceProfileSchema.pre('save', function (next) {
    if (!this.eCommerceProfileId) {
        this.eCommerceProfileId = generateECommerceProfilingShortId(); // Ensure eCommerceProfileId is generated if missing
    }
    next();
});
//create the model for the eCommerceProfile
const ECommerceProfile = (0, mongoose_1.model)('ECommerceProfile', eCommerceProfileSchema);
exports.ECommerceProfile = ECommerceProfile;
