import mongoose, {Schema, Document, CallbackError} from 'mongoose';

import {ActiveSubscriber, IActiveSubscriber} from './activeSubscriber.model.js';
import {ItemInformation, IItemInformation} from './itemInformation.model.js';
//import {UpdateItemPrice, IUpdateItemPrice} from './updateItemPrice.model.js';

import generateCombinedPOShortId from '../utils/generateCombinedPOShortId.util.js'
import formatCurrency from '../utils/formatCurrency.utils.js';
import {UOM} from './uom.model.js';


//Interface for PriceChangeonPurchaseOrderHistory Details
interface IPriceChangeOnStandardPOHistoryDetails {
  priceChangeOnStandardPODate: Date;
  priceChangeOnStandardPORemarks: string;
  newUnitPriceAmountOnStandardPO: number;
  newTotalPriceAmountOnStandardPO: number;
  priceAdjustmentAppliedOnStandardPO: boolean;
  cumulativeBalance?: number; // Add cumulativeBalance property
}

//Interface for PurchaseOrderPriceReverseAlert Details
interface IPriceReverseAlertDetailsOnStandardPO {
  standardPOReverseDate: Date;
  standardPOReversalID: string;
  standardPOReverseOldPrice: number;
  standardPOReverseNewPriceAlertRemarks: string;
  standardPOReverseNewPriceAlert: number;
}
//Interface for RemittanceBalanceToBePaidHistory Details
interface IRemittanceBalanceToBePaidOnStandardPOHistory {
  priceChangeOnStandardPODate: Date;
  isRemittanceAfterPriceChangeOnStandardPO?: boolean;
  remitDateOnStandardPO: Date;
  remittanceExpectedBalToBePaidStandardPO: number;
  remittanceUpdateRemarksOnStandardPO: string;
  remittedAmountCROnStandardPO: number;
  endingBalanceAfterLastRemittanceOnStandardPO: number;
  priceAdjustmentAppliedOnStandardPO: boolean;
}
//Interface for TotalRemittancesMadeSoFar Details
interface ITotalRemittancesMadeSoFarOnStandardPO {
  remitDateOnStandardPO: string | number | Date;
  remittedDateOnStandardPO?: Date;
  remittedAmountOnStandardPO?: number;
  remittedRemarksOnStandardPO?: string;
  TotalPaymentsMadeSoFarOnStandardPO?: string;
  StandardPurchaseOrderItemsGrandTotal?: IStandardPurchaseOrderItemsGrandTotal[];
};
//Interface for Transformed Remittance Details
export interface ITransformedRemittanceOnStandardPO {
  TotalPaymentsMadeSoFarOnStandardPO: string;
  remittanceDateOnStandardPO?: Date;
  remittanceAmountOnStandardPO: number;
  remittanceRemarksOnStandardPO: string;
};
//Interface to calculate the cumulative balance of items in the standardPurchaseOrderItems
interface ICalculateCumulativeBalance {
  cumulativeBalance: number;
};
//Interface for the StandardPurchaseOrderItemsGrandTotal Detals
interface IStandardPurchaseOrderItemsGrandTotal {
  updatedAt?: Date; // Add updatedAt property
  standardPurchaseOrderItemsGrandTotal: number; 
};

//Interface for Standard Purchase Order Details
export interface IMultipleStandardPurchaseOrderIntent {
  standardPurchaseOrderDate: Date;
  standardPurchaseOrderCount: number;
  standardPurchaseOrderIntent: mongoose.Types.ObjectId;
  standardPurchaseOrderIntentID: string;
  standardPurchaseOrderIntentItemCode: string;
  standardPurchaseOrderIntentItemName: string;
  standardPurchaseOrderIntentDesc: string;
  standardPurchaseOrderNoOfUnitBought: number;
  standardPurchaseOrderUnitOfMeasureRefID: mongoose.Types.ObjectId;
  standardPurchaseOrderUnitOfMeasure: string;
  standardPurchaseOrderUnitPrice: number;
  standardPurchaseOrderTotalStartPrice: number;
  standardPurchaseOrderNewPriceAlert: number;
  PriceChangeOnStandardPOHistoryDetails: IPriceChangeOnStandardPOHistoryDetails[];
  PriceReverseAlertDetailsOnStandardPO: IPriceReverseAlertDetailsOnStandardPO[];
  StandardPurchaseOrderCumulativeBalance?: ICalculateCumulativeBalance[];
  StandardPurchaseOrderItemsGrandTotal?: IStandardPurchaseOrderItemsGrandTotal[];
  RemittanceBalanceToBePaidDetailsOnStandardPO: IRemittanceBalanceToBePaidOnStandardPOHistory[];
}

