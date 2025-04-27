import mongoose, {Schema, Document, CallbackError} from 'mongoose';
import generateCombinedPOShortId from '../utils/generateCombinedPOShortId.util.js'
import {AccountSubscriber, IAccountSubscriber} from './accountSubscriber.model.js';
import {SubscriptionType, ISubscriptionType} from './subscriptionType.model.js';
import {ItemInformation, IItemInformation} from './itemInformation.model.js';
import {UpdateItemPrice} from './updateItemPrice.model.js';
import {RemittanceOnLayAwayPO, IRemittanceLayAwayPO} from './remittanceOnLayAwayPO.model.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
import {ActiveSubscriber} from './activeSubscriber.model.js';
import {UOM} from './uom.model.js';

//Interface for PriceChangeonPurchaseOrderHistory Details
interface IPriceChangeOnLayAwayPOHistoryDetails {
  priceChangeOnLayAwayPODate?: Date;
  priceChangeOnLayAwayPORemarks?: string;
  newPriceAmountOnLayAwayPO?: number;
  priceAdjustmentAppliedOnLayAwayPO?: boolean;
};

//Interface for TotalRemittancesMadeSoFar Details
interface ITotalRemittancesMadeSoFarOnLayAwayPO {
  remitDateOnLayAwayPO: string | number | Date;
  remittedDateOnLayAwayPO?: Date;
  remittedAmountOnLayAwayPO?: number;
  remittedRemarksOnLayAwayPO?: string;
  TotalPaymentsMadeSoFarOnLayAwayPO?: string;
};

//Interface for PurchaseOrderPriceReverseAlert Details
interface ILayAwayPurchaseOrderPriceReverseAlertDetails {
  layAwayPurchaseOrderReverseOldPrice: number;
  layAwayPurchaseOrderReversalID?: string;
  layAwayPurchaseOrderReverseDate?: Date;
  layAwayPurchaseOrderReverseNewPriceAlertRemarks?: string;
  layAwayPurchaseOrderReverseNewPriceAlert?: number;
};

//Interface for RemittanceBalanceToBePaidHistory Details
interface IRemittanceBalanceToBePaidOnLayAwayPOHistory {
  priceChangeOnLayAwayPODate: string | number | Date;
  isRemittanceAfterPriceChangeOnLayAwayPO: unknown;
  remitDateOnLayAwayPO?: Date;
  remittanceExpectedBalToBePaidOnLayAwayPO?: number;
  remittanceUpdateRemarksOnLayAwayPO?: string;
  remittedAmountCROnLayAwayPO?: number;
  endingBalanceAfterLastRemittanceOnLayAwayPO?: number;
  priceAdjustmentAppliedOnLayAwayPO: boolean;
};

//Interface for Transformed Remittance Details
export interface ITransformedRemittance {
  TotalPaymentsMadeSoFarOnLayAwayPO: string;
  remittanceDateOnLayAwayPO?: Date;
  remittanceAmountOnLayAwayPO: number;
  remittanceRemarksOnLayAwayPO: string;
};

//Interface for PurchaseOrderModel Details
interface ILayAwayPurchaseOrder extends Document {
  remittedAmountCROnLayAwayPO: number;
  remittanceEvents(remittanceEvents:any): unknown;
  startViewTransition?: unknown;
  layAwayPurchaseOrderId: string;
  createdAt: Date;
  layAwayPOrderForActiveSubscriberRefID: mongoose.Types.ObjectId;
  layAwayPOrderForActiveSubscriberID: string;
  layAwayPOrderUserProfileFullName: string;
  layAwayPOrderUserProfilePhoneNo: string;
  layAwayPOrderUserProfileEmail: string;
  layAwayPOrderUserDeliveryAddress: string;
  layAwayPurchaseOrderIntent: mongoose.Types.ObjectId;
  layAwayPurchaseOrderIntentID: string;
  layAwayPurchaseOrderIntentItemCode: string;
  layAwayPurchaseOrderIntentItemName: string;
  layAwayPurchaseOrderIntentDesc: string;
  layAwayPurchaseOrderNoOfUnitBought: number;
  layAwayPurchaseOrderUnitOfMeasureRefID: mongoose.Types.ObjectId;
  layAwayPurchaseOrderUnitOfMeasure: string;
  layAwayPurchaseOrderUnitPrice: number;
  layAwayPurchaseOrderTotalStartPrice: number;
  layAwayPurchaseOrderAssetSubscTypeRefID: mongoose.Types.ObjectId;
  layAwayPurchaseOrderAssetSubscType: string;
  layAwayPurchaseOrderNewPriceAlert: number;
  PriceChangeOnLayAwayPOHistoryDetails?: IPriceChangeOnLayAwayPOHistoryDetails[];
  PriceReverseAlertDetailsOnLayAwayPO: ILayAwayPurchaseOrderPriceReverseAlertDetails[];
  TotalRemittanceMadeSoFarOnLayAwayPO?: ITotalRemittancesMadeSoFarOnLayAwayPO[];
  RemittanceBalanceToBePaidDetailsOnLayAwayPO?: IRemittanceBalanceToBePaidOnLayAwayPOHistory[];
  lastUpdatedAt: Date;
};

