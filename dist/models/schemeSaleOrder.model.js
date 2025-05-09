import mongoose, { Schema, model } from 'mongoose';
import generateCombinedShortId from '../utils/generateCombinedPOShortId.util.js';
import { ActiveSubscriber } from './activeSubscriber.model.js';
import { SchemeInformation } from './schemeInformationProfile.model.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
;
;
;
;
const SchemeSaleOrderSchema = new Schema({
    userSchemeTransactionID: { type: String, default: generateCombinedShortId, unique: true },
    userRefIdRequiringScheme: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
    userIdRequiringScheme: { type: String },
    userFullNameRequiringScheme: { type: String },
    userEmailRequiringScheme: { type: String },
    userPhoneNoRequiringScheme: { type: String },
    userDeliveryAddressRequiringScheme: { type: String },
    schemeRefIDUserSchemed: { type: Schema.Types.ObjectId, ref: 'SchemeInformation', required: true },
    schemeIDUserSchemed: { type: String },
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
    schemeItemUnitOfMeasure: { type: String },
    schemeTotalAmountUserSchemed: { type: Number },
    schemeTotalSecurityDeposit: { type: Number },
    schemeBalancePaymentBeforeDueDate: { type: Number },
    schemeUserSchemedStartDate: { type: Date },
    schemeUserSchemedEndDate: { type: Date },
    shemeUserSchemedPostDateBegins: { type: Date },
    expectedNoOfDaysToDeliver: { type: Number },
    expectedDeliveryDate: { type: Date },
    amountdDepositedForSchemeByUser: { type: Number, required: true },
    StatingBalanceOnSchemeHistory: [{
            startSchemeDate: { type: Date },
            startingBalanceRemarksOnScheme: { type: String },
            startingBalanceOnScheme: { type: Number },
        }],
    TotalRemittanceMadeSoFar: [{
            remitDateOnScheme: { type: Date },
            remittedSchemeDate: { type: Date },
            remittedSchemeAmount: { type: Number },
            remittedSchemeRemarks: { type: String },
            TotalPaymentsMadeSoFar: { type: String }
        }],
    RemittanceBalanceToBePaidDetails: [{
            remitOnSchemeDate: { type: Date },
            remittanceExpectedBalToBePaidOnScheme: { type: Number },
            remitOnSchemeRemarks: { type: String },
            remittedAmountCROnScheme: { type: Number },
            endingBalanceAfterLastRemittanceOnScheme: { type: Number }
        }],
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
SchemeSaleOrderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.userSchemeTransactionID = generateCombinedShortId();
    }
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemeRefIDUserSchemed = new mongoose.Types.ObjectId(this.schemeRefIDUserSchemed);
    next();
});
SchemeSaleOrderSchema.pre('save', async function (next) {
    try {
        const activeUserRequiringScheme = await ActiveSubscriber.findById(this.userRefIdRequiringScheme).exec();
        if (activeUserRequiringScheme) {
            this.userIdRequiringScheme = activeUserRequiringScheme.activeSubscriberID.toString();
            this.userFullNameRequiringScheme = activeUserRequiringScheme.activeSubscriberFirstName + ' ' + activeUserRequiringScheme.activeSubscriberMiddleName + ' ' + activeUserRequiringScheme.activeSubscriberLastName;
            this.userEmailRequiringScheme = activeUserRequiringScheme.activeSubscriberEmail;
            this.userPhoneNoRequiringScheme = activeUserRequiringScheme.activeSubscriberPhoneNo;
            this.userDeliveryAddressRequiringScheme = activeUserRequiringScheme.activeSubscriberAssetDeliveryAddress;
        }
    }
    catch (err) {
        next(err);
    }
    ;
    try {
        const schemeInformation = await SchemeInformation.findById(this.schemeRefIDUserSchemed).exec();
        if (schemeInformation) {
            this.schemeIDUserSchemed = schemeInformation.schemeID;
            this.schemeItemIDUserSchemed = schemeInformation.itemIDToBeSchemed;
            this.schemeItemNameUserSchemed = schemeInformation.itemNameToBeSchemed;
            this.schemeItemShortDescUserSchemed = schemeInformation.itemDescriptionToBeSchemed;
            this.schemeNameUserSchemed = schemeInformation.schemeName;
            this.schemeShortDescUserSchemed = schemeInformation.schemeShortDescription;
            this.schemeItemOriginalPriceUserSchemed = schemeInformation.itemToBeSchemedOriginalPrice;
            this.schemeItemUnitOfMeasure = schemeInformation.schemeUnitOfMeasureName;
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
SchemeSaleOrderSchema.post('save', async function (doc, next) {
    try {
        const schemeInformation = await SchemeInformation.findById(doc.schemeRefIDUserSchemed).exec();
        if (schemeInformation) {
            schemeInformation.schemePoolDetailsUpdate.push({
                schemeCount: schemeInformation.schemePoolDetailsUpdate.length + 1,
                userSchemeTransID: doc.userSchemeTransactionID,
                userIDWhoSuccessfullySchemed: doc.userIdRequiringScheme,
                userNameWhoSuccessfullySchemed: doc.userFullNameRequiringScheme,
                userPhoneNoWhoSuccessfullySchemed: doc.userPhoneNoRequiringScheme,
                userActionTimestamp: doc.createdAt,
                userDurationBeforeActionWasTaken: 'PENDING',
                userAmountUserPaid: doc.amountdDepositedForSchemeByUser,
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
SchemeSaleOrderSchema.pre('save', function (next) {
    if (this.schemeUserSchemedStartDate > this.schemeUserSchemedEndDate) {
        return next(new Error('The schemeUserSchemedStartDate cannot be greater than the schemeUserSchemedEndDate'));
    }
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemeTotalAmountUserSchemed = this.schemeUnitPriceUserSchemed * this.schemeNoOfUnitsUserSchemed;
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemeDiscountWavedUserSchemed = (this.schemeNoOfUnitsUserSchemed * this.schemeItemOriginalPriceUserSchemed) - (this.schemeNoOfUnitsUserSchemed * this.schemeUnitPriceUserSchemed);
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemePaymentDueDate = new Date(this.schemeUserSchemedEndDate.getTime() - (1 * 24 * 60 * 60 * 1000));
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemeTotalSecurityDeposit = this.userSchemeMinimumSecurityDeposit * this.schemeNoOfUnitsUserSchemed;
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    this.schemeBalancePaymentBeforeDueDate = this.schemeTotalAmountUserSchemed - this.schemeTotalSecurityDeposit;
    next();
});
SchemeSaleOrderSchema.pre('save', async function (next) {
    try {
        const schemeInformation = await SchemeInformation.findById(this.schemeRefIDUserSchemed).exec();
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
SchemeSaleOrderSchema.pre('save', function (next) {
    if (this.amountdDepositedForSchemeByUser > this.schemeTotalAmountUserSchemed) {
        return next(new Error('The Amount To Be Paid Cannot Be Greater Than: ' + ' ' + this.schemeTotalAmountUserSchemed));
    }
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    if (this.amountdDepositedForSchemeByUser < (this.userSchemeMinimumSecurityDeposit * this.schemeNoOfUnitsUserSchemed)) {
        const amountUserMustPay = this.userSchemeMinimumSecurityDeposit * this.schemeNoOfUnitsUserSchemed;
        return next(new Error('The amountPaidByUser cannot be less than: ' + ' ' + amountUserMustPay));
    }
    next();
});
SchemeSaleOrderSchema.pre('save', function (next) {
    if (!this.StatingBalanceOnSchemeHistory || this.StatingBalanceOnSchemeHistory.length === 0) {
        this.StatingBalanceOnSchemeHistory.push({
            startSchemeDate: new Date(),
            startingBalanceOnScheme: this.schemeTotalAmountUserSchemed,
            startingBalanceRemarksOnScheme: `Start Balance | Scheme ID:${this.schemeIDUserSchemed} || Item ID:${this.schemeItemIDUserSchemed} || ${this.schemeItemNameUserSchemed} || ${this.schemeNoOfUnitsUserSchemed}${this.schemeItemUnitOfMeasure} @${formatCurrency(this.schemeUnitPriceUserSchemed)} each`,
        });
    }
    if (!this.TotalRemittanceMadeSoFar || this.TotalRemittanceMadeSoFar.length === 0) {
        this.TotalRemittanceMadeSoFar.push({
            remitDateOnScheme: new Date(),
            remittedSchemeDate: new Date(),
            remittedSchemeAmount: this.amountdDepositedForSchemeByUser,
            remittedSchemeRemarks: `Security Deposit Paid | Scheme ID: ${this.schemeIDUserSchemed} || ${this.schemeNoOfUnitsUserSchemed}${this.schemeItemUnitOfMeasure} @${formatCurrency(this.schemeUnitPriceUserSchemed)} each`,
            TotalPaymentsMadeSoFar: this.amountdDepositedForSchemeByUser.toString(),
        });
    }
    if (!this.RemittanceBalanceToBePaidDetails || this.RemittanceBalanceToBePaidDetails.length === 0) {
        const setExpectedBalToBePaidOnScheme = -(this.schemeTotalAmountUserSchemed || 0);
        const setEndingBalanceAfterMinimumSecurityDeposit = setExpectedBalToBePaidOnScheme + this.amountdDepositedForSchemeByUser;
        this.RemittanceBalanceToBePaidDetails.push({
            remitOnSchemeDate: new Date(),
            remittanceExpectedBalToBePaidOnScheme: setExpectedBalToBePaidOnScheme,
            remitOnSchemeRemarks: `Minimum Security Deposit | Scheme ID: ${this.schemeIDUserSchemed} || ${this.schemeNoOfUnitsUserSchemed}${this.schemeItemUnitOfMeasure} @${formatCurrency(this.schemeUnitPriceUserSchemed)} each`,
            remittedAmountCROnScheme: this.amountdDepositedForSchemeByUser,
            endingBalanceAfterLastRemittanceOnScheme: setEndingBalanceAfterMinimumSecurityDeposit,
            remitDateOnScheme: new Date(),
            isRemittanceForSchemeFirstPayment: undefined
        });
    }
    next();
});
const SchemeSaleOrder = model('SchemeSaleOrder', SchemeSaleOrderSchema);
export { SchemeSaleOrder };