//----Interface for Standard Purchase Order Details--------------------------------------------------
interface IStandardPurchaseOrder extends Document {
  //remittedAmountCROnStandardPO: number;
  //remittanceEvents(remittanceEvents:any): unknown;
  //startViewTransition?: unknown;
  //SPO schema
  standardPurchaseOrderId: string;
  createdAt: Date;
  standardPOrderForActiveSubscriberRefID: mongoose.Types.ObjectId;
  standardPOrderForActiveSubscriberID: string;
  standardPOrderUserProfileFullName: string;
  standardPOrderUserProfilePhoneNo: string;
  standardPOrderUserProfileEmail: string;
  standardPOrderUserDeliveryAddress: string;
  standardPurchaseOrderAssetSubscType: string;
  StandardPurchaseOrderItems: IMultipleStandardPurchaseOrderIntent[];
  StandardPurchaseOrderCumulativeBalance?: ICalculateCumulativeBalance[];
  StandardPurchaseOrderItemsGrandTotal?: IStandardPurchaseOrderItemsGrandTotal[];
  TotalRemittanceMadeSoFarOnStandardPO: ITotalRemittancesMadeSoFarOnStandardPO[];
  lastUpdatedAt: Date; 
};

//StandardPurchaseOrder Schema for Mongoose
const StandardPurchaseOrderSchema = new Schema<IStandardPurchaseOrder>({
  standardPurchaseOrderId: {type:String, default:generateCombinedPOShortId, unique:true},
  createdAt: {type:Date, default:Date.now, required:true},
  standardPOrderForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
  standardPOrderForActiveSubscriberID: {type:String},
  standardPOrderUserProfileFullName: {type:String},
  standardPOrderUserProfilePhoneNo: {type:String},
  standardPOrderUserProfileEmail: {type:String},
  standardPOrderUserDeliveryAddress: {type:String},
  standardPurchaseOrderAssetSubscType: {type:String, default:'Outright Purchase'},
  StandardPurchaseOrderItems: [{
    standardPurchaseOrderCount: {type:Number},
      standardPurchaseOrderDate: {type:Date, required:true},
      standardPurchaseOrderIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
      standardPurchaseOrderIntentID: {type:String},
      standardPurchaseOrderIntentItemCode: {type:String},
      standardPurchaseOrderIntentItemName: {type:String},
      standardPurchaseOrderIntentDesc: {type:String},
      standardPurchaseOrderNoOfUnitBought: {type:Number, required:true},
      standardPurchaseOrderUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
      standardPurchaseOrderUnitOfMeasure: {type:String},
      standardPurchaseOrderUnitPrice: {type:Number},
      standardPurchaseOrderTotalStartPrice: {type:Number},
      standardPurchaseOrderNewPriceAlert: {type:Number},
      PriceChangeOnStandardPOHistoryDetails: [{
        priceChangeOnStandardPODate: {type:Date, default:Date.now},
        priceChangeOnStandardPORemarks: {type:String},
        newUnitPriceAmountOnStandardPO: {type:Number},
        newTotalPriceAmountOnStandardPO: {type:Number},
        priceAdjustmentAppliedOnStandardPO: {type:Boolean, default:false}
      }],
      PriceReverseAlertDetailsOnStandardPO: [{
        standardPOReverseDate: {type:Date, default:Date.now},
        standardPOReversalID: {type:String},
        standardPOReverseOldPrice: {type:Number},
        standardPOReverseNewPriceAlertRemarks: {type:String},
        standardPOReverseNewPriceAlert: {type:Number}
      }],
      RemittanceBalanceToBePaidDetailsOnStandardPO: [{
        priceChangeOnStandardPODate: {type:Date, default:Date.now},
        isRemittanceAfterPriceChangeOnStandardPO: {type:Boolean},
        remitDateOnStandardPO: {type:Date, default:Date.now},
        remittanceExpectedBalToBePaidStandardPO: {type:Number},
        remittanceUpdateRemarksOnStandardPO: {type:String},
        remittedAmountCROnStandardPO: {type:Number},
        endingBalanceAfterLastRemittanceOnStandardPO: {type:Number},
        priceAdjustmentAppliedOnStandardPO: {type:Boolean, default:false},
      }],
      StandardPurchaseOrderCumulativeBalance: [{
        cumulativeBalance: {type:Number}
      }],
      StandardPurchaseOrderItemsGrandTotal: [{
        updatedAt: {type:Date, default:Date.now},
        standardPurchaseOrderItemsGrandTotal: {type:Number}
      }],
    }],
    TotalRemittanceMadeSoFarOnStandardPO: [{
      remitDateOnStandardPO: {type:Date, default:Date.now},
      remittedDateOnStandardPO: {type:Date},
      remittedAmountOnStandardPO: {type:Number},
      remittedRemarksOnStandardPO: {type:String},
      TotalPaymentsMadeSoFarOnStandardPO: {type:String}
    }],
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
  });


