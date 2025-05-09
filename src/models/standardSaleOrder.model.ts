import mongoose, {Schema, Document, CallbackError} from 'mongoose';

import {ActiveSubscriber, IActiveSubscriber} from './activeSubscriber.model.js';
import {ItemInformation, IItemInformation} from './itemInformation.model.js';

import generateCombinedPOShortId from '../utils/generateCombinedPOShortId.util.js'
import formatCurrency from '../utils/formatCurrency.utils.js';
import {UOM} from './uom.model.js';


//Interface for PriceChangeonPurchaseOrderHistory Details
interface IPriceChangeOnStandardSaleInvoiceHistoryDetails {
  priceChangeOnStandardSaleInvoiceDate: Date;
  priceChangeOnStandardSaleInvoiceRemarks: string;
  newUnitPriceAmountOnStandardSaleInvoice: number;
  newTotalPriceAmountOnStandardSaleInvoice: number;
  priceAdjustmentAppliedOnStandardSaleInvoice: boolean;
  cumulativeBalance?: number; // Add cumulativeBalance property
};
//Interface for PurchaseOrderPriceReverseAlert Details
interface IPriceReverseAlertDetailsOnStandardSaleInvoice {
  standardSaleInvoiceReverseDate: Date;
  standardSaleInvoiceReversalID: string;
  standardSaleInvoiceReverseOldPrice: number;
  standardSaleInvoiceReverseNewPriceAlertRemarks: string;
  standardSaleInvoiceReverseNewPriceAlert: number;
};
//Interface for RemittanceBalanceToBePaidHistory Details
interface IRemittanceBalanceToBePaidOnStandardSaleInvoiceHistory {
  priceChangeOnStandardSaleInvoiceDate: Date;
  isRemittanceAfterPriceChangeOnStandardSaleInvoice?: boolean;
  remitDateOnStandardSaleInvoice: Date;
  remittanceExpectedBalToBePaidStandardSaleInvoice: number;
  remittanceUpdateRemarksOnStandardSaleInvoice: string;
  remittedAmountCROnStandardSaleInvoice: number;
  endingBalanceAfterLastRemittanceOnStandardSaleInvoice: number;
  priceAdjustmentAppliedOnStandardSaleInvoice: boolean;
};
//Interface for the StandardPurchaseOrderItemsGrandTotal Detals
interface IStandardSaleInvoiceItemsGrandTotal {
    updatedAt?: Date; // Add updatedAt property
    standardSaleInvoiceItemsGrandTotal: number; 
};
//Interface for TotalRemittancesMadeSoFar Details
interface ITotalRemittancesMadeSoFarOnStandardSaleInvoice {
  remitDateOnStandardSaleInvoice: string | number | Date;
  remittedDateOnStandardSaleInvoice?: Date;
  remittedAmountOnStandardSaleInvoice?: number;
  remittedRemarksOnStandardSaleInvoice?: string;
  TotalPaymentsMadeSoFarOnStandardSaleInvoice?: string;
  StandardSaleInvoiceItemsGrandTotal?: IStandardSaleInvoiceItemsGrandTotal[];
};
//Interface for Transformed Remittance Details
export interface ITransformedRemittanceOnStandardSaleInvoice {
  TotalPaymentsMadeSoFarOnStandardSaleInvoice: string;
  remittanceDateOnStandardSaleInvoice?: Date;
  remittanceAmountOnStandardSaleInvoice: number;
  remittanceRemarksOnStandardSaleInvoice: string;
};
//Interface to calculate the cumulative balance of items in the standardPurchaseOrderItems
interface ICalculateCumulativeBalance {
  cumulativeBalance: number;
};
//Interface for Multiple Standard Sale Invoice Intent
export interface IMultipleStandardSaleInvoiceIntent {
  standardSaleInvoiceDate: Date;
  standardSaleCount: number;
  standardSaleInvoiceIntent: mongoose.Types.ObjectId;
  standardSaleInvoiceIntentID: string;
  standardSaleInvoiceItemCode: string;
  standardSaleInvoiceIntentItemName: string;
  standardSaleInvoiceIntentDesc: string;
  standardSaleInvoiceNoOfUnitBought: number;
  standardSaleInvoiceUnitOfMeasureRefID: mongoose.Types.ObjectId;
  standardSaleInvoiceUnitOfMeasure: string;
  standardSaleInvoiceUnitPrice: number;
  standardSaleInvoiceTotalStartPrice: number;
  standardSaleInvoiceNewPriceAlert: number;
  PriceChangeOnStandardSaleInvoiceHistoryDetails: IPriceChangeOnStandardSaleInvoiceHistoryDetails[];
  PriceReverseAlertDetailsOnStandardSaleInvoice: IPriceReverseAlertDetailsOnStandardSaleInvoice[];
  StandardSaleInvoiceCumulativeBalance?: ICalculateCumulativeBalance[];
  StandardSaleInvoiceItemsGrandTotal?: IStandardSaleInvoiceItemsGrandTotal[];
  RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice: IRemittanceBalanceToBePaidOnStandardSaleInvoiceHistory[];
};

