import mongoose, {Schema, Document, model, Types} from 'mongoose';
import {ResourceOptions} from 'adminjs';

import {AccountSubscriber} from './accountSubscriber.model.js';

import generateActiveUserShortId from '../utils/generateActiveSubscriberShortId.utils.js';
import {ProfiledPartner} from './profiledPartner.model.js';
import formatCurrency from '../utils/formatCurrency.utils.js';

//Define the interface for the ActiveSubscriber
interface IActiveSubscriber extends Document {
    activeSubscriberID: String;
    activeSubscriberPhoneRefNo: mongoose.Types.ObjectId;
    activeSubscriberProfileImage: string;
    activeSubscriberFirstName: string;
    activeSubscriberMiddleName: string;
    activeSubscriberLastName: string;
    activeSubscriberEmail: string;
    activeSubscriberPhoneNo: string;
    activeSubscriberGender: 'MALE' | 'FEMALE' | 'RATHER NOT SAY';
    activeSubscriberDOB: Date;
    activeSubscriberWorkStatus: 'EMPLOYED' | 'SELF-EMPLOYED' | 'NOT CURRENTLY EMPLOYED';
    activeSubscriberSelectCompany: mongoose.Types.ObjectId;
    nonProfiledCompanyName: string;
    nonProfiledWorkAddress: string;
    activeSubscriberAssetDeliveryAddress: string;
    activeSubscriberNairaWalletID: string;
    americanUSDWalletID: string;
    britishPoundsWalletID: string;
    marketPlaceID: string;
    createdAt: Date;
    lastUpdatedAt: Date;
};

//Define the ActiveSubscriberSchema
const activeSubscriberSchema = new Schema<IActiveSubscriber>({
    activeSubscriberID: {type:String, default:generateActiveUserShortId, unique:true},
    activeSubscriberPhoneRefNo: {type:Schema.Types.ObjectId, ref:'AccountSubscriber', unique:true, required:true},
    activeSubscriberProfileImage: {type:String},
    activeSubscriberFirstName: {type:String, required:true},
    activeSubscriberMiddleName: {type:String, required:true},
    activeSubscriberLastName: {type:String, required:true},
    activeSubscriberEmail: {type:String},
    activeSubscriberPhoneNo: {type:String, unique:true},
    activeSubscriberGender: {type:String, required:false, enum:['MALE','FEMALE','RATHER NOT SAY']},
    activeSubscriberDOB: {type:Date},
    activeSubscriberWorkStatus: {type:String, required:true, enum:['EMPLOYED', 'SELF-EMPLOYED', 'NOT CURRENTLY EMPLOYED']},
    activeSubscriberSelectCompany: {type:Schema.Types.ObjectId, ref:'ProfiledPartner'},
    nonProfiledCompanyName: {type:String, required:true},
    nonProfiledWorkAddress: {type:String, required:true},
    activeSubscriberAssetDeliveryAddress: {type:String, required:true},
    activeSubscriberNairaWalletID: {type:String},
    americanUSDWalletID: {type:String},
    britishPoundsWalletID: {type:String},
    marketPlaceID: {type:String},
    createdAt: {type:Date, default:Date.now, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});

//pre-save hook to ensure activeSubscriberID is generated and valid
activeSubscriberSchema.pre<IActiveSubscriber>('save', function (next) {
    if (!this.activeSubscriberID) {
        this.activeSubscriberID = generateActiveUserShortId();
    }
    next();
});

//Pre-save hook to set the activeSubscriberEmail based on the activeSubscriberPhoneNo
activeSubscriberSchema.pre<IActiveSubscriber>('save', async function (next) {
    try {
        if (!this.activeSubscriberEmail) {
            const accountSubscriber = await AccountSubscriber.findById(this.activeSubscriberPhoneRefNo).exec();
            if (accountSubscriber) {
                this.activeSubscriberEmail = accountSubscriber.accountSubscriberEmail;
                this.activeSubscriberPhoneNo = accountSubscriber.accountSubscriberPhoneNo;
            }
        }   
        next();
    } catch (error) {
        next(error);
    }
});


//Pre-save hook to set value for nairaWalletID by concatenating 100 and activeSubscriberID
activeSubscriberSchema.pre<IActiveSubscriber>('save', function (next) {
    if (!this.activeSubscriberNairaWalletID) {
        this.activeSubscriberNairaWalletID = '100' + this.activeSubscriberID;
    }
    next();
});
//Pre-save hook to set value for americaUSDWalletID by concatenating 200 and activeSubscriberID
activeSubscriberSchema.pre<IActiveSubscriber>('save', function (next) {
    if (!this.americanUSDWalletID) {
        this.americanUSDWalletID = '200' + this.activeSubscriberID;
    }
    next();
});
//Pre-save hook to set value for britishPoundsWalletID by concatenating 300 and activeSubscriberID
activeSubscriberSchema.pre<IActiveSubscriber>('save', function (next) {
    if (!this.britishPoundsWalletID) {
        this.britishPoundsWalletID = '300' + this.activeSubscriberID;
    }
    next();
});
//Pre-save hook to set value for marketPlaceID by concatenating 900 and activeSubscriberID
activeSubscriberSchema.pre<IActiveSubscriber>('save', function(next){
    if(!this.marketPlaceID){
        this.marketPlaceID = '900' + this.activeSubscriberID;
    }
    next();
});


//Create & Export the Model. The collection name in the database is derived from the model name. 
//By default, Mongoose will pluralize the model name to determine the collection name.
const ActiveSubscriber = model<IActiveSubscriber>('ActiveSubscriber', activeSubscriberSchema);
export {ActiveSubscriber, IActiveSubscriber};