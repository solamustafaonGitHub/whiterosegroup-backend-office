import mongoose, {Schema, Document, model, CallbackError} from 'mongoose';
import {SchemeSaleOrder, ISchemeSaleOrder} from './schemeSaleOrder.model.js';
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

    const items = standardPO.StandardPurchaseOrderItems || [];
    if (items.length === 0) return next(new Error("No purchase order items found."));
    //Prepare item balances using last cumulative balance
    const itemBalances: Record<string, number> = {};
    for (const item of items) {
      const intentID = item.standardPurchaseOrderIntentID;
      const lastBalanceEntry = item.StandardPurchaseOrderCumulativeBalance?.slice(-1)[0];
      itemBalances[intentID] = lastBalanceEntry?.cumulativeBalance ?? 0;
    }
    //Total available to remit
    let remainingPayment = this.remittanceAmount_CR;
    let arrayFilterIndex = 0;
    const updateOps: any = {
      $push: {
        TotalRemittanceMadeSoFarOnStandardPO: {
          remittedDateOnStandardPO: this.createdAt,
          remittedAmountOnStandardPO: this.remittanceAmount_CR,
          TotalPaymentsMadeSoFarOnStandardPO: ((standardPO.TotalRemittanceMadeSoFarOnStandardPO || []).reduce((acc, rem) => acc + (rem?.remittedAmountOnStandardPO || 0),
            0) + this.remittanceAmount_CR).toFixed(2),
          remitDateOnStandardPO: '',
          remittedRemarksOnStandardPO: this.remittanceOnStandardPORemarks || ''
        }
      }
    };

    const arrayFilters: any[] = [];
    for (const item of items) {
      const intentID = item.standardPurchaseOrderIntentID;
      const balance = itemBalances[intentID];

      if (balance <= 0) continue;
      const amountToApply = Math.min(balance, remainingPayment);
      const newBalance = balance - amountToApply;
      const filterKey = `item${arrayFilterIndex}`;
      updateOps.$push[`StandardPurchaseOrderItems.$[${filterKey}].StandardPurchaseOrderCumulativeBalance`] = {cumulativeBalance: newBalance};

      arrayFilters.push({ [`${filterKey}.standardPurchaseOrderIntentID`]: intentID });

      remainingPayment -= amountToApply;
      arrayFilterIndex++;

      if (remainingPayment <= 0) break;
    }
    //Check for overpayment
    if (remainingPayment > 0) {
      return next(new Error(`Overpayment Detected. Max allowed remittance is ${this.remittanceAmount_CR - remainingPayment}`));
    }
    //Execute the update
    await StandardPurchaseOrder.updateOne(
      { _id: this.remittanceForWhichStandardPORefID },
      updateOps,
      {arrayFilters}
    );

    //Set helper fields
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