//PurchaseOrderSchema for Mongoose
const LayAwayPurchaseOrderSchema = new Schema<ILayAwayPurchaseOrder>({
  layAwayPurchaseOrderId: {type:String, default:generateCombinedPOShortId, unique:true},
  layAwayPOrderForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
  layAwayPOrderForActiveSubscriberID: {type:String},
  layAwayPOrderUserProfileFullName: {type:String},
  layAwayPOrderUserProfilePhoneNo: {type:String},
  layAwayPOrderUserProfileEmail: {type:String},
  layAwayPOrderUserDeliveryAddress: {type:String},
  layAwayPurchaseOrderIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
  layAwayPurchaseOrderIntentID: {type:String},
  layAwayPurchaseOrderIntentItemCode: {type:String},
  layAwayPurchaseOrderIntentItemName: {type:String},
  layAwayPurchaseOrderIntentDesc: {type:String},
  layAwayPurchaseOrderNoOfUnitBought: {type:Number, required:true},
  layAwayPurchaseOrderUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
  layAwayPurchaseOrderUnitOfMeasure: {type:String},
  layAwayPurchaseOrderUnitPrice: {type:Number},
  layAwayPurchaseOrderTotalStartPrice: {type:Number},
  layAwayPurchaseOrderAssetSubscTypeRefID: {type:Schema.Types.ObjectId, ref:'SubscriptionType', required:true},
  layAwayPurchaseOrderAssetSubscType: {type:String},
  layAwayPurchaseOrderNewPriceAlert: {type:Number},
  PriceChangeOnLayAwayPOHistoryDetails: [{
    priceChangeOnLayAwayPODate: {type:Date, default:Date.now},
    priceChangeOnLayAwayPORemarks: {type:String},
    newPriceAmountOnLayAwayPO: {type:Number},
    priceAdjustmentAppliedOnLayAwayPO: {type:Boolean, default:false}
  }],
  PriceReverseAlertDetailsOnLayAwayPO: [{
    layAwayPurchaseOrderReverseOldPrice: {type:Number},
    layAwayPurchaseOrderReversalID: {type:String, default:generateCombinedPOShortId},
    layAwayPurchaseOrderReverseDate: {type:Date, default:Date.now},
    layAwayPurchaseOrderReverseNewPriceAlertRemarks: {type:String},
    layAwayPurchaseOrderReverseNewPriceAlert: {type:Number}
  }],
  TotalRemittanceMadeSoFarOnLayAwayPO: [{
    remitDateOnLayAwayPO: {type:Date, default:Date.now},
    remittedDateOnLayAwayPO: {type:Date},
    remittedAmountOnLayAwayPO: {type:Number},
    remittedRemarksOnLayAwayPO: {type:String},
    TotalPaymentsMadeSoFarOnLayAwayPO: {type:String}
  }],
  RemittanceBalanceToBePaidDetailsOnLayAwayPO: [{
    priceChangeOnLayAwayPODate: {type:Date, default:Date.now},
    isRemittanceAfterPriceChangeOnLayAwayPO: {type:Boolean},
    remitDateOnLayAwayPO: {type:Date},
    remittanceExpectedBalToBePaidOnLayAwayPO: {type:Number},
    remittanceUpdateRemarksOnLayAwayPO: {type:String},
    remittedAmountCROnLayAwayPO: {type:Number},
    endingBalanceAfterLastRemittanceOnLayAwayPO: {type:Number},
    priceAdjustmentAppliedOnLayAwayPO: {type:Boolean}
  }],
  createdAt: {type:Date, default:Date.now, required:true},  
  lastUpdatedAt: {type:Date, default:Date.now, required:true}
});


