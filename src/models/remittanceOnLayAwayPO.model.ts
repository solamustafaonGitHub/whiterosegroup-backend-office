import mongoose, {Schema, Document, model, CallbackError} from 'mongoose';
import {SchemeSaleOrder, ISchemeSaleOrder} from './schemeSaleOrder.model.js';
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';
import {UpdateItemPrice} from './updateItemPrice.model.js';
import {generateCombinedRemittanceShortId } from '../utils/generateCombinedRemittanceShortId.utils.js';

import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder } from './layAwayPurchaseOrder.model.js';

import {EventEmitter} from 'events';
const eventBus = new EventEmitter();

//Interface for Remittance Balance To Be Paid History
interface IRemittanceBalanceToBePaidHistory {
  priceChangeOnLayAwayPODate: string | number | Date;
  isRemittanceAfterPriceChangeOnLayAwayPO: unknown;
  remitDateOnLayAwayPO?: Date;
  remittanceExpectedBalToBePaidOnLayAwayPO?: number;
  remittanceUpdateRemarksOnLayAwayPO?: string;
  remittedAmountCROnLayAwayPO?: number;
  endingBalanceAfterLastRemittanceOnLayAwayPO?: number;
  endingBalanceAfterLastRemittance?: number;
  priceAdjustmentAppliedOnLayAwayPO: boolean;
  priceAdjustmentApplied: boolean;
  isRemittanceAfterPriceChange: boolean;
};

//Interface for Remittance
interface IRemittanceLayAwayPO extends Document {
    remittanceForWhichLayAwayPORefID: mongoose.Types.ObjectId;
    createdAt: Date;
    remittanceDate: Date;
    remittanceReferenceID: string;
    remittanceForWhichLayAwayPurchaseOrderID: string;
    remittanceForWhichActiveSubscriberID: string;
    remittanceActiveUserFullName: string;
    remittancePOPhoneNo: string;
    remittanceAmount_CR: number;
    remittanceDueBalance: number;
    remittancePaymentRefClass: mongoose.Types.ObjectId;
    remittancePaymentClass: string;
    remittanceOnLayWayPORemarks: string;
    lastUpdatedAt: Date;
}

