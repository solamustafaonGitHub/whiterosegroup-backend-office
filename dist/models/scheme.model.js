import { Schema, model } from 'mongoose';
import { ItemInformation } from './itemInformation.model.js';
function generateSchemeShortId() {
    const min = 934001;
    const max = 999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
}
;
;
const schemeSchema = new Schema({
    schemeID: { type: String, default: generateSchemeShortId, unique: true },
    itemIdToBeSchemed: { type: Schema.Types.ObjectId, ref: 'ItemInformation', unique: true },
    itemDescriptionToBeSchemed: { type: String },
    schemeName: { type: String, required: true },
    schemeShortDescription: { type: String, required: true },
    schemeUnitPrice: { type: Number, required: true },
    schemePaymentPlan: { type: String, required: true, enum: ['FULL PAYMENT UPFRONT', 'SECURITY DEPOSIT FIRST, PAY BALANCE ON DELIVERY', 'PAY ON DELIEVERY'] },
    schemeSecurityDepositIfAny: { type: Number, required: true },
    totalUnitsAvailableForScheme: { type: Number, required: true },
    schemeStartDate: { type: Date, required: true },
    schemeEndDate: { type: Date, required: true },
    schemeStatus: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE'] },
    postDateBegins: { type: Date, required: true },
    expectedNoOfDaysToDeliver: { type: Number, required: true },
    expectedDeliveryDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
schemeSchema.pre('save', function (next) {
    if (!this.schemeID) {
        this.schemeID = generateSchemeShortId();
    }
    next();
});
schemeSchema.pre('save', async function (next) {
    try {
        if (this.itemIdToBeSchemed) {
            const iteminformation = await ItemInformation.findById(this.itemIdToBeSchemed).exec();
            if (iteminformation) {
                this.itemDescriptionToBeSchemed = iteminformation.itemDescription;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
schemeSchema.pre('save', function (next) {
    if (!this.expectedDeliveryDate) {
        this.expectedDeliveryDate = new Date(this.postDateBegins.getTime() + (this.expectedNoOfDaysToDeliver * 24 * 60 * 60 * 1000));
    }
    next();
});
const Scheme = model('Scheme', schemeSchema);
export { Scheme };
