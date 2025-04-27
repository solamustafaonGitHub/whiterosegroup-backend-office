import mongoose, {Schema, Document, model} from 'mongoose';
import {ItemInformation} from './itemInformation.model.js';
import {UOM, IUnitOfMeaasureOfSale} from './uom.model.js';
import {User} from 'react-feather';

//Function to generate a 6-digit short ID starting from 934001
function generateSchemeIPShortId(): string {
    const min:number = 934001;
    const max:number = 999999; // Maximum value for a 7-digit number starting from 4101000
    const randomId:number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0'); // Ensure the ID is 6 digits long
};

//interface for the sheme history based on the number of units a user has schemed in the createUserScheme model
interface ISchemePoolDetails{
 schemeCount: number;
 userSchemeTransID: string;
 userIDWhoSuccessfullySchemed: string;
 userNameWhoSuccessfullySchemed: string;
 userPhoneNoWhoSuccessfullySchemed: string;
 userActionTimestamp: Date, 
 userDurationBeforeActionWasTaken: string;
 userAmountUserPaid: number;
 userSchemedHowManyUnits: number;
};

//Define the interface for Schemes
interface ISchemeIP extends Document {
    formatCurrency(sumTotalAmountSecuritDepositsPaidByAllUsers: any): unknown;
    schemeID: string;
    itemRefIDToBeSchemed: mongoose.Types.ObjectId;
    itemIDToBeSchemed: string;
    itemNameToBeSchemed: string;
    itemDescriptionToBeSchemed: string;
    schemeName: string;
    schemeShortDescription: string;
    itemToBeSchemedOriginalPrice: number;
    schemeRefUnitOfMeasure: mongoose.Types.ObjectId;
    schemeUnitOfMeasureName: string
    schemeUnitPrice: number;
    schemeDiscountWaved: number;
    schemePaymentStructure: 
    'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE BEFORE DUE DATE' | 
    'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE ON DELIVERY' | 
    'PAYMENT ON DELIVERY'  | 'FULL PAYMENT UPFRONT';
    totalUnitsAvailableForScheme: number;
    schemeMinimumSecurityDeposit: number;
    schemeStartDate: Date;
    schemeEndDate: Date;
    schemeStatus: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED', default:'OPEN';
    schemeRunForHowLong: string;
    postDateBegins: Date;
    expectedNoOfDaysToDeliver: number;
    expectedDeliveryDate: Date;
    createdAt: Date;
    schemePoolDetailsUpdate: ISchemePoolDetails[];
    noOfUnitsAvailableAfterAUserSchemed: number;
    sumTotalAmountSecuritDepositsPaidByAllUsers: number;
    lastUpdatedAt: Date;
};

//Define the SchemeSchema
const schemeIPSchema = new Schema<ISchemeIP>({
    schemeID: {type:String, default:generateSchemeIPShortId},
    itemRefIDToBeSchemed: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
    itemIDToBeSchemed: {type:String},
    itemNameToBeSchemed: {type:String},
    itemDescriptionToBeSchemed: {type:String},
    schemeName: {type:String, required:true},
    schemeShortDescription: {type:String, required:true},
    itemToBeSchemedOriginalPrice: {type:Number},
    schemeRefUnitOfMeasure: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
    schemeUnitOfMeasureName: {type:String},
    schemeUnitPrice: {type:Number, required:true},
    schemeDiscountWaved: {type:Number},
    schemePaymentStructure: {type:String, required:true, enum:[
        'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE BEFORE SCHEME END DATE', 
        'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE UPON DELIVERY', 
        'PAYMENT ON DELIVERY',
        'FULL PAYMENT UPFRONT'
    ]},
    totalUnitsAvailableForScheme: {type:Number, required:true},
    schemeMinimumSecurityDeposit: {type:Number, required:true},
    schemeStartDate: {type:Date, required:true},
    schemeEndDate: {type:Date, required:true},
    schemeStatus: {type:String, required:true, enum:['OPEN','CLOSED','CANCELLED', 'COMPLETED'], default:'OPEN'},
    schemeRunForHowLong: {type:String},
    postDateBegins: {type:Date, required:true},
    expectedNoOfDaysToDeliver: {type:Number, required:true},
    expectedDeliveryDate: {type:Date},
    createdAt: {type: Date, default:Date.now, required:true},
    schemePoolDetailsUpdate: [{
        schemeCount: {type:Number},
        userSchemeTransID: {type:String},
        userIDWhoSuccessfullySchemed: {type:String},
        userNameWhoSuccessfullySchemed: {type:String},
        userPhoneNoWhoSuccessfullySchemed: {type:String},
        userActionTimestamp: {type:Date}, 
        userDurationBeforeActionWasTaken: {type:String},
        userAmountUserPaid: {type:Number},
        userSchemedHowManyUnits: {type:Number}
    }],
    noOfUnitsAvailableAfterAUserSchemed: {type:Number},
    sumTotalAmountSecuritDepositsPaidByAllUsers: {type:Number},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});