//1.Middleware to ensure Purchase Order ID is generated before saving the document
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', function(next) {
  if (!this.standardPurchaseOrderId || this.standardPurchaseOrderId.trim() === '') {
    return next(new Error('Standard Purchase Order ID is required. Please ensure a valid Standard Purchase Order ID is generated'));
  }
  next();
});

//2.Middleware to handling User Profile Details
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', async function(next) {
  try {
    if (this.standardPOrderForActiveSubscriberRefID) {
      const subscriberDetails = await ActiveSubscriber.findById(this.standardPOrderForActiveSubscriberRefID);
      if (subscriberDetails) {
        this.standardPOrderForActiveSubscriberID = subscriberDetails.activeSubscriberID.toString();
        this.standardPOrderUserProfileFullName = subscriberDetails.activeSubscriberFirstName + ' ' + ' ' + subscriberDetails.activeSubscriberLastName;
        this.standardPOrderUserProfilePhoneNo = subscriberDetails.activeSubscriberPhoneNo;
        this.standardPOrderUserProfileEmail = subscriberDetails.activeSubscriberEmail;
        this.standardPOrderUserDeliveryAddress = subscriberDetails.activeSubscriberAssetDeliveryAddress;      }
      next();
    }
  } catch (error) {
    next(error as CallbackError);
  }
});

//3.Middleware for handling Item Information Details
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', async function (next) {
  try {
    if (this.StandardPurchaseOrderItems.length > 0) {
      for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
        const item = this.StandardPurchaseOrderItems[i];
        if (item.standardPurchaseOrderIntent) {
          //Fetch item details from the database
          const itemDetails = await ItemInformation.findById(item.standardPurchaseOrderIntent);
          if (itemDetails) {
            //Set item-specific fields
            item.standardPurchaseOrderCount = i + 1;
            item.standardPurchaseOrderIntentID = itemDetails.itemInformationID;
            item.standardPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
            item.standardPurchaseOrderIntentItemName = itemDetails.itemInformationName;
            item.standardPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
            //Set the new price alert to the latest market price if available
            if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
              const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
              item.standardPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
            }
            //Set the unit price to the new price alert or the market start price
            item.standardPurchaseOrderUnitPrice = item.standardPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
            //Calculate the total start price
            item.standardPurchaseOrderTotalStartPrice = item.standardPurchaseOrderNoOfUnitBought * item.standardPurchaseOrderUnitPrice;
          } else {
            console.warn(`Item details not found for intent ID: ${item.standardPurchaseOrderIntent}`);
          }
        }
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});


