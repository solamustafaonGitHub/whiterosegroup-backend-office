import mongoose, {Schema, Document, model, CallbackError} from 'mongoose';
import {UserScheme, IUserScheme} from './userScheme.model.js';
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';
import {generateCombinedRemittanceShortId} from '../utils/generateCombinedRemittanceShortId.utils.js';

import {UpdateItemPrice} from './updateItemPrice.model.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
import {SchemeInformation} from './schemeInformationProfile.model.js';

import {EventEmitter} from 'events';
const eventBus = new EventEmitter();

interface IStartingBalanceOnSchemeHistory {
  startSchemeDate: string | number | Date;
  startingBalanceOnScheme: number;
  startingBalanceRemarksOnScheme: string;
}

//Interface for Remittance
interface IRemittanceScheme extends Document {
  remittanceOnSchemeID: string;
    remittanceForWhichUserSchemeTransID: mongoose.Types.ObjectId;
    createdAt: Date;
    remittanceOnSchemeDate: Date;
    remittanceForWhichSchemeID: string;
    remittanceForWhichActiveUserIDWhoSchemed: string;
    remittanceActiveUserFullNameWhoSchemed: string;
    remittanceSchemePhoneNo: string;
    remittanceSchemeAmount_CR: number;
    remittanceSchemeDueBalance: number;
    remittanceSchemePaymentRefClass: mongoose.Types.ObjectId;
    remittanceSchemePaymentClass: string;
    remittanceSchemeRemarks: string;
    lastUpdatedAt: Date;
};

