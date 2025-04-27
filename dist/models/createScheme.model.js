import { Schema, model } from 'mongoose';
;
const createSchemeSchema = new Schema({
    schemeID: { type: String, unique: true },
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
const CreateScheme = model('CreateScheme', createSchemeSchema);
export { CreateScheme };
