import { Schema, model } from 'mongoose';
import { AccountSubscriber } from './accountSubscriber.model.js';
import generateActiveUserShortId from '../utils/generateActiveSubscriberShortId.utils.js';
;
const activeSubscriberSchema = new Schema({
    activeSubscriberID: { type: String, default: generateActiveUserShortId, unique: true },
    activeSubscriberPhoneRefNo: { type: Schema.Types.ObjectId, ref: 'AccountSubscriber', unique: true, required: true },
    activeSubscriberProfileImage: { type: String },
    activeSubscriberFirstName: { type: String, required: true },
    activeSubscriberMiddleName: { type: String, required: true },
    activeSubscriberLastName: { type: String, required: true },
    activeSubscriberEmail: { type: String },
    activeSubscriberPhoneNo: { type: String, unique: true },
    activeSubscriberGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
    activeSubscriberDOB: { type: Date },
    activeSubscriberWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'SELF-EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
    activeSubscriberSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
    nonProfiledCompanyName: { type: String, required: true },
    nonProfiledWorkAddress: { type: String, required: true },
    activeSubscriberAssetDeliveryAddress: { type: String, required: true },
    activeSubscriberNairaWalletID: { type: String },
    americanUSDWalletID: { type: String },
    britishPoundsWalletID: { type: String },
    marketPlaceID: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
activeSubscriberSchema.pre('save', function (next) {
    if (!this.activeSubscriberID) {
        this.activeSubscriberID = generateActiveUserShortId();
    }
    next();
});
activeSubscriberSchema.pre('save', async function (next) {
    try {
        if (!this.activeSubscriberEmail) {
            const accountSubscriber = await AccountSubscriber.findById(this.activeSubscriberPhoneRefNo).exec();
            if (accountSubscriber) {
                this.activeSubscriberEmail = accountSubscriber.accountSubscriberEmail;
                this.activeSubscriberPhoneNo = accountSubscriber.accountSubscriberPhoneNo;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
activeSubscriberSchema.pre('save', function (next) {
    if (!this.activeSubscriberNairaWalletID) {
        this.activeSubscriberNairaWalletID = '100' + this.activeSubscriberID;
    }
    next();
});
activeSubscriberSchema.pre('save', function (next) {
    if (!this.americanUSDWalletID) {
        this.americanUSDWalletID = '200' + this.activeSubscriberID;
    }
    next();
});
activeSubscriberSchema.pre('save', function (next) {
    if (!this.britishPoundsWalletID) {
        this.britishPoundsWalletID = '300' + this.activeSubscriberID;
    }
    next();
});
activeSubscriberSchema.pre('save', function (next) {
    if (!this.marketPlaceID) {
        this.marketPlaceID = '900' + this.activeSubscriberID;
    }
    next();
});
const ActiveSubscriber = model('ActiveSubscriber', activeSubscriberSchema);
export { ActiveSubscriber };