const RemittanceLayAwayPOSchema = new Schema<IRemittanceLayAwayPO>({
    remittanceForWhichLayAwayPORefID: {type:Schema.Types.ObjectId, ref:'LayAwayPurchaseOrder', required:true},
    createdAt: {type:Date, default:Date.now, required:true},
    remittanceDate: {type:Date, default:Date.now, required:true},
    remittanceReferenceID: {type:String, default:generateCombinedRemittanceShortId, unique:true},
    remittanceForWhichLayAwayPurchaseOrderID: {type:String},
    remittanceForWhichActiveSubscriberID: {type:String},
    remittanceActiveUserFullName: {type:String},
    remittancePOPhoneNo: {type:String},
    remittanceAmount_CR: {type:Number, required:true},
    remittanceDueBalance: {type:Number},
    remittancePaymentRefClass: {type:Schema.Types.ObjectId, ref:'PaymentClass', required:true},
    remittancePaymentClass: {type:String},
    remittanceOnLayWayPORemarks: {type:String, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});


//Ensure remittanceReferenceID is generated before saving the document
RemittanceLayAwayPOSchema.pre<IRemittanceLayAwayPO>('save', function (next) {
    if (!this.remittanceReferenceID || this.remittanceReferenceID.trim() === '') {
        return next(new Error('Please ensure a valid Remittance Reference ID is generated for LayAway Remittance'));
    }
    next();
});

//Pre-save hook for handling remittance updates and price adjustments
RemittanceLayAwayPOSchema.pre<IRemittanceLayAwayPO>('save', async function (next) {
    try {
      if (this.remittanceForWhichLayAwayPORefID) {
        const layAwayPO = await LayAwayPurchaseOrder.findById(this.remittanceForWhichLayAwayPORefID).exec();
        if (layAwayPO) {
          this.remittanceForWhichLayAwayPurchaseOrderID = layAwayPO.layAwayPurchaseOrderId;
          this.remittanceForWhichActiveSubscriberID = layAwayPO.layAwayPOrderForActiveSubscriberID
          this.remittanceActiveUserFullName = layAwayPO.layAwayPOrderUserProfileFullName;
          this.remittancePOPhoneNo = layAwayPO.layAwayPOrderUserProfilePhoneNo;
  
          let remittanceDueOpeningAmount = 0;
          let remittanceDueBalance = 0;
          let totalRemittanceMadeSoFar = 0;
  
          const lastRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0];
          remittanceDueOpeningAmount = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
  
          //Calculate total remittance excluding current one to avoid double counting
          totalRemittanceMadeSoFar = (layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO.reduce((acc, curr) => acc + curr.remittedAmountOnLayAwayPO, 0) || 0);
  
          remittanceDueBalance = remittanceDueOpeningAmount + this.remittanceAmount_CR;
          totalRemittanceMadeSoFar += this.remittanceAmount_CR; // Now includes current remittance
  
          const lastPriceReverseAlert = layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.slice(-1)[0];
          
          if (lastPriceReverseAlert) {
            const priceChangeHandled = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.some(
              (entry) =>
                entry.remitDateOnLayAwayPO.getTime() === new Date(lastPriceReverseAlert.layAwayPurchaseOrderReverseDate).getTime() &&
                entry.priceAdjustmentAppliedOnLayAwayPO === true
            );
  
            if (new Date(lastPriceReverseAlert.layAwayPurchaseOrderReverseDate).getTime() > new Date(lastRemittance?.remitDateOnLayAwayPO).getTime() && !priceChangeHandled)
             {
              const newEndingBalanceAfterLastRemittance = remittanceDueBalance + (lastPriceReverseAlert.layAwayPurchaseOrderReverseNewPriceAlert - lastPriceReverseAlert.layAwayPurchaseOrderReverseOldPrice);
  
              //Ensure new ending balance doesn't exceed 0
              const cappedEndingBalance = Math.min(0, newEndingBalanceAfterLastRemittance);
  
              const newRemittanceEntry: IRemittanceBalanceToBePaidHistory = {
                remitDateOnLayAwayPO: lastPriceReverseAlert.layAwayPurchaseOrderReverseDate,
                remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
                remittanceUpdateRemarksOnLayAwayPO:`Balance Adjustment Due to Price Change: ${layAwayPO.layAwayPurchaseOrderIntentItemCode} || ${layAwayPO.layAwayPurchaseOrderIntentItemName}`,
                remittedAmountCROnLayAwayPO: 0,
                endingBalanceAfterLastRemittance: cappedEndingBalance,
                priceAdjustmentApplied: true,
                isRemittanceAfterPriceChange: true,
                priceChangeOnLayAwayPODate: '',
                isRemittanceAfterPriceChangeOnLayAwayPO: false,
                priceAdjustmentAppliedOnLayAwayPO: false
              };
              layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push(newRemittanceEntry);
            } else {
              //Check for overpayment
              const newEndingBalance = remittanceDueBalance;
              if (newEndingBalance > 0) {
                const requiredPayment = newEndingBalance;
                return next(new Error(`Overpayment Detected. Please Remit Payment Less Than ${requiredPayment}`));
              }
              
              layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
                remitDateOnLayAwayPO: this.createdAt,
                remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
                remittanceUpdateRemarksOnLayAwayPO: `Remittance for Lay Away Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
                remittedAmountCROnLayAwayPO: this.remittanceAmount_CR,
                endingBalanceAfterLastRemittanceOnLayAwayPO: Math.min(0, remittanceDueBalance), // Ensure ending balance is non-positive
                priceAdjustmentAppliedOnLayAwayPO: false,
                isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
                priceChangeOnLayAwayPODate: ''
              });
            }
          } else {
            // Check for overpayment
            const newEndingBalance = remittanceDueBalance;
            if (newEndingBalance > 0) {
              const requiredPayment = newEndingBalance;
              return next(new Error(`Overpayment Detected. Please Remit Less Payment Less Than ${requiredPayment}`));
            }
  
            layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
              remitDateOnLayAwayPO: this.createdAt,
              remittanceExpectedBalToBePaidOnLayAwayPO: remittanceDueOpeningAmount,
              remittanceUpdateRemarksOnLayAwayPO: `Remittance For LayAway Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
              remittedAmountCROnLayAwayPO: this.remittanceAmount_CR,
              endingBalanceAfterLastRemittanceOnLayAwayPO: Math.min(0, remittanceDueBalance), // Ensure ending balance is non-positive
              priceAdjustmentAppliedOnLayAwayPO: false,
              isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
              priceChangeOnLayAwayPODate: ''
            });
          }
  
          layAwayPO.TotalRemittanceMadeSoFarOnLayAwayPO.push({
            remittedDateOnLayAwayPO: this.createdAt,
            remittedAmountOnLayAwayPO: this.remittanceAmount_CR,
            remittedRemarksOnLayAwayPO: `Payment Received For LayAway Purchase Order ID: ${layAwayPO.layAwayPurchaseOrderId}`,
            TotalPaymentsMadeSoFarOnLayAwayPO: totalRemittanceMadeSoFar.toFixed(2),
            remitDateOnLayAwayPO: ''
          });
          await layAwayPO.save();
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  });

//Pre-save to ensure its the server dates that are used & not client dates
RemittanceLayAwayPOSchema.pre<IRemittanceLayAwayPO>('save', function (next) {
  this.createdAt = new Date();
  this.remittanceDate = new Date();
  this.lastUpdatedAt = new Date();
  next();
});

//Create & Export the Model
const RemittanceOnLayAwayPO = mongoose.model<IRemittanceLayAwayPO>('RemittanceOnLayAwayPO', RemittanceLayAwayPOSchema);
export {RemittanceOnLayAwayPO, IRemittanceLayAwayPO};