//Pre-Save Hook to ensure schemaID is generated and valid
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (!this.schemeID) {
        this.schemeID = generateSchemeIPShortId(); // Ensure schemeID is generated if it's missing
    }
    next();
});

//Pre-Save Hook to set the itemDescriptionToBeSchemed based on the itemIdToBeSchemed
schemeIPSchema.pre<ISchemeIP>('save', async function (next) {
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
    } catch (error) {
        next();
    }
});

//Pre-save hook to set the schemeUnitOfMeasure based on the schemeUnitOfMeasureRef
schemeIPSchema.pre<ISchemeIP>('save', async function (next) {
    try {
        if (this.schemeRefUnitOfMeasure) {
            const uom = await UOM.findById(this.schemeRefUnitOfMeasure).exec();
            if (uom) {
                this.schemeUnitOfMeasureName = uom.unitMeaseureName;
            }
        }
        next();
    } catch (error) {
        next();
    }
});

//Pre-save Hook to ensure expectedDeliveryDate is calculated
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (!this.expectedDeliveryDate) {
        this.expectedDeliveryDate = new Date(this.postDateBegins.getTime() + (this.expectedNoOfDaysToDeliver * 24 * 60 * 60 * 1000));
    }
    next();
});

// Pre-Save hook to calculate schemeDiscountWaved
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (!this.schemeDiscountWaved) {
        this.schemeDiscountWaved = this.itemToBeSchemedOriginalPrice - this.schemeUnitPrice;
    }
    next();
});

//Pre-save hook to calculate how many days the scheme will run for & then convert value to hr:min:sec
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (!this.schemeRunForHowLong) {
        const totalSeconds = Math.ceil((this.schemeEndDate.getTime() - this.schemeStartDate.getTime()) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        this.schemeRunForHowLong = `${hours} hours ${minutes} minutes ${seconds} seconds`;
    }
    next();
});

//Pre-save hook to calculate noOfUnitsAvailableAfterAUserSchemed which will be the total userSchemedHowManyUnits
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.noOfUnitsAvailableAfterAUserSchemed = this.totalUnitsAvailableForScheme - this.schemePoolDetailsUpdate.reduce((acc, val) => acc + val.userSchemedHowManyUnits, 0);
    }
    next();
});

//Pre-save hook to ensure scheme status is updated to 'COMPLETED' when the noOfUnitsAvailableAfterAUserSchemed is 0
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.noOfUnitsAvailableAfterAUserSchemed === 0) {
        this.schemeStatus = 'COMPLETED';
    }
    next();
});

//Pre-save hook to ensure scheme status is updated to 'CLOSED' 1 minute after the schemeEndDate 
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.schemeEndDate.getTime() < Date.now()) {
        this.schemeStatus = 'CLOSED';
    }
    next();
});

//Pre-save hook to ensure that no user can scheme once the schemeStatus is 'CLOSED' or 'COMPLETED'
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.schemeStatus === 'CLOSED' || this.schemeStatus === 'COMPLETED') {
        this.schemePoolDetailsUpdate = [];
    }
    next();
});

//Pre-save hook to calculate the userDurationBeforeActionWasTaken which is the time difference between the schemeStartDate and the timeDate the user schemed
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.schemePoolDetailsUpdate.forEach((element) => {
            if (element.userActionTimestamp) {
                const userActionDate = new Date(element.userActionTimestamp);
                const durationInSeconds = Math.ceil((userActionDate.getTime() - this.schemeStartDate.getTime()) / 1000);
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor((durationInSeconds % 3600) / 60);
                const seconds = durationInSeconds % 60;

                element.userDurationBeforeActionWasTaken = `${hours} hrs ${minutes} mins ${seconds} secs`;
            } else {
                element.userDurationBeforeActionWasTaken = 'N/A'; // Handle missing timestamp gracefully
            }
        });
    }
    next();
});

//Pre-save to calculate the sumTotalAmountSecuritDepositsPaidByAllUsers which is the sum of all userAmountUserPaid of all the userSchemeTransID
schemeIPSchema.pre<ISchemeIP>('save', function (next) {
    if (this.schemePoolDetailsUpdate.length > 0) {
        this.sumTotalAmountSecuritDepositsPaidByAllUsers = this.schemePoolDetailsUpdate.reduce((acc, val) => acc + val.userAmountUserPaid, 0);
    }
    next();
});

// Create & Export the Model. The collection name in the database is derived from the model name. 
// By default, Mongoose will pluralize the model name to determine the collection name.
const SchemeInformation = model<ISchemeIP>('SchemeInformation', schemeIPSchema);
export {SchemeInformation, ISchemeIP, ISchemePoolDetails};