//4.Middleware for handling standardPurchaseOrderUnitOfMeasureRefID Details
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', async function(next) {
  try {
    if (this.StandardPurchaseOrderItems.length > 0) {
      for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
        const uomDetails = await UOM.findById(this.StandardPurchaseOrderItems[i].standardPurchaseOrderUnitOfMeasureRefID);
        if (uomDetails) {
          this.StandardPurchaseOrderItems[i].standardPurchaseOrderUnitOfMeasure = uomDetails.unitMeaseureName;
        }
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//5.Once a PO is booked, the PriceChangeOnPOHistoryDetails array is updated with the Start balance which will be the StartPrice & the RemittanceBalanceToBePaidDetails array 
//is updated with the first remittance entry which will be 0
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', async function (next) {
  try {
    if (this.StandardPurchaseOrderItems.some(item => item.standardPurchaseOrderIntent)) {
      for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
        const item = this.StandardPurchaseOrderItems[i]; // ✅ Get the individual item
        const itemDetails = await ItemInformation.findById(item.standardPurchaseOrderIntent);
        if (itemDetails) {
          //✅Assign values INDIVIDUALLY per item
          item.standardPurchaseOrderIntentID = itemDetails.itemInformationID;
          item.standardPurchaseOrderIntentItemCode = itemDetails.itemInformationCode;
          item.standardPurchaseOrderIntentItemName = itemDetails.itemInformationName;
          item.standardPurchaseOrderIntentDesc = itemDetails.itemInformationDescription;
          //✅Assign the latest market price if available
          if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
            const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
            item.standardPurchaseOrderNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
          }
          //✅Set the unit price and calculate total start price
          item.standardPurchaseOrderUnitPrice = item.standardPurchaseOrderNewPriceAlert || itemDetails.itemInformationMktStartPrice;
          item.standardPurchaseOrderTotalStartPrice = item.standardPurchaseOrderNoOfUnitBought * item.standardPurchaseOrderUnitPrice;
        }
      }
    }
    //✅Ensure each item gets its OWN `PriceChangeOnStandardPOHistoryDetails`
    if (this.StandardPurchaseOrderItems.length > 0) {
      for (let i = 0; i < this.StandardPurchaseOrderItems.length; i++) {
        const item = this.StandardPurchaseOrderItems[i];
        if (!item.PriceChangeOnStandardPOHistoryDetails) {
          item.PriceChangeOnStandardPOHistoryDetails = [];
        }
        //✅Ensure the Start Balance entry is ONLY added once
        if (item.PriceChangeOnStandardPOHistoryDetails.length === 0) {
          item.PriceChangeOnStandardPOHistoryDetails.push({
            priceChangeOnStandardPODate: this.createdAt,
            priceChangeOnStandardPORemarks: `Start Balance | Item ID: ${item.standardPurchaseOrderIntentID} || ${item.standardPurchaseOrderIntentItemCode} || ${item.standardPurchaseOrderIntentItemName} || ${item.standardPurchaseOrderNoOfUnitBought}${item.standardPurchaseOrderUnitOfMeasure} @${formatCurrency(item.standardPurchaseOrderUnitPrice)} each`,
            newUnitPriceAmountOnStandardPO: item.standardPurchaseOrderUnitPrice, // ✅ Now it's per item!
            
            newTotalPriceAmountOnStandardPO: item.standardPurchaseOrderTotalStartPrice, 
            priceAdjustmentAppliedOnStandardPO: false,
            cumulativeBalance: item.standardPurchaseOrderTotalStartPrice, // Add cumulative balance
          });
        }
        //✅Initialize RemittanceBalanceToBePaidDetailsOnStandardPO (Only Once)
        if (!item.RemittanceBalanceToBePaidDetailsOnStandardPO || item.RemittanceBalanceToBePaidDetailsOnStandardPO.length === 0) {
          item.RemittanceBalanceToBePaidDetailsOnStandardPO = [];
          //✅ Set initial expected balance to be paid
          const initialBalance = item.standardPurchaseOrderTotalStartPrice;
          item.RemittanceBalanceToBePaidDetailsOnStandardPO.push({
            remitDateOnStandardPO: new Date(),
            remittanceExpectedBalToBePaidStandardPO: -initialBalance, // Expected Balance to be paid
            remittanceUpdateRemarksOnStandardPO: `Initial Expected Amount for Standard Purchase Order ID: ${this.standardPurchaseOrderId}`,
            remittedAmountCROnStandardPO: 0, // No remittance yet
            endingBalanceAfterLastRemittanceOnStandardPO: -initialBalance, // Initial balance before any payment
            priceAdjustmentAppliedOnStandardPO: false,
            isRemittanceAfterPriceChangeOnStandardPO: undefined,
            priceChangeOnStandardPODate: new Date(),
          });
        }
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//6.Pre-save hook to set the standardPurchaseOrderItemsGrandTotal based on the sum of standardPurchaseOrderTotalStartPrice of all the items in the standardPurchaseOrderItems array.
//Pre-save to set the cumulative balance of items in the standardPurchaseOrderItems array. The cumulative balance history is kept as price of item changes.
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', async function (next) {
  try {
    const items = this.StandardPurchaseOrderItems || [];
    if (items.length === 0) return next();
    //a.Calculate current total per item
    const currentItemTotals = items.map(item => {
      const latestPrice = item.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardPO
        ?? item.standardPurchaseOrderTotalStartPrice
        ?? 0;
      const quantity = item.standardPurchaseOrderNoOfUnitBought ?? 1;
      return latestPrice * quantity;
    });
    //b.Compute cumulative balances
    const currentCumulativeTotals: number[] = [];
    let runningTotal = 0;
    for (const total of currentItemTotals) {
      runningTotal += total;
      currentCumulativeTotals.push(runningTotal);
    }
    //c.Retrieve existing document for comparison
    const existingDoc = await StandardPurchaseOrder.findById(this._id).lean();
    const previousItems = existingDoc?.StandardPurchaseOrderItems ?? [];
    //d.Check if any item's price/quantity has changed
    let hasAnyItemChanged = false;
    items.forEach((currentItem, index) => {
      const previousItem = previousItems[index];
      const previousPrice = previousItem?.PriceChangeOnStandardPOHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardPO
        ?? previousItem?.standardPurchaseOrderTotalStartPrice
        ?? 0;

      const previousQty = previousItem?.standardPurchaseOrderNoOfUnitBought ?? 1;
      const previousTotal = previousPrice * previousQty;

      const currentTotal = currentItemTotals[index];

      if (previousTotal !== currentTotal) {
        hasAnyItemChanged = true;
      }
    });
    //e.If no item has changed, skip
    if (!hasAnyItemChanged && existingDoc) return next();
    //f. Append to all items' cumulative & grand total history
    items.forEach((item, index) => {
      item.StandardPurchaseOrderCumulativeBalance ||= [];
      item.StandardPurchaseOrderItemsGrandTotal ||= [];

      item.StandardPurchaseOrderCumulativeBalance.push({
        cumulativeBalance: currentCumulativeTotals[index],
      });

      item.StandardPurchaseOrderItemsGrandTotal.push({
        standardPurchaseOrderItemsGrandTotal: currentCumulativeTotals[index],
        updatedAt: new Date(),
      });

      this.markModified(`StandardPurchaseOrderItems.${index}.StandardPurchaseOrderCumulativeBalance`);
      this.markModified(`StandardPurchaseOrderItems.${index}.StandardPurchaseOrderItemsGrandTotal`);
    });

    this.markModified('StandardPurchaseOrderItems');
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});


//7.Middleware to ensure that the standardPurchaseOrderAssetSubscType is automatically set to the default value of 'Outright Purchase' if not provided
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', function(next) {
  if (!this.standardPurchaseOrderAssetSubscType || this.standardPurchaseOrderAssetSubscType.trim() === '') {
    this.standardPurchaseOrderAssetSubscType = 'Outright Purchase';
  }
  next();
});