//Schema for Remittance on Scheme
const remittanceSchemeSchema = new Schema<IRemittanceScheme>({
  remittanceOnSchemeID: {type:String, unique:true, default:generateCombinedRemittanceShortId()},
    remittanceForWhichUserSchemeTransID: {type:Schema.Types.ObjectId, required:true, ref:'UserScheme'},
    createdAt: {type:Date, default:Date.now, required:true},
    remittanceOnSchemeDate: {type: Date, default:Date.now, required:true},
    remittanceForWhichSchemeID: {type:String},
    remittanceForWhichActiveUserIDWhoSchemed: {type:String},
    remittanceActiveUserFullNameWhoSchemed: {type:String},
    remittanceSchemePhoneNo: {type:String,},
    remittanceSchemeAmount_CR: {type:Number, required:true},
    remittanceSchemeDueBalance: {type:Number},
    remittanceSchemePaymentRefClass: {type:Schema.Types.ObjectId, required:true, ref:'PaymentClass'},
    remittanceSchemePaymentClass: {type:String},
    remittanceSchemeRemarks: {type:String, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});

//Ensure remittanceReferenceID is generated before saving the document
remittanceSchemeSchema.pre<IRemittanceScheme>('save', function (next) {
  if (!this.remittanceOnSchemeID || this.remittanceOnSchemeID.trim() === '') {
      return next(new Error('Remittance Scheme Reference ID is required. Please ensure a valid Remittance Reference Scheme ID is generated.'));
    }
  next();
    });

//Pre-save hook for handling PaymentClass updates
    remittanceSchemeSchema.pre<IRemittanceScheme>('save', async function (next) {
        try {
          if (this.remittanceSchemePaymentRefClass) {
            const paymentClass = await PaymentClass.findById(this.remittanceSchemePaymentRefClass).exec();
            if (paymentClass) {
              this.remittanceSchemePaymentClass = paymentClass.paymentClassName;
            }
          }
          next();
        } catch (error) {
          next(error);
        }
      });

//Pre-save hook for handling remittance updates and price adjustments
// ... (Rest of your code up to and including the `remittanceSchemeSchema.pre('save', ...)` block) ...

remittanceSchemeSchema.pre<IRemittanceScheme>('save', async function (next) {
  try {
    if (this.remittanceForWhichUserSchemeTransID) {
      const userSchemeOrder = await UserScheme.findById(this.remittanceForWhichUserSchemeTransID).exec();
      if (userSchemeOrder) {
        this.remittanceForWhichSchemeID = userSchemeOrder.userSchemeTransactionID;
        this.remittanceForWhichActiveUserIDWhoSchemed = userSchemeOrder.userIdRequiringScheme;
        this.remittanceActiveUserFullNameWhoSchemed = userSchemeOrder.userFullNameRequiringScheme;
        this.remittanceSchemePhoneNo = userSchemeOrder.userPhoneNoRequiringScheme;

        // ... (Rest of the code for handling StatingBalanceOnSchemeHistory) ...

        // Initialize totalRemittanceMadeSoFarOnSchemeHistory array
        const totalRemittanceMadeSoFarOnSchemeHistory = userSchemeOrder.TotalRemittanceMadeSoFar || [];

        // Initialize TotalRemittanceMadeSoFar array
        const TotalRemittanceMadeSoFar = userSchemeOrder.TotalRemittanceMadeSoFar || [];

        // Get the last recorded values for aggregation logic
        const lastTotalRemittance = TotalRemittanceMadeSoFar.length > 0
          ? TotalRemittanceMadeSoFar[TotalRemittanceMadeSoFar.length - 1].TotalPaymentsMadeSoFar
          : userSchemeOrder.amountdDepositedForSchemeByUser;

        // Initialize RemittanceBalanceToBePaidDetails array
        const RemittanceBalanceToBePaidDetails = userSchemeOrder.RemittanceBalanceToBePaidDetails || [];

        // Get the last recorded balance
        const lastBalance = RemittanceBalanceToBePaidDetails.length > 0
          ? RemittanceBalanceToBePaidDetails[RemittanceBalanceToBePaidDetails.length - 1].endingBalanceAfterLastRemittanceOnScheme
          : userSchemeOrder.initialSchemeBalance; // Ensure this field exists in your model

        // Define remittanceAmount
        const remittanceAmount = this.remittanceSchemeAmount_CR;

        // Calculate the new balance (previous balance + current remittance)
        const newBalance = lastBalance + remittanceAmount;

        // Push the new remittance event to the `TotalRemittanceMadeSoFarOnSchemeHistory` array
        totalRemittanceMadeSoFarOnSchemeHistory.push({
          remitDateOnScheme: new Date(),
          remittedSchemeDate: new Date(),
          remittedSchemeAmount: remittanceAmount,
          remittedSchemeRemarks: `Remittance of ${remittanceAmount}`,
          TotalPaymentsMadeSoFar: (Number(lastTotalRemittance) + remittanceAmount).toString(),
        });

        // Push the new balance update to the `RemittanceBalanceToBePaidOnSchemeHistory` array
        RemittanceBalanceToBePaidDetails.push({
          remitOnSchemeDate: new Date(),
          remittanceExpectedBalToBePaidOnScheme: lastBalance, // The balance before this remittance
          remitOnSchemeRemarks: `Payment Update for Remittance On Sheme ID: ${this.remittanceForWhichSchemeID}`,
          remittedAmountCROnScheme: remittanceAmount,
          endingBalanceAfterLastRemittanceOnScheme: newBalance, // Use the calculated new balance
          remitDateOnScheme: undefined,
          isRemittanceForSchemeFirstPayment: undefined,
        });

        // Update the userSchemeOrder object
        userSchemeOrder.TotalRemittanceMadeSoFar = TotalRemittanceMadeSoFar;
        userSchemeOrder.RemittanceBalanceToBePaidDetails = RemittanceBalanceToBePaidDetails;

        // Save the updated scheme order
        await userSchemeOrder.save();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ... (Rest of your code) ...


//Create & Export the Model
const RemitOnScheme = mongoose.model<IRemittanceScheme>('RemittanceOnScheme', remittanceSchemeSchema);
export {RemitOnScheme, IRemittanceScheme, remittanceSchemeSchema};



