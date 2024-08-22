import mongoose, { Schema } from 'mongoose';
import { Item } from "./Item.model.js";
import { UserProfile } from './userProfile.model.js';
function generateShortId() {
    const min = 1000200010;
    const max = 9999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10, '0');
}
console.log(generateShortId());
const purchaseOrderSchema = new Schema({
    purchaseOrderId: { type: String, default: generateShortId, unique: true },
    pOrderUserProfileID: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    pOrderUserProfilePhoneNo: { type: String },
    pOrderUserProfileEmail: { type: String },
    pOrderUserProfileFName: { type: String },
    pOrderUserProfileLName: { type: String },
    purchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    purchaseOrderIntentDesc: { type: String },
    purchaseOrderIntentPrice: { type: Number },
    purchaseOrderAssetSubscType: { type: Schema.Types.ObjectId, ref: 'SubscriptionType', required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
purchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.isModified('pOrderUserProfileID')) {
            const userProfDetails = await UserProfile.findById(this.pOrderUserProfileID).exec();
            if (userProfDetails) {
                this.pOrderUserProfileEmail = userProfDetails.UserProfileEmail;
                this.pOrderUserProfileFName = userProfDetails.userProfileFirstName;
                this.pOrderUserProfileLName = userProfDetails.userProfileLastName;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
purchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.purchaseOrderIntent) {
            const product = await Item.findById(this.purchaseOrderIntent);
            if (product) {
                this.purchaseOrderIntentPrice = product.itemCurrentMktPrice;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
purchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.purchaseOrderIntent) {
            const item = await Item.findById(this.purchaseOrderIntent);
            if (item) {
                this.purchaseOrderIntentDesc = item.itemDescription;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const PurchaseOrder = mongoose.model('purchaseorders', purchaseOrderSchema);
export { PurchaseOrder };
