import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';
import {CallbackError} from 'mongoose';

import {AccountHolder, IAccountHolder} from "./accountHolder.model.js"
import {ActiveUser, IActiveUser} from "./activeUser.model.js"
import {SubscriptionType, ISubscriptionType} from "./subscriptionType.model.js"
import {ItemInformation, IItemInformation} from "./itemInformation.model.js"
import {UpdateItemPrice} from './updateItemPrice.model.js';
import {Remittance, IRemittance} from './remittance.model.js';
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';


// Function to generate a 9-digit short ID starting from 1000200010
function generatePOrderShortId(): string {
    const min: number = 1000200010;
    const max: number = 9999910000; // Maximum value for the 9-digit number starting from 1000200010
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10,'0'); // Ensure the ID is 10 digits long
}
console.log(generatePOrderShortId())

interface IPriceChangeOnPOHistoryDetails {
    priceChangeOnPODate?: Date;
    priceChangeOnPORemarks?: string;
    newPriceAmountOnPO?: number;
}

interface IPurchaseOrderPriceReverseAlertDetails {
    purchaseOrderReverseDate?: Date;
    purchaseOrderReverseNewPriceAlertRemarks?: string;
    purchaseOrderReverseNewPriceAlert?: number;
}

interface IRemittanceUpdatesHistory{
    remitDateOnPO?: Date;
    remittanceExpectedBalToBePaidOnPO?: number;
    remittanceUpdateRemarksOnPO?: string;
    remittedAmountCROnPO?: number;
    endingBalanceAfterLastRemittance?: number;
}

