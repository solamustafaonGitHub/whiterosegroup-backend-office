import { Schema, model } from 'mongoose';
import { ItemInformation } from './itemInformation.model.js';
import { UOM } from './uom.model.js';
function generateSchemeIPShortId() {
    const min = 934001;
    const max = 999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
}
;
;
;
const schemeIPSchema = new Schema({
    schemeID: { type: String, default: generateSchemeIPShortId },
    itemRefIDToBeSchemed: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    itemIDToBeSchemed: { type: String },
    itemNameToBeSchemed: { type: String },
    itemDescriptionToBeSchemed: { type: String },
    schemeName: { type: String, required: true },
    schemeShortDescription: { type: String, required: true },
    itemToBeSchemedOriginalPrice: { type: Number },
    schemeRefUnitOfMeasure: { type: Schema.Types.ObjectId, ref: 'UOM', required: true },
    schemeUnitOfMeasureName: { type: String },
    schemeUnitPrice: { type: Number, required: true },
    schemeDiscountWaved: { type: Number },
    schemePaymentStructure: { type: String, required: true, enum: [
            'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE BEFORE SCHEME END DATE',
            'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE UPON DELIVERY',
            'PAYMENT ON DELIVERY',
            'FULL PAYMENT UPFRONT'
        ] },
    totalUnitsAvailableForScheme: { type: Number, required: true },
    schemeMinimumSecurityDeposit: { type: Number, required: true },
    schemeStartDate: { type: Date, required: true },
    schemeEndDate: { type: Date, required: true },
    schemeStatus: { type: String, required: true, enum: ['OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'], default: 'OPEN' },
    schemeRunForHowLong: { type: String },
    postDateBegins: { type: Date, required: true },
    expectedNoOfDaysToDeliver: { type: Number, required: true },
    expectedDeliveryDate: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
    schemePoolDetailsUpdate: [{
            schemeCount: { type: Number },
            userSchemeTransID: { type: String },
            userIDWhoSuccessfullySchemed: { type: String },
            userNameWhoSuccessfullySchemed: { type: String },
            userPhoneNoWhoSuccessfullySchemed: { type: String },
            userActionTimestamp: { type: Date },
            userDurationBeforeActionWasTaken: { type: String },
            userAmountUserPaid: { type: Number },
            userSchemedHowManyUnits: { type: Number }
        }],
    noOfUnitsAvailableAfterAUserSchemed: { type: Number },
    sumTotalAmountSecuritDepositsPaidByAllUsers: { type: Number },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
schemeIPSchema.pre('save', function (next) {
    if (!this.schemeID) {
        this.schemeID = generateSchemeIPShortId();
    }
    next();
});
schemeIPSchema.pre('save', async function (next) {
    try {
        if (this.itemRefIDToBeSchemed) {
            const iteminformation = await ItemInformation.findById(this.itemRefIDToBeSchemed).exec();
            if (iteminformation) {
                this.itemIDToBeSchemed = iteminformation.itemInformationID;
                this.itemNameToBeSchemed = iteminformation.itemInformationName;
                this.itemDescriptionToBeSchemed = iteminformation.itemInformationDescription;
                this.itemToBeSchemedOriginalPrice = iteminformation.itemInformationPriceUpdateDetails[iteminformation.itemInformationPriceUpdateDetails.length - 1].itemInformationCurrentMktPrice;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
schemeIPSchema.pre('save', async function (next) {
    try {
        if (this.schemeRefUnitOfMeasure) {
            const uom = await UOM.findById(this.schemeRefUnitOfMeasure).exec();
            if (uom) {
                this.schemeUnitOfMeasureName = uom.unitMeaseureName;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
schemeIPSchema.pre('save', function (next) {
    if (!this.expectedDeliveryDate) {
        this.expectedDeliveryDate = new Date(this.postDateBegins.getTime() + (this.expectedNoOfDaysToDeliver * 24 * 60 * 60 * 1000));
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (!this.schemeDiscountWaved) {
        this.schemeDiscountWaved = this.itemToBeSchemedOriginalPrice - this.schemeUnitPrice;
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (!this.schemeRunForHowLong) {
        const totalSeconds = Math.ceil((this.schemeEndDate.getTime() - this.schemeStartDate.getTime()) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        this.schemeRunForHowLong = `${hours} hours ${minutes} minutes ${seconds} seconds`;
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.noOfUnitsAvailableAfterAUserSchemed = this.totalUnitsAvailableForScheme - this.schemePoolDetailsUpdate.reduce((acc, val) => acc + val.userSchemedHowManyUnits, 0);
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.noOfUnitsAvailableAfterAUserSchemed === 0) {
        this.schemeStatus = 'COMPLETED';
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.schemeEndDate.getTime() < Date.now()) {
        this.schemeStatus = 'CLOSED';
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.schemeStatus === 'CLOSED' || this.schemeStatus === 'COMPLETED') {
        this.schemePoolDetailsUpdate = [];
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.schemePoolDetailsUpdate.forEach((element) => {
            if (element.userActionTimestamp) {
                const userActionDate = new Date(element.userActionTimestamp);
                const durationInSeconds = Math.ceil((userActionDate.getTime() - this.schemeStartDate.getTime()) / 1000);
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = durationInSeconds % 60;
                element.userDurationBeforeActionWasTaken = `${hours} hrs ${minutes} mins ${seconds} secs`;
            }
            else {
                element.userDurationBeforeActionWasTaken = 'N/A';
            }
        });
    }
    next();
});
schemeIPSchema.pre('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.sumTotalAmountSecuritDepositsPaidByAllUsers = this.schemePoolDetailsUpdate.reduce((acc, val) => acc + val.userAmountUserPaid, 0);
    }
    next();
});
const SchemeInformation = model('SchemeInformation', schemeIPSchema);
export { SchemeInformation };
