import mongoose, {Schema, Document, model, CallbackError} from 'mongoose';
import {UserScheme, IUserScheme} from './userScheme.model.js';
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';
import {UpdateItemPrice} from './updateItemPrice.model.js';
import {generateCombinedRemittanceShortId} from '../utils/generateCombinedRemittanceShortId.utils.js';

import {StandardPurchaseOrder, IStandardPurchaseOrder } from './standardPurchaseOrder.model.js';

import {EventEmitter} from 'events';
const eventBus = new EventEmitter();

//Interface for Remittance Balance To Be Paid History
interface IRemittanceBalanceToBePaidHistory {
  priceChangeOnStandardPODate: string | number | Date;
  isRemittanceAfterPriceChangeOnStandardPO: unknown;
  remitDateOnStandardPO?: Date;
  remittanceExpectedBalToBePaidOnStandardPO?: number;
  remittanceUpdateRemarksOnStandardPO?: string;
  remittedAmountCROnStandardPO?: number;
  endingBalanceAfterLastRemittanceOnStandardPO?: number;
  endingBalanceAfterLastRemittance?: number;
  priceAdjustmentAppliedOnStandardPO: boolean;
  priceAdjustmentApplied: boolean;
  isRemittanceAfterPriceChange: boolean;
};

// Extend IMultipleStandardPurchaseOrderIntent to include TotalRemittanceMadeSoFarOnStandardPO
interface IMultipleStandardPurchaseOrderIntent {
  TotalRemittanceMadeSoFarOnStandardPO?: Array<{
    remittedDateOnStandardPO: Date;
    remittedAmountOnStandardPO: number;
    TotalPaymentsMadeSoFarOnStandardPO: string;
    remitDateOnStandardPO: string;
    remittedRemarksOnStandardPO?: string;
  }>;
  StandardPurchaseOrderCumulativeBalance?: Array<{
    cumulativeBalance: number;
  }>;
  [key: string]: any; // Allow dynamic properties like TotalRemittanceMadeSoFarOnStandardPO
}

//Interface for Remittance Details on Standard Purchase Order
interface IRemittanceStandardPO extends Document {
    remittanceReferenceStandardPOID: string;
    remittanceForWhichStandardPORefID: mongoose.Types.ObjectId;
    createdAt: Date;
    remittanceDate: Date;
    remittanceForWhichStandardPurchaseOrderID: string;
    remittanceForWhichActiveSubscriberID: string;
    remittanceActiveUserFullName: string;
    remittancePOPhoneNo: string;
    remittanceByUserEmailAddress: string;
    remittanceAmount_CR: number;
    remittanceDueBalance: number;
    remittancePaymentRefClass: mongoose.Types.ObjectId;
    remittancePaymentClass: string;
    remittanceOnStandardPORemarks: string;
    lastUpdatedAt: Date;
};

const RemittanceStandardPOSchema = new Schema<IRemittanceStandardPO>({
  remittanceReferenceStandardPOID: {type:String, default:generateCombinedRemittanceShortId, unique:true},
    remittanceForWhichStandardPORefID: {type:Schema.Types.ObjectId, ref:'StandardPurchaseOrder', required:true},
    createdAt: {type:Date, default:Date.now, required:true},
    remittanceDate: {type:Date, default:Date.now, required:true},
    remittanceForWhichStandardPurchaseOrderID: {type:String},
    remittanceForWhichActiveSubscriberID: {type:String},
    remittanceActiveUserFullName: {type:String},
    remittancePOPhoneNo: {type:String},
    remittanceByUserEmailAddress: {type:String},
    remittanceAmount_CR: {type:Number, required:true},
    remittanceDueBalance: {type:Number},
    remittancePaymentRefClass: {type:Schema.Types.ObjectId, ref:'PaymentClass', required:true},
    remittancePaymentClass: {type:String},
    remittanceOnStandardPORemarks: {type:String, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});


//1.Ensure remittanceReferenceID is generated before saving the document
RemittanceStandardPOSchema.pre<IRemittanceStandardPO>('save', function (next) {
    if (!this.remittanceReferenceStandardPOID || this.remittanceReferenceStandardPOID.trim() === '') {
        return next(new Error('Please ensure a valid Remittance Reference ID is generated for Standard PO Remittance'));
    }
    next();
});

//2.Pre-save hook for handling remittance updates and price adjustments
RemittanceStandardPOSchema.pre<IRemittanceStandardPO>('save', async function (next) {
  try {
    if (!this.remittanceForWhichStandardPORefID) return next();

    const standardPO = await StandardPurchaseOrder.findById(this.remittanceForWhichStandardPORefID).lean().exec();
    if (!standardPO) return next(new Error("Standard Purchase Order not found."));

    const lastItem = standardPO.StandardPurchaseOrderItems?.slice(-1)[0];
    const latestItemBalance = lastItem?.StandardPurchaseOrderCumulativeBalance?.slice(-1)[0]?.cumulativeBalance ?? 0;

    if (this.remittanceAmount_CR > latestItemBalance) {
      return next(new Error(`Overpayment Detected. Maximum allowed remittance is ${latestItemBalance}`));
    }

    const newEndingBalance = Math.max(0, latestItemBalance - this.remittanceAmount_CR);

    //Prepare new remittance entry
    const newRemittanceEntry = {
      remittedDateOnStandardPO: this.createdAt,
      remittedAmountOnStandardPO: this.remittanceAmount_CR,
      TotalPaymentsMadeSoFarOnStandardPO: ((standardPO.TotalRemittanceMadeSoFarOnStandardPO || []).reduce((acc, rem) => acc + (rem?.remittedAmountOnStandardPO || 0), 0) + this.remittanceAmount_CR).toFixed(2),
      remitDateOnStandardPO: '',
      remittedRemarksOnStandardPO: this.remittanceOnStandardPORemarks || ''
    };

    // Prepare update operation
    const updateOps: any = {
      $push: {
        TotalRemittanceMadeSoFarOnStandardPO: newRemittanceEntry,
        "StandardPurchaseOrderItems.$[lastItem].StandardPurchaseOrderCumulativeBalance": {
          cumulativeBalance: newEndingBalance
        }
      }
    };

    // Perform update safely with arrayFilters to update only the last item
    await StandardPurchaseOrder.updateOne(
      { _id: this.remittanceForWhichStandardPORefID },
      updateOps,
      {
        arrayFilters: [{ "lastItem.standardPurchaseOrderIntentID": lastItem?.standardPurchaseOrderIntentID }]
      }
    );

    // Sync helper fields
    this.remittanceForWhichStandardPurchaseOrderID = standardPO.standardPurchaseOrderId;
    this.remittanceForWhichActiveSubscriberID = standardPO.standardPOrderForActiveSubscriberID;
    this.remittanceActiveUserFullName = standardPO.standardPOrderUserProfileFullName;
    this.remittancePOPhoneNo = standardPO.standardPOrderUserProfilePhoneNo;

    next();
  } catch (error) {
    next(error);
  }
});



//3. Pre-save to ensure its the server dates that are used & not client dates
RemittanceStandardPOSchema.pre<IRemittanceStandardPO>('save', function (next) {
    this.createdAt = new Date(this.createdAt);
    this.remittanceDate = new Date(this.remittanceDate);
    this.lastUpdatedAt = new Date(this.lastUpdatedAt);
    next();
});


//Create & Export the Model
const RemittanceOnStandardPO = mongoose.model<IRemittanceStandardPO>('RemittanceOnStandardPO', RemittanceStandardPOSchema);
export {RemittanceOnStandardPO, IRemittanceStandardPO};