// Define the interface for PurchaseOrder
interface IPurchaseOrder extends Document {
    //Timestamps
    purchaseOrderId:string;
    createdAt: Date;
    pOrderForActiveUserRefID: mongoose.Types.ObjectId;
    pOrderForActiveUserID: string;
    pOrderUserProfileFullName: string;
    pOrderUserProfilePhoneNo: string;
    pOrderUserProfileEmail: string;
    purchaseOrderIntent: mongoose.Types.ObjectId;
    purchaseOrderIntentItemCode: string;
    purchaseOrderIntentItemName: string;
    purchaseOrderIntentDesc: string;
    purchaseOrderAssetSubscType: mongoose.Types.ObjectId;
    //Expected Price To Be Paid on PO (BalanceToBePaidOnPO)
    PriceChangeOnPOHistoryDetails:IPriceChangeOnPOHistoryDetails[];
    purchaseOrderCurrentPrice: number;
    purchaseOrderNewPriceAlert: number;
    //PurchaseOrder Price Reversal Alert
    purchaseOrderPriceReverseAlertDetails:IPurchaseOrderPriceReverseAlertDetails[];
    remittanceUpdateDetails:IRemittanceUpdatesHistory[];
    totalRemittanceMadeSoFar: number;
    lastUpdatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>({
    purchaseOrderId: {type:String, default:generatePOrderShortId, unique:true},
    //Timestamps
    createdAt: {type:Date, default:Date.now},
    pOrderForActiveUserRefID: {type:Schema.Types.ObjectId, ref:'ActiveUser', required:true},
    pOrderForActiveUserID: {type:String},
    pOrderUserProfileFullName: {type:String},
    pOrderUserProfilePhoneNo: {type:String},
    pOrderUserProfileEmail: {type:String},
    purchaseOrderIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
    purchaseOrderIntentItemCode: {type:String},
    purchaseOrderIntentItemName: {type:String},
    purchaseOrderIntentDesc: {type:String},
    purchaseOrderAssetSubscType: {type:Schema.Types.ObjectId, ref:'SubscriptionType', required:true},
    //Expected Price To Be Paid on PO (BalanceToBePaidOnPO)
    PriceChangeOnPOHistoryDetails:[{
        priceChangeOnPODate: {type:Date},
        priceChangeOnPORemarks: {type:String},
        newPriceAmountOnPO: {type:Number}
    }],
    purchaseOrderCurrentPrice: {type:Number},
    purchaseOrderNewPriceAlert: {type:Number},
    //PurchaseOrder Price Reversal Alert
    purchaseOrderPriceReverseAlertDetails:[{
        purchaseOrderReverseDate: {type:Date},
        purchaseOrderReverseNewPriceAlertRemarks: {type:String},
        purchaseOrderReverseNewPriceAlert: {type:Number}
    }],
    //Remittance Updates History
    remittanceUpdateDetails:[{
        remitDateOnPO: Date,
        remittanceExpectedBalToBePaidOnPO: {type:Number},
        remittanceUpdateRemarksOnPO: {type:String},
        remittedAmountCROnPO: {type:Number},
        endingBalanceAfterLastRemittance: {type:Number}
    }],
    totalRemittanceMadeSoFar: {type:Number},
    lastUpdatedAt: {type:Date, default:Date.now}
});

// Define the Pre-save Hook to set the pOrderUserProfileEmail, pOrderUserProfileFName, pOrderUserProfileLName based on the selected pOrderForActiveUserID
purchaseOrderSchema.pre<IPurchaseOrder>('save', async function (next) {
  try {
      if (this.pOrderForActiveUserRefID) {
          const personaldetailsonPO = await ActiveUser.findById(this.pOrderForActiveUserRefID);
          if (personaldetailsonPO) {
            this.pOrderForActiveUserID = personaldetailsonPO.activeUserID;
            this.pOrderUserProfileFullName = personaldetailsonPO.activeUserFirstName + ' ' + personaldetailsonPO.activeUserLastName;
            this.pOrderUserProfilePhoneNo = personaldetailsonPO.activeUserPhoneNo;
            this.pOrderUserProfileEmail = personaldetailsonPO.activeUserEmail;
          }
      }
      next();
  } catch (error) {
      next(error as CallbackError);
  }
});


// Define the Pre-save Hook to do the following:
purchaseOrderSchema.pre<IPurchaseOrder>('save', async function (next) {
  try {
      if (this.purchaseOrderIntent) {
        const itemDetails = await ItemInformation.findById(this.purchaseOrderIntent);

        // 1. Set the purchaseOrderIntentItemCode, purchaseOrderIntentItemName, and purchaseOrderIntentDesc based on the selected purchaseOrderIntent
        if (itemDetails) {
            this.purchaseOrderIntentItemCode = itemDetails.itemInformationCode;
            this.purchaseOrderIntentItemName = itemDetails.itemInformationName;
            this.purchaseOrderIntentDesc = itemDetails.itemInformationDescription;
          }

        //2. Get the First Price on PO based on the updateItemPriceDetails at the time of booking the PO
        const firstPriceOnPO = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];
          // Set purchaseOrderCurrentPrice based on the latest price update
            this.purchaseOrderCurrentPrice = firstPriceOnPO?.itemInformationCurrentMktPrice || itemDetails.itemInformationMktStartPrice;
              // Set other properties as needed

          // Initial balance calculation and entry
        if (this.PriceChangeOnPOHistoryDetails.length === 0) {
            const firstBalanceOnPO: IPriceChangeOnPOHistoryDetails = {
              priceChangeOnPODate: this.createdAt,
              priceChangeOnPORemarks: 'Opening Balance | Purchase Order ID: ' + this.purchaseOrderId + ' ' + '(Item ID:' + this.purchaseOrderIntentItemCode  + ' || ' + this.purchaseOrderIntentItemName + ')',
              newPriceAmountOnPO: this.purchaseOrderCurrentPrice
            };
            this.PriceChangeOnPOHistoryDetails.push(firstBalanceOnPO);

        //3. Set the purchaseOrderOpeningPrice based on the latest itemInformationCurrentMktPrice from itemInformationPriceUpdateDetails
        if(itemDetails.itemInformationPriceUpdateDetails && itemDetails.itemInformationPriceUpdateDetails.length > 0) {
            const POPriceAtBooking = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];
            if (POPriceAtBooking) {
              this.purchaseOrderCurrentPrice = POPriceAtBooking.itemInformationCurrentMktPrice;
            } else {
              // Handle case where there are no price updates (optional)
              console.warn("ItemInformation", itemDetails._id, "has no price updates");
            }
          }                              
          else {
            // Handle case where itemInformationPriceUpdateDetails is empty or undefined
            console.warn("ItemInformation", itemDetails._id, "has no price update details");
          }

          //4. Set the purchaseOrderNewPriceAlert based on the latest price update
            if (itemDetails.itemInformationPriceUpdateDetails && itemDetails.itemInformationPriceUpdateDetails.length > 0) {
            // Get the last updated price from itemInformationPriceUpdateDetails
            const latestPriceUpdate = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];

            if (latestPriceUpdate) {
              this.purchaseOrderNewPriceAlert = latestPriceUpdate.itemInformationCurrentMktPrice;
            } else {
              // Handle case where there are no price updates (optional)
              console.warn("ItemInformation", itemDetails._id, "has no price updates");
            }

  } else {
            // Handle case where itemInformationPriceUpdateDetails is empty or undefined
            console.warn("ItemInformation", itemDetails._id, "has no price update details");
        }
    }
  }
      next();
    } catch (error) {
      next(error as CallbackError);
    }
  });

//Define the pre-save to set the totalRemittanceMadeSoFar based on all the remittances paid so far
purchaseOrderSchema.pre<IPurchaseOrder>('save', async function (next) {
  try {
      if (this.remittanceUpdateDetails && this.remittanceUpdateDetails.length > 0) {
          this.totalRemittanceMadeSoFar = this.remittanceUpdateDetails.reduce((totalRemittance, remittance) => totalRemittance + remittance.remittedAmountCROnPO, 0);
      }
      next();
  } catch (error) {
      next(error as CallbackError);
  }
});

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
export {PurchaseOrder, IPurchaseOrder};