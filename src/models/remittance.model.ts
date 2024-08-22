import mongoose, {Schema, Document, Model, model, CallbackError} from 'mongoose';
import {IPurchaseOrder, PurchaseOrder } from './purchaseOrder.model.js';
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';

// Function to generate a 15-digit short ID
function generateRemittanceShortId(): string {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
console.log(generateRemittanceShortId())

// Define the interface for Remittance
interface IRemittance extends Document{
    remittanceForWhichPurchaseOrderRefID: mongoose.Types.ObjectId;
    createdAt: Date;
    remittanceDate: Date;
    remittanceReferenceID: string;
    remittanceForWhichPurchaseOrderID: string;
    remittanceForWhichActiveUserID: string;
    remittanceActiveUserFullName: string;
    remittancePOPhoneNo: string;
    remittanceDueOpeningAmount: number;
    remittanceAmount_CR: number,
    remittanceDueBalance: number;
    remittancePaymentRefClass: mongoose.Types.ObjectId;
    remittancePaymentClass:string;
    remittanceRemarks: string,
    lastUpdatedAt: Date;
};

const remittanceSchema = new Schema<IRemittance>({
    remittanceForWhichPurchaseOrderRefID: {type:Schema.Types.ObjectId, ref:'PurchaseOrder', required:true},
    createdAt: {type:Date},
    remittanceDate: Date,
    remittanceReferenceID: {type:String, default:generateRemittanceShortId, unique:true},
    remittanceForWhichPurchaseOrderID: {type:String},
    remittanceForWhichActiveUserID: {type:String},
    remittanceActiveUserFullName: {type:String},
    remittancePOPhoneNo: {type:String},
    remittanceDueOpeningAmount: {type:Number},
    remittanceAmount_CR: {type:Number},
    remittanceDueBalance: {type:Number},
    remittancePaymentRefClass: {type:Schema.Types.ObjectId, ref:'PaymentClass', required:true},
    remittancePaymentClass: {type:String},
    remittanceRemarks: {type:String},
    lastUpdatedAt: {type:Date},
});

//Pre-save hook to set the remittancePaymentClass based on the remittancePaymentRefClass
remittanceSchema.pre<IRemittance>('save', async function(next){
    try{
        if(this.remittancePaymentRefClass){
            const remitPaymentClass = await PaymentClass.findById(this.remittancePaymentRefClass);
            if(remitPaymentClass){
                this.remittancePaymentClass = remitPaymentClass.paymentClassName;
            }
        }
        next();
    } catch(error){
        next(error as CallbackError);
    }
});

// Pre-save hook to calculate remittanceDueBalance and update the PurchaseOrder
remittanceSchema.pre<IRemittance>('save', async function (next) {
    try {
      if (this.remittanceForWhichPurchaseOrderRefID) {
        const purchaseOrder = await PurchaseOrder.findById(this.remittanceForWhichPurchaseOrderRefID).exec();
  
        if (purchaseOrder) {
          this.remittanceForWhichPurchaseOrderID = purchaseOrder.purchaseOrderId;
          this.remittanceForWhichActiveUserID = purchaseOrder.pOrderForActiveUserID;
          this.remittanceActiveUserFullName = purchaseOrder.pOrderUserProfileFullName;
          this.remittancePOPhoneNo = purchaseOrder.pOrderUserProfilePhoneNo;
  
          // Calculate opening balance based on the first newPriceAmountOnPO
          const initialOpeningBalance = -(purchaseOrder.PriceChangeOnPOHistoryDetails[0]?.newPriceAmountOnPO || 0);
  
          // Determine if it's the first remittance
          const isFirstRemittance = !purchaseOrder.remittanceUpdateDetails || purchaseOrder.remittanceUpdateDetails.length === 0;
  
          let openingBalance: number;
          if (isFirstRemittance) {
            openingBalance = initialOpeningBalance;
          } else {
            openingBalance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1].endingBalanceAfterLastRemittance;
          }
  
          this.remittanceDueOpeningAmount = openingBalance;
          console.log('Opening Balance:', openingBalance);
  
          // Calculate remittanceDueBalance
          let remittanceDueBalance: number;
          if (isFirstRemittance) {
            remittanceDueBalance = openingBalance + this.remittanceAmount_CR;
          } else {
            const previousRemittance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1];
            remittanceDueBalance = previousRemittance.endingBalanceAfterLastRemittance + this.remittanceAmount_CR;
          }
  
          // Check for NaN before assigning
          if (isNaN(remittanceDueBalance)) {
            console.error('Error calculating remittanceDueBalance:', { openingBalance, thisRemittanceAmountCR:this.remittanceAmount_CR });
            // Handle the error, e.g., throw an error or log a warning
            return next(new Error('Remittance due balance calculation error'));
          }
  
          this.remittanceDueBalance = remittanceDueBalance;
          console.log('Remittance Due Balance:', remittanceDueBalance);
  
          // Update next remittance's opening balance (adjustment)
          if (purchaseOrder.remittanceUpdateDetails && purchaseOrder.remittanceUpdateDetails.length > 0) {
            const lastRemittance = purchaseOrder.remittanceUpdateDetails[purchaseOrder.remittanceUpdateDetails.length - 1];
            // Only set remittanceExpectedBalToBePaidOnPO for the first remittance
            if (isFirstRemittance) {
              lastRemittance.remittanceExpectedBalToBePaidOnPO = remittanceDueBalance;
            }
          }
  
          // Add remittance update to purchase order
          if (!purchaseOrder.remittanceUpdateDetails) {
            purchaseOrder.remittanceUpdateDetails = [];
          }
          purchaseOrder.remittanceUpdateDetails.push({
            remitDateOnPO: this.remittanceDate,
            remittanceExpectedBalToBePaidOnPO: openingBalance, // Use openingBalance for all remittances
            remittanceUpdateRemarksOnPO: `${this.remittancePaymentClass} || Remittance ID: ${this.remittanceReferenceID}`,
            remittedAmountCROnPO: this.remittanceAmount_CR,
            endingBalanceAfterLastRemittance: remittanceDueBalance,
          });
  
          await purchaseOrder.save();
        } else {
          console.error('Purchase Order not found for remittance: ', this.remittanceReferenceID);
        }
      }
      next();
    } catch (error) {
      next(error as CallbackError);
    }
  });

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const Remittance = mongoose.model<IRemittance>('Remittance', remittanceSchema);
export {Remittance, IRemittance};



