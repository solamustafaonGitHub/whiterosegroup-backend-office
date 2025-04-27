import mongoose, { Schema } from 'mongoose';
import { AccountSubscriber } from './accountSubscriber.model.js';
import generateActiveUserShortId from '../utils/generateActiveSubscriberShortId.utils.js';
;
const activeUserSchema = new Schema({
    activeUserID: { type: String, default: generateActiveUserShortId, unique: true },
    activeUserPhoneRefNo: { type: Schema.Types.ObjectId, ref: 'AccountSubscriber', unique: true, required: true },
    activeUserFirstName: { type: String, required: true },
    activeUserMiddleName: { type: String, required: true },
    activeUserLastName: { type: String, required: true },
    activeUserEmail: { type: String },
    activeUserPhoneNo: { type: String, unique: true },
    activeUserGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
    activeUserDOB: { type: Date },
    activeUserWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'SELF-EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
    activeUserSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
    nonProfiledCompanyName: { type: String, required: true },
    nonProfiledWorkAddress: { type: String, required: true },
    activeUserAssetDeliveryAddress: { type: String, required: true },
    nairaWalletID: { type: String },
    americanUSDWalletID: { type: String },
    britishPoundsWalletID: { type: String },
    marketPlaceID: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
activeUserSchema.pre('save', function (next) {
    if (!this.activeUserID) {
        this.activeUserID = generateActiveUserShortId();
    }
    next();
});
activeUserSchema.pre('save', async function (next) {
    try {
        if (this.activeUserPhoneRefNo) {
            const accountholder = await AccountSubscriber.findById(this.activeUserPhoneRefNo).exec();
            if (accountholder) {
                this.activeUserEmail = accountholder.accountSubscriberEmail;
                this.activeUserPhoneNo = accountholder.accountSubscriberPhoneNo;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
activeUserSchema.pre('save', function (next) {
    if (!this.nairaWalletID) {
        this.nairaWalletID = '100' + this.activeUserID;
    }
    next();
});
activeUserSchema.pre('save', function (next) {
    if (!this.americanUSDWalletID) {
        this.americanUSDWalletID = '200' + this.activeUserID;
    }
    next();
});
activeUserSchema.pre('save', function (next) {
    if (!this.britishPoundsWalletID) {
        this.britishPoundsWalletID = '300' + this.activeUserID;
    }
    next();
});
activeUserSchema.pre('save', function (next) {
    if (!this.marketPlaceID) {
        this.marketPlaceID = '900' + this.activeUserID;
    }
});
const ActiveUser = mongoose.model('ActiveUser', activeUserSchema);
export { ActiveUser };