//----Interface for Standard Purchase Order Details--------------------------------------------------
interface IStandardSaleOrder extends Document {
  //remittedAmountCROnStandardPO: number;
  //remittanceEvents(remittanceEvents:any): unknown;
  //startViewTransition?: unknown;
  //SPO schema
  standardSaleInvoiceId: string;
  createdAt: Date;
  standardSaleInvoiceForActiveSubscriberRefID: mongoose.Types.ObjectId;
  standardSaleInvoiceForActiveSubscriberID: string;
  standardSaleInvoiceUserProfileFullName: string;
  standardSaleInvoiceUserProfilePhoneNo: string;
  standardSaleInvoiceUserProfileEmail: string;
  standardSaleInvoiceUserDeliveryAddress: string;
  standardSaleInvoiceAssetSubscType: string;
  StandardSaleInvoiceItems: IMultipleStandardSaleInvoiceIntent[];
  StandardSaleInvoiceCumulativeBalance?: ICalculateCumulativeBalance[];
  StandardSaleInvoiceItemsGrandTotal?: IStandardSaleInvoiceItemsGrandTotal[];
  TotalRemittanceMadeSoFarOnStandardSaleInvoice: ITotalRemittancesMadeSoFarOnStandardSaleInvoice[];
  lastUpdatedAt: Date; 
};