//8.Middleware to ensure only server dates are used & not client dates
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
    this.lastUpdatedAt = new Date();
    this.StandardPurchaseOrderItems.forEach(item => {item.PriceChangeOnStandardPOHistoryDetails.forEach(priceChange => {
        priceChange.priceChangeOnStandardPODate = new Date()});
    });
    this.StandardPurchaseOrderItems.forEach(item => {item.RemittanceBalanceToBePaidDetailsOnStandardPO.forEach(remittance => {
        remittance.priceChangeOnStandardPODate = new Date()});
    });
    this.lastUpdatedAt = new Date();
    this.TotalRemittanceMadeSoFarOnStandardPO.forEach(remittance => {
        remittance.remitDateOnStandardPO && remittance.remittedDateOnStandardPO === new Date()},  
    );  
    next();
  }
});

//9.Middleware to ensure that a particular item is not saved in the StandardPurchaseOrderItems more than once. Instead, the system should increase the existing item quantity by the new quantity
StandardPurchaseOrderSchema.pre<IStandardPurchaseOrder>('validate', function (next) {
  try {
    const items = this.StandardPurchaseOrderItems || [];
    const mergedMap = new Map<string, typeof items[0]>();

    for (const item of items) {
      const key = item.standardPurchaseOrderIntent.toString(); // Unique by intent
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.standardPurchaseOrderNoOfUnitBought += item.standardPurchaseOrderNoOfUnitBought ?? 0;
        //Optionally, update the unit price or total price here if needed
        //existing.standardPurchaseOrderUnitPrice = item.standardPurchaseOrderUnitPrice;
      } else {
        //Make a shallow copy to avoid modifying the original reference
        mergedMap.set(key, {...item});
      }
    }
    //Reassign merged items back to the array
    this.StandardPurchaseOrderItems = Array.from(mergedMap.values());
    next();
  } catch (error) {
    next(error);
  }
});


//Register the Schema as a model. Export the LayAwayPurchaseOrder Model
const StandardPurchaseOrder = mongoose.model<IStandardPurchaseOrder>('StandardPurchaseOrder', StandardPurchaseOrderSchema);
export {StandardPurchaseOrder, IStandardPurchaseOrder, IPriceChangeOnStandardPOHistoryDetails, 
  IPriceReverseAlertDetailsOnStandardPO, ITotalRemittancesMadeSoFarOnStandardPO, IRemittanceBalanceToBePaidOnStandardPOHistory};









