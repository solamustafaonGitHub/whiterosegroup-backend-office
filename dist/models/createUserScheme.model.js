import mongoose, { Schema, model } from 'mongoose';
import { generateUserSchemeShortId } from '../utils/generateUserSchemeShortId.utils.js';
import { ActiveUser } from '../models/activeUser.model.js';
import { SchemeInformation } from '../models/schemeInformationProfile.model.js';
;
const userSchemeSchema = new Schema({
    userSchemeTransactionID: { type: String, default: generateUserSchemeShortId, unique: true },
    userRefIdRequiringScheme: { type: Schema.Types.ObjectId, ref: 'ActiveUser', required: true },
    userIdRequiringScheme: { type: String },
    userFullNameRequiringScheme: { type: String },
    userEmailRequiringScheme: { type: String },
    userPhoneNoRequiringScheme: { type: String },
    userDeliveryAddressRequiringScheme: { type: String },
    schemeIDUserSchemed: { type: Schema.Types.ObjectId, ref: 'SchemeInformation', required: true },
    schemeItemIDUserSchemed: { type: String },
    schemeItemNameUserSchemed: { type: String },
    schemeItemShortDescUserSchemed: { type: String },
    schemeNameUserSchemed: { type: String },
    schemeShortDescUserSchemed: { type: String },
    schemePaymentStructureUserSchemed: { type: String },
    userSchemeMinimumSecurityDeposit: { type: Number },
    schemePaymentDueDate: { type: Date },
    schemeItemOriginalPriceUserSchemed: { type: Number },
    schemeUnitPriceUserSchemed: { type: Number },
    schemeDiscountWavedUserSchemed: { type: Number },
    schemeNoOfUnitsUserSchemed: { type: Number, required: true },
    schemeTotalAmountUserSchemed: { type: Number },
    schemeTotalSecurityDeposit: { type: Number },
    schemeBalancePaymentBeforeDueDate: { type: Number },
    schemeUserSchemedStartDate: { type: Date },
    schemeUserSchemedEndDate: { type: Date },
    shemeUserSchemedPostDateBegins: { type: Date },
    expectedNoOfDaysToDeliver: { type: Number },
    expectedDeliveryDate: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
userSchemeSchema.pre('save', function (next) {
    if (this.isNew) {
        this.userSchemeTransactionID = generateUserSchemeShortId();
    }
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemeIDUserSchemed = new mongoose.Types.ObjectId(this.schemeIDUserSchemed);
    next();
});
userSchemeSchema.pre('save', async function (next) {
    try {
        const activeUserRequiringScheme = await ActiveUser.findById(this.userRefIdRequiringScheme).exec();
        if (activeUserRequiringScheme) {
            this.userIdRequiringScheme = activeUserRequiringScheme.activeUserID;
            this.userFullNameRequiringScheme = activeUserRequiringScheme.activeUserFirstName + ' ' + activeUserRequiringScheme.activeUserLastName;
            this.userEmailRequiringScheme = activeUserRequiringScheme.activeUserEmail;
            this.userPhoneNoRequiringScheme = activeUserRequiringScheme.activeUserPhoneNo;
            this.userDeliveryAddressRequiringScheme = activeUserRequiringScheme.activeUserAssetDeliveryAddress;
        }
    }
    catch (err) {
        next(err);
    }
    ;
    try {
        const schemeInformation = await SchemeInformation.findById(this.schemeIDUserSchemed).exec();
        if (schemeInformation) {
            this.schemeItemIDUserSchemed = schemeInformation.itemIDToBeSchemed;
            this.schemeItemNameUserSchemed = schemeInformation.itemNameToBeSchemed;
            this.schemeItemShortDescUserSchemed = schemeInformation.itemDescriptionToBeSchemed;
            this.schemeNameUserSchemed = schemeInformation.schemeName;
            this.schemeShortDescUserSchemed = schemeInformation.schemeShortDescription;
            this.schemeItemOriginalPriceUserSchemed = schemeInformation.itemToBeSchemedOriginalPrice;
            this.schemePaymentStructureUserSchemed = schemeInformation.schemePaymentStructure;
            this.schemeUnitPriceUserSchemed = schemeInformation.schemeUnitPrice;
            this.userSchemeMinimumSecurityDeposit = schemeInformation.schemeMinimumSecurityDeposit;
            this.schemeUserSchemedStartDate = schemeInformation.schemeStartDate;
            this.schemeUserSchemedEndDate = schemeInformation.schemeEndDate;
            this.shemeUserSchemedPostDateBegins = schemeInformation.postDateBegins;
            this.expectedNoOfDaysToDeliver = schemeInformation.expectedNoOfDaysToDeliver;
            this.expectedDeliveryDate = schemeInformation.expectedDeliveryDate;
        }
    }
    catch (err) {
        next(err);
    }
    ;
});
userSchemeSchema.post('save', async function (doc, next) {
    try {
        const schemeInformation = await SchemeInformation.findById(doc.schemeIDUserSchemed).exec();
        if (schemeInformation) {
            schemeInformation.schemePoolDetailsUpdate.push({
                schemeCount: schemeInformation.schemePoolDetailsUpdate.length + 1,
                userSchemeTransID: doc.userSchemeTransactionID,
                userIDWhoSuccessfullySchemed: doc.userIdRequiringScheme,
                userNameWhoSuccessfullySchemed: doc.userFullNameRequiringScheme,
                userPhoneNoWhoSuccessfullySchemed: doc.userPhoneNoRequiringScheme,
                userActionTimestamp: doc.createdAt,
                userDurationBeforeActionWasTaken: 'PENDING',
                userSchemedHowManyUnits: doc.schemeNoOfUnitsUserSchemed,
            });
            await schemeInformation.save();
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
userSchemeSchema.pre('save', function (next) {
    if (this.schemeUserSchemedStartDate > this.schemeUserSchemedEndDate) {
        return next(new Error('The schemeUserSchemedStartDate cannot be greater than the schemeUserSchemedEndDate'));
    }
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemeTotalAmountUserSchemed = this.schemeUnitPriceUserSchemed * this.schemeNoOfUnitsUserSchemed;
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemeDiscountWavedUserSchemed = (this.schemeNoOfUnitsUserSchemed * this.schemeItemOriginalPriceUserSchemed) - (this.schemeNoOfUnitsUserSchemed * this.schemeUnitPriceUserSchemed);
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemePaymentDueDate = new Date(this.schemeUserSchemedEndDate.getTime() - (1 * 24 * 60 * 60 * 1000));
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemeTotalSecurityDeposit = this.userSchemeMinimumSecurityDeposit * this.schemeNoOfUnitsUserSchemed;
    next();
});
userSchemeSchema.pre('save', function (next) {
    this.schemeBalancePaymentBeforeDueDate = this.schemeTotalAmountUserSchemed - this.schemeTotalSecurityDeposit;
    next();
});
userSchemeSchema.pre('save', async function (next) {
    try {
        const schemeInformation = await SchemeInformation.findById(this.schemeIDUserSchemed).exec();
        if (schemeInformation) {
            if (this.schemeNoOfUnitsUserSchemed > schemeInformation.noOfUnitsAvailableAfterAUserSchemed) {
                return next(new Error('There are only' + ' ' + schemeInformation.noOfUnitsAvailableAfterAUserSchemed + ' ' + 'units available in the Scheme Pool'));
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
const UserScheme = model('UserScheme', userSchemeSchema);
export { UserScheme };