//StandardPurchaseOrder Schema for Mongoose
const StandardSaleOrderSchema = new Schema<IStandardSaleOrder>({
  standardSaleInvoiceId: {type:String, default:generateCombinedPOShortId, unique:true},
  createdAt: {type:Date, default:Date.now, required:true},
  standardSaleInvoiceForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
  standardSaleInvoiceForActiveSubscriberID: {type:String},
  standardSaleInvoiceUserProfileFullName: {type:String},
  standardSaleInvoiceUserProfilePhoneNo: {type:String},
  standardSaleInvoiceUserProfileEmail: {type:String},
  standardSaleInvoiceUserDeliveryAddress: {type:String},
  standardSaleInvoiceAssetSubscType: {type:String, default:'Outright Purchase'},
  StandardSaleInvoiceItems: [{
    standardSaleCount: {type:Number},
    standardSaleInvoiceDate: {type:Date, required:true},
    standardSaleInvoiceIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
    standardSaleInvoiceIntentID: {type:String},
    standardSaleInvoiceIntentItemCode: {type:String},
    standardSaleInvoiceIntentItemName: {type:String},
    standardSaleInvoiceIntentDesc: {type:String},
    standardSaleInvoiceNoOfUnitBought: {type:Number, required:true},
    standardSaleInvoiceUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
    standardSaleInvoiceUnitOfMeasure: {type:String},
    standardSaleInvoiceUnitPrice: {type:Number},
    standardSaleInvoiceTotalStartPrice: {type:Number},
    standardSaleInvoiceNewPriceAlert: {type:Number},
    PriceChangeOnStandardSaleInvoiceHistoryDetails: [{
        priceChangeOnStandardSaleInvoiceDate: {type:Date, default:Date.now},
        priceChangeOnStandardSaleInvoiceRemarks: {type:String},
        newUnitPriceAmountOnStandardSaleInvoice: {type:Number},
        newTotalPriceAmountOnStandardSaleInvoice: {type:Number},
        priceAdjustmentAppliedOnStandardSaleInvoice: {type:Boolean, default:false}
      }],
      PriceReverseAlertDetailsOnStandardSaleInvoice: [{
        standardSaleInvoiceReverseDate: {type:Date, default:Date.now},
        standardSaleInvoiceReversalID: {type:String},
        standardSaleInvoiceReverseOldPrice: {type:Number},
        standardSaleInvoiceReverseNewPriceAlertRemarks: {type:String},
        standardSaleInvoiceReverseNewPriceAlert: {type:Number}
      }],
      RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice: [{
        priceChangeOnStandardSaleInvoiceDate: {type:Date, default:Date.now},
        isRemittanceAfterPriceChangeOnStandardSaleInvoice: {type:Boolean},
        remitDateOnStandardSaleInvoice: {type:Date, default:Date.now},
        remittanceExpectedBalToBePaidStandardSaleInvoice: {type:Number},
        remittanceUpdateRemarksOnStandardSaleInvoice: {type:String},
        remittedAmountCROnStandardSaleInvoice: {type:Number},
        endingBalanceAfterLastRemittanceOnStandardSaleInvoice: {type:Number},
        priceAdjustmentAppliedOnStandardSaleInvoice: {type:Boolean, default:false},
      }],
      StandardSaleInvoiceCumulativeBalance: [{
        cumulativeBalance: {type:Number}
      }],
      StandardSaleInvoiceItemsGrandTotal: [{
        updatedAt: {type:Date, default:Date.now},
        standardSaleInvoiceItemsGrandTotal: {type:Number}
      }],
    }],
    TotalRemittanceMadeSoFarOnStandardSaleInvoice: [{
      remitDateOnStandardSaleInvoice: {type:Date, default:Date.now},
      remittedDateOnStandardSaleInvoice: {type:Date},
      remittedAmountOnStandardSaleInvoice: {type:Number},
      remittedRemarksOnStandardSaleInvoice: {type:String},
      TotalPaymentsMadeSoFarOnStandardSaleInvoice: {type:String}
    }],
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
  });


//1.Middleware to ensure Purchase Order ID is generated before saving the document
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', function(next) {
  if (!this.standardSaleInvoiceId || this.standardSaleInvoiceId.trim() === '') {
    return next(new Error('Standard Sale Invoice ID is required. Please ensure a valid Standard Sale Invoice ID is generated'));
  }
  next();
});

//2.Middleware to handling User Profile Details
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', async function(next) {
  try {
    if (this.standardSaleInvoiceForActiveSubscriberRefID) {
      const subscriberDetails = await ActiveSubscriber.findById(this.standardSaleInvoiceForActiveSubscriberRefID);
      if (subscriberDetails) {
        this.standardSaleInvoiceForActiveSubscriberID = subscriberDetails.activeSubscriberID.toString();
        this.standardSaleInvoiceUserProfileFullName = subscriberDetails.activeSubscriberFirstName + ' ' + ' ' + subscriberDetails.activeSubscriberLastName;
        this.standardSaleInvoiceUserProfilePhoneNo = subscriberDetails.activeSubscriberPhoneNo;
        this.standardSaleInvoiceUserProfileEmail = subscriberDetails.activeSubscriberEmail;
        this.standardSaleInvoiceUserDeliveryAddress = subscriberDetails.activeSubscriberAssetDeliveryAddress;      }
      next();
    }
  } catch (error) {
    next(error as CallbackError);
  }
});