//1.Middleware to ensure Purchase Order ID is generated before saving the document
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', function(next) {
  if (!this.layAwayPurchaseOrderId || this.layAwayPurchaseOrderId.trim() === '') {
    return next(new Error('Lay Away Purchase Order ID is required. Please ensure a valid Lay Away Purchase Order ID is generated'));
  }
  next();
});

//2.Middleware to handling User Profile Details
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function(next) {
  try {
    if (this.layAwayPOrderForActiveSubscriberRefID) {
      const userProfile = await ActiveSubscriber.findById(this.layAwayPOrderForActiveSubscriberRefID).exec();
      if (userProfile) {
        this.layAwayPOrderForActiveSubscriberID = userProfile.activeSubscriberID.toString();
        this.layAwayPOrderUserProfileFullName = userProfile.activeSubscriberFirstName + ' ' + userProfile.activeSubscriberMiddleName + ' ' + userProfile.activeSubscriberLastName;
        this.layAwayPOrderUserProfilePhoneNo = userProfile.activeSubscriberPhoneNo;
        this.layAwayPOrderUserProfileEmail = userProfile.activeSubscriberEmail;
        this.layAwayPOrderUserDeliveryAddress = userProfile.activeSubscriberAssetDeliveryAddress;
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//3.Middleware for handling Item Information Details
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function(next) {
  try {
      if (this.layAwayPurchaseOrderIntent) {
      const itemDetails = await ItemInformation.findById(this.layAwayPurchaseOrderIntent);
      if (itemDetails) {
        this.layAwayPurchaseOrderIntentID = itemDetails.itemInformationID;
        this.layAwayPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
        this.layAwayPurchaseOrderIntentItemName = itemDetails.itemInformationName;
        this.layAwayPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
        //set the purchaseOrderNewPriceAlert to the itemInformationPriceUpdateDetails:itemInformationCurrentMktPrice if it exists
        if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
          const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
          this.layAwayPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
        }
        //set the purchaseOrderUnitPrice to the itemInformationCurrentMktPrice if it exists
        this.layAwayPurchaseOrderUnitPrice = this.layAwayPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
        this.layAwayPurchaseOrderTotalStartPrice = this.layAwayPurchaseOrderNoOfUnitBought * this.layAwayPurchaseOrderUnitPrice;
      }
      next();
    }
  }
  catch (error) {
    next(error as CallbackError);
  }
});

//4.Middleware for handling Subscription Type Details
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function(next) {
  try {
    if (this.layAwayPurchaseOrderAssetSubscTypeRefID) {
      const subscriptionDetails = await SubscriptionType.findById(this.layAwayPurchaseOrderAssetSubscTypeRefID);
      if (subscriptionDetails) {
        this.layAwayPurchaseOrderAssetSubscType = subscriptionDetails.subscTypeName;
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//5. Middleware to set the layAwayPurchaseOrderUnitOfMeasure based on the layAwayPurchaseOrderUnitOfMeasureRefID
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function(next) {
  try {
    if (this.layAwayPurchaseOrderUnitOfMeasureRefID) {
      const uomDetails = await UOM.findById(this.layAwayPurchaseOrderUnitOfMeasureRefID);
      if (uomDetails) {
        this.layAwayPurchaseOrderUnitOfMeasure = uomDetails.unitMeaseureName;
      }
    }
    next();
  }
  catch (error) {
    next(error as CallbackError);
  }
});

//6.Once a PO is booked, the PriceChangeOnPOHistoryDetails array is updated with the Start balance which will be the StartPrice & the RemittanceBalanceToBePaidDetails array 
// is updated with the first remittance entry which will be 0
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function (next) {
  try {
    if (this.layAwayPurchaseOrderIntent) {
      //Retrieve item details for the purchase order
      const itemDetails = await ItemInformation.findById(this.layAwayPurchaseOrderIntent);
      if (itemDetails) {
        this.layAwayPurchaseOrderIntentID = itemDetails.itemInformationID;
        this.layAwayPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
        this.layAwayPurchaseOrderIntentItemName = itemDetails.itemInformationName;
        this.layAwayPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
        this.layAwayPurchaseOrderUnitPrice = this.layAwayPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
        this.layAwayPurchaseOrderTotalStartPrice = this.layAwayPurchaseOrderNoOfUnitBought * this.layAwayPurchaseOrderUnitPrice;
      }
      //Ensure PriceChangeOnPOHistoryDetails has only one initial entry
      if (this.PriceChangeOnLayAwayPOHistoryDetails.length === 0) {
        this.PriceChangeOnLayAwayPOHistoryDetails.push({
          priceChangeOnLayAwayPODate: new Date(),
          priceChangeOnLayAwayPORemarks:`Start Balance | Item ID:${this.layAwayPurchaseOrderIntentID} || ${this.layAwayPurchaseOrderIntentItemCode} || ${this.layAwayPurchaseOrderIntentItemName} || ${this.layAwayPurchaseOrderNoOfUnitBought}${this.layAwayPurchaseOrderUnitOfMeasure} @${formatCurrency(this.layAwayPurchaseOrderUnitPrice)} each`,
          newPriceAmountOnLayAwayPO: this.layAwayPurchaseOrderTotalStartPrice,
          priceAdjustmentAppliedOnLayAwayPO: false
        });
      }
      //Ensure remittanceBalanceToBePaidDetails is initialized only once
      if (this.PriceChangeOnLayAwayPOHistoryDetails.length > 0 && this.RemittanceBalanceToBePaidDetailsOnLayAwayPO.length === 0) {
        const firstPriceChange = this.PriceChangeOnLayAwayPOHistoryDetails[0];
        const firstPriceChangeAmount = firstPriceChange.newPriceAmountOnLayAwayPO || 0;

        const layAwayPurchaseOrderId = this.layAwayPurchaseOrderId;
        const expectedBalToBePaidOnPO = -firstPriceChangeAmount; //Set the initial expected balance based on the first price change amount
        this.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
          remitDateOnLayAwayPO: new Date(),
          remittanceExpectedBalToBePaidOnLayAwayPO: expectedBalToBePaidOnPO || 0,
          remittanceUpdateRemarksOnLayAwayPO: `Expected Amount To Be Remitted for Purchase Order ID: ${layAwayPurchaseOrderId}`,
          remittedAmountCROnLayAwayPO: 0,
          endingBalanceAfterLastRemittanceOnLayAwayPO: expectedBalToBePaidOnPO,
          priceAdjustmentAppliedOnLayAwayPO: false,
          isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
          priceChangeOnLayAwayPODate: ''
        });
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//Pre-save hook to layAwayPurchaseOrderUnitOfMeasure based on the layAwayPurchaseOrderUnitOfMeasureRefID
LayAwayPurchaseOrderSchema.pre<ILayAwayPurchaseOrder>('save', async function(next) {
  try {
    if (this.layAwayPurchaseOrderUnitOfMeasureRefID) {
      const uomDetails = await UOM.findById(this.layAwayPurchaseOrderUnitOfMeasureRefID);
      if (uomDetails) {
        this.layAwayPurchaseOrderUnitOfMeasure = uomDetails.unitMeaseureName;
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//Register the Schema as a model. Export the LayAwayPurchaseOrder Model
const LayAwayPurchaseOrder = mongoose.model<ILayAwayPurchaseOrder>('LayAwayPurchaseOrder', LayAwayPurchaseOrderSchema);
export {LayAwayPurchaseOrder, ILayAwayPurchaseOrder, IPriceChangeOnLayAwayPOHistoryDetails, 
        ILayAwayPurchaseOrderPriceReverseAlertDetails, ITotalRemittancesMadeSoFarOnLayAwayPO, 
        IRemittanceBalanceToBePaidOnLayAwayPOHistory
};