//3.Middleware for handling Item Information Details
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', async function (next) {
  try {
    if (this.StandardSaleInvoiceItems.length > 0) {
      for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
        const item = this.StandardSaleInvoiceItems[i];
        if (item.standardSaleInvoiceIntent) {
          //Fetch item details from the database
          const itemDetails = await ItemInformation.findById(item.standardSaleInvoiceIntent);
          if (itemDetails) {
            //Set item-specific fields
            item.standardSaleCount = i + 1;
            item.standardSaleInvoiceIntentID = itemDetails.itemInformationID;
            item.standardSaleInvoiceItemCode = itemDetails.itemInformationCode;
            item.standardSaleInvoiceIntentItemName = itemDetails.itemInformationName;
            item.standardSaleInvoiceIntentDesc = itemDetails.itemInformationDescription;
            //Set the new price alert to the latest market price if available
            if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
              const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
              item.standardSaleInvoiceNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
            }
            //Set the unit price to the new price alert or the market start price
            item.standardSaleInvoiceUnitPrice = item.standardSaleInvoiceNewPriceAlert || itemDetails.itemInformationMktStartPrice;
            //Calculate the total start price
            item.standardSaleInvoiceTotalStartPrice = item.standardSaleInvoiceNoOfUnitBought * item.standardSaleInvoiceUnitPrice;
          } else {
            console.warn(`Item details not found for intent ID: ${item.standardSaleInvoiceIntent}`);
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
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', async function(next) {
  try {
    if (this.StandardSaleInvoiceItems.length > 0) {
      for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
        const uomDetails = await UOM.findById(this.StandardSaleInvoiceItems[i].standardSaleInvoiceUnitOfMeasureRefID);
        if (uomDetails) {
          this.StandardSaleInvoiceItems[i].standardSaleInvoiceUnitOfMeasure = uomDetails.unitMeaseureName;
        }
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//5.Once a PO is booked, the PriceChangeOnSaleInvoiceHistoryDetails array is updated with the Start balance which will be the StartPrice & the RemittanceBalanceToBePaidDetails array 
//is updated with the first remittance entry which will be 0
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', async function (next) {
  try {
    if (this.StandardSaleInvoiceItems.some(item => item.standardSaleInvoiceIntent)) {
      for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
        const item = this.StandardSaleInvoiceItems[i]; // ✅ Get the individual item
        const itemDetails = await ItemInformation.findById(item.standardSaleInvoiceIntent);
        if (itemDetails) {
          //✅Assign values INDIVIDUALLY per item
          item.standardSaleInvoiceIntentID = itemDetails.itemInformationID;
          item.standardSaleInvoiceItemCode = itemDetails.itemInformationCode;
          item.standardSaleInvoiceIntentItemName = itemDetails.itemInformationName;
          item.standardSaleInvoiceIntentDesc = itemDetails.itemInformationDescription;
          //✅Assign the latest market price if available
          if (itemDetails.itemInformationPriceUpdateDetails.length > 0) {
            const lastPriceUpdate = itemDetails.itemInformationPriceUpdateDetails[itemDetails.itemInformationPriceUpdateDetails.length - 1];
            item.standardSaleInvoiceNewPriceAlert = lastPriceUpdate.itemInformationCurrentMktPrice;
          }
          //✅Set the unit price and calculate total start price
          item.standardSaleInvoiceUnitPrice = item.standardSaleInvoiceNewPriceAlert || itemDetails.itemInformationMktStartPrice;
          item.standardSaleInvoiceTotalStartPrice = item.standardSaleInvoiceNoOfUnitBought * item.standardSaleInvoiceUnitPrice;
        }
      }
    }
    //✅Ensure each item gets its OWN `PriceChangeOnStandardPOHistoryDetails`
    if (this.StandardSaleInvoiceItems.length > 0) {
      for (let i = 0; i < this.StandardSaleInvoiceItems.length; i++) {
        const item = this.StandardSaleInvoiceItems[i];
        if (!item.PriceChangeOnStandardSaleInvoiceHistoryDetails) {
          item.PriceChangeOnStandardSaleInvoiceHistoryDetails = [];
        }
        //✅Ensure the Start Balance entry is ONLY added once
        if (item.PriceChangeOnStandardSaleInvoiceHistoryDetails.length === 0) {
          item.PriceChangeOnStandardSaleInvoiceHistoryDetails.push({
            priceChangeOnStandardSaleInvoiceDate: this.createdAt,
            priceChangeOnStandardSaleInvoiceRemarks: `Start Balance | Item ID: ${item.standardSaleInvoiceIntentID} || ${item.standardSaleInvoiceItemCode} || ${item.standardSaleInvoiceIntentItemName} || ${item.standardSaleInvoiceNoOfUnitBought}${item.standardSaleInvoiceUnitOfMeasure} @${formatCurrency(item.standardSaleInvoiceUnitPrice)} each`,
            newUnitPriceAmountOnStandardSaleInvoice: item.standardSaleInvoiceUnitPrice, // ✅ Now it's per item!
            
            newTotalPriceAmountOnStandardSaleInvoice: item.standardSaleInvoiceTotalStartPrice, 
            priceAdjustmentAppliedOnStandardSaleInvoice: false,
            cumulativeBalance: item.standardSaleInvoiceTotalStartPrice, // Add cumulative balance
          });
        }
        //✅Initialize RemittanceBalanceToBePaidDetailsOnStandardPO (Only Once)
        if (!item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice || item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.length === 0) {
          item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice = [];
          //✅ Set initial expected balance to be paid
          const initialBalance = item.standardSaleInvoiceTotalStartPrice;
          item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.push({
            remitDateOnStandardSaleInvoice: new Date(),
            remittanceExpectedBalToBePaidStandardSaleInvoice: -initialBalance, // Expected Balance to be paid
            remittanceUpdateRemarksOnStandardSaleInvoice: `Initial Expected Amount for Standard Purchase Order ID: ${this.standardSaleInvoiceId}`,
            remittedAmountCROnStandardSaleInvoice: 0, // No remittance yet
            endingBalanceAfterLastRemittanceOnStandardSaleInvoice: -initialBalance, // Initial balance before any payment
            priceAdjustmentAppliedOnStandardSaleInvoice: false,
            isRemittanceAfterPriceChangeOnStandardSaleInvoice: undefined,
            priceChangeOnStandardSaleInvoiceDate: new Date(),
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
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', async function (next) {
  try {
    const items = this.StandardSaleInvoiceItems || [];
    if (items.length === 0) return next();
    //a.Calculate current total per item
    const currentItemTotals = items.map(item => {
      const latestPrice = item.PriceChangeOnStandardSaleInvoiceHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardSaleInvoice
        ?? item.standardSaleInvoiceTotalStartPrice
        ?? 0;
      const quantity = item.standardSaleInvoiceNoOfUnitBought ?? 1;
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
    const existingDoc = await StandardSaleOrder.findById(this._id).lean();
    const previousItems = existingDoc?.StandardSaleInvoiceItems ?? [];
    //d.Check if any item's price/quantity has changed
    let hasAnyItemChanged = false;
    items.forEach((currentItem, index) => {
      const previousItem = previousItems[index];
      const previousPrice = previousItem?.PriceChangeOnStandardSaleInvoiceHistoryDetails?.slice(-1)[0]?.newUnitPriceAmountOnStandardSaleInvoice
        ?? previousItem?.standardSaleInvoiceTotalStartPrice
        ?? 0;

      const previousQty = previousItem?.standardSaleInvoiceNoOfUnitBought ?? 1;
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
      item.StandardSaleInvoiceCumulativeBalance ||= [];
      item.StandardSaleInvoiceItemsGrandTotal ||= [];

      item.StandardSaleInvoiceCumulativeBalance.push({
        cumulativeBalance: currentCumulativeTotals[index],
      });

      item.StandardSaleInvoiceItemsGrandTotal.push({
        standardSaleInvoiceItemsGrandTotal: currentCumulativeTotals[index],
        updatedAt: new Date(),
      });

      this.markModified(`StandardSaleInvoiceItems.${index}.StandardSaleInvoiceCumulativeBalance`);
      this.markModified(`StandardSaleInvoiceItems.${index}.StandardSaleInvoiceItemsGrandTotal`);
    });

    this.markModified('StandardSaleInvoiceItems');
    next();
  } catch (err) {
    next(err as CallbackError);
  }
});


//7.Middleware to ensure that the standardPurchaseOrderAssetSubscType is automatically set to the default value of 'Outright Purchase' if not provided
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', function(next) {
  if (!this.standardSaleInvoiceAssetSubscType || this.standardSaleInvoiceAssetSubscType.trim() === '') {
    this.standardSaleInvoiceAssetSubscType = 'Outright Purchase';
  }
  next();
});

//8.Middleware to ensure only server dates are used & not client dates
StandardSaleOrderSchema.pre<IStandardSaleOrder>('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
    this.lastUpdatedAt = new Date();
    this.StandardSaleInvoiceItems.forEach(item => {item.PriceChangeOnStandardSaleInvoiceHistoryDetails.forEach(priceChange => {
        priceChange.priceChangeOnStandardSaleInvoiceDate = new Date()});
    });
    this.StandardSaleInvoiceItems.forEach(item => {item.RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice.forEach(remittance => {
        remittance.priceChangeOnStandardSaleInvoiceDate = new Date()});
    });
    this.lastUpdatedAt = new Date();
    this.TotalRemittanceMadeSoFarOnStandardSaleInvoice.forEach(remittance => {
        remittance.remitDateOnStandardSaleInvoice && remittance.remittedDateOnStandardSaleInvoice === new Date()},  
    );  
    next();
  }
});

//9.Middleware to ensure that a particular item is not saved in the StandardPurchaseOrderItems more than once. Instead, the system should increase the existing item quantity by the new quantity
StandardSaleOrderSchema.pre<IStandardSaleOrder>('validate', function (next) {
  try {
    const items = this.StandardSaleInvoiceItems || [];
    const mergedMap = new Map<string, typeof items[0]>();

    for (const item of items) {
      const key = item.standardSaleInvoiceIntent.toString(); // Unique by intent
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        existing.standardSaleInvoiceNoOfUnitBought += item.standardSaleInvoiceNoOfUnitBought ?? 0;
        //Optionally, update the unit price or total price here if needed
        //existing.standardSaleInvoiceUnitPrice = item.standardSaleInvoiceUnitPrice;
      } else {
        //Make a shallow copy to avoid modifying the original reference
        mergedMap.set(key, {...item});
      }
    }
    //Reassign merged items back to the array
    this.StandardSaleInvoiceItems = Array.from(mergedMap.values());
    next();
  } catch (error) {
    next(error);
  }
});


//Register the Schema as a model. Export the LayAwayPurchaseOrder Model
const StandardSaleOrder = mongoose.model<IStandardSaleOrder>('StandardSaleOrder', StandardSaleOrderSchema);
export {StandardSaleOrder, IStandardSaleOrder, IPriceChangeOnStandardSaleInvoiceHistoryDetails, 
  IPriceReverseAlertDetailsOnStandardSaleInvoice, ITotalRemittancesMadeSoFarOnStandardSaleInvoice, IRemittanceBalanceToBePaidOnStandardSaleInvoiceHistory};









