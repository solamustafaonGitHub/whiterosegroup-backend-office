// import mongoose, {Schema, model, Document, CallbackError} from 'mongoose';
// import {ItemInformation, IItemInformation} from './itemInformation.model.js';
// import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder} from './layAwayPurchaseOrder.model.js';
// import {StandardPurchaseOrder, IStandardPurchaseOrder} from './standardPurchaseOrder.model.js';
// import {generateUpdateItemPriceShortId} from '../utils/generateCombinedUPDATESShortid.utils.js';
// import {IPriceChangeOnStandardPOHistoryDetails, IPriceReverseAlertDetailsOnStandardPO, IMultipleStandardPurchaseOrderIntent} from './standardPurchaseOrder.model.js';

// import {EventEmitter} from 'events';
// const eventBus = new EventEmitter();

// //Define the interface for updateItemPrice
// interface IUpdateItemPrice extends Document {
//   itemToBeUpdatedRefID: mongoose.Types.ObjectId;
//   updateItemPriceID: string;
//   itemToBeUpdatedID: string;
//   itemToBeUpdatedDisplayItemCode?: string;
//   itemToBeupdatedDisplayName?: string;
//   itemToBeUpdatedDisplayItemDesc?: string;
//   itemToBeUpdatedStartPrice?: number;
//   updatedItemNewPriceByInflation: number;
//   updatedItemReasonForNewPrice?: string;
//   createdAt: Date;
//   lastUpdatedAt: Date;
// }

// //Define the UpdateItemPrice Schema
// const UpdateItemPriceSchema = new Schema<IUpdateItemPrice>({
//   itemToBeUpdatedRefID: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
//   updateItemPriceID: {type:String, default:generateUpdateItemPriceShortId, unique:true},
//   itemToBeUpdatedID: {type:String },
//   itemToBeUpdatedDisplayItemCode: {type:String},
//   itemToBeupdatedDisplayName: {type:String},
//   itemToBeUpdatedDisplayItemDesc: {type:String},
//   itemToBeUpdatedStartPrice: {type:Number},
//   updatedItemNewPriceByInflation: {type:Number, required:true},
//   updatedItemReasonForNewPrice: {type:String, required:true},
//   createdAt: {type:Date, default:new Date(), required:true},
//   lastUpdatedAt: {type:Date, default:new Date(), required:true},
// });

// //Ensure the updateItemPriceID is generated before saving the document
// UpdateItemPriceSchema.pre<IUpdateItemPrice>('save', function (next) {
//   if (!this.updateItemPriceID || this.updateItemPriceID.trim() === '') {
//     return next(new Error('Update Item Price ID is required. Please ensure a valid updateItemPrice is generated.'));
//   }
//   next();
// });

// //Pre-save hook to set display fields based on the item information
// UpdateItemPriceSchema.pre<IUpdateItemPrice>('save', async function (next) {
//   try {
//     if (this.itemToBeUpdatedRefID) {
//       const itemInfo = await ItemInformation.findById(this.itemToBeUpdatedRefID);
//       if (itemInfo) {
//         this.itemToBeUpdatedID = itemInfo.itemInformationID;
//         this.itemToBeUpdatedDisplayItemCode = itemInfo.itemInformationCode;
//         this.itemToBeupdatedDisplayName = itemInfo.itemInformationName;
//         this.itemToBeUpdatedDisplayItemDesc = itemInfo.itemInformationDescription;
//         this.itemToBeUpdatedStartPrice = itemInfo.itemInformationMktStartPrice;
//       } else {
//         throw new Error('Item information not found');
//       }
//     }
//     next();
//   } catch (error) {
//     next(error as CallbackError);
//   }
// });

// //Post-save hook to updateItemPrice in ItemInformation model and handle associated LayAwayPurchaseOrder.
// UpdateItemPriceSchema.post<IUpdateItemPrice>('save', async function () {
//   try {
//     const itemInformation = await ItemInformation.findById(this.itemToBeUpdatedRefID); //Update item information with new price details
//     if (itemInformation) {
//       itemInformation.itemInformationPriceUpdateDetails.push({
//         itemInformationTranDateForNewPriceUpdate: this.lastUpdatedAt,
//         itemInformationNewPriceUpdateRemarks: this.updatedItemReasonForNewPrice,
//         itemInformationCurrentMktPrice: this.updatedItemNewPriceByInflation,
//       });
//       await itemInformation.save();
//     }

//     //Update relevant purchase orders
//     const layAwayPurchaseOrders = await LayAwayPurchaseOrder.find({layAwayPurchaseOrderIntent:this.itemToBeUpdatedRefID});
//     for (const layAwayPO of layAwayPurchaseOrders) {
//       const previousPrice = layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.slice(-1)[0]?.newPriceAmountOnLayAwayPO || 0;
//       const newPrice = this.updatedItemNewPriceByInflation * layAwayPO.layAwayPurchaseOrderNoOfUnitBought;

//       //Check if endingBalanceAfterLastRemittance is fully paid (0)
//       const lastRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0];
//       const isFullyPaid = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO === 0;

//       const formatCurrency = (value:number): string => {
//         const formatter = new Intl.NumberFormat('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
//         const formattedValue = formatter.format(Math.abs(value));
//         return value < 0 ? `(${formattedValue})` : formattedValue; // Parentheses for negative values
//       };

//       if(newPrice !== previousPrice && !isFullyPaid) {
//       //Add new price change history entry
//       const priceChangeType = newPrice > previousPrice ? 'Increase' : 'Decrease';
//       layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.push({
//         priceChangeOnLayAwayPODate: this.createdAt,
//         priceChangeOnLayAwayPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID} || ${this.itemToBeUpdatedDisplayItemCode} || ${layAwayPO.layAwayPurchaseOrderNoOfUnitBought}${layAwayPO.layAwayPurchaseOrderUnitOfMeasure} @${formatCurrency(this.updatedItemNewPriceByInflation)} each`,
//         newPriceAmountOnLayAwayPO: newPrice,
//       });
//       //Adjust remittance balance based on price change
//       const endingBalanceBeforePriceChange = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0]?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
//       const endingBalanceAfterPriceChange = endingBalanceBeforePriceChange + previousPrice - newPrice;
//       layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
//         remitDateOnLayAwayPO: this.createdAt,
//         remittanceExpectedBalToBePaidOnLayAwayPO: endingBalanceBeforePriceChange,
//         remittanceUpdateRemarksOnLayAwayPO: `Balance adjusted for ${priceChangeType} in Item Price`,
//         remittedAmountCROnLayAwayPO: 0,
//         endingBalanceAfterLastRemittanceOnLayAwayPO: endingBalanceAfterPriceChange,
//         priceAdjustmentAppliedOnLayAwayPO: true,
//         isRemittanceAfterPriceChangeOnLayAwayPO: undefined,
//         priceChangeOnLayAwayPODate: ''
//       });
//       //Optional: Create a new credit bill alert entry for price adjustment
//       layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.push({
//         layAwayPurchaseOrderReverseDate: this.createdAt,
//         layAwayPurchaseOrderReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment on Item ID: ${this.itemToBeUpdatedID} || ${this.itemToBeUpdatedDisplayItemCode}`,
//         layAwayPurchaseOrderReverseNewPriceAlert: newPrice,
//         layAwayPurchaseOrderReverseOldPrice: previousPrice,
//       });

//       await layAwayPO.save();
//       }
//     }
//   } catch (error) {
//     throw new Error(`Failed to update Purchase Orders or Item Information: ${error.message}`);
//   }
// });

// //Create and Export the Model
// const UpdateItemPrice = mongoose.model<IUpdateItemPrice>('UpdateItemPrice', UpdateItemPriceSchema);
// export {UpdateItemPrice, IUpdateItemPrice};


import mongoose, {Schema, model, Document, CallbackError} from 'mongoose';
import {ItemInformation, IItemInformation} from './itemInformation.model.js';
import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder} from './layAwayPurchaseOrder.model.js';
import {StandardPurchaseOrder, IStandardPurchaseOrder} from './standardPurchaseOrder.model.js';
import {generateUpdateItemPriceShortId} from '../utils/generateCombinedUPDATESShortid.utils.js';

import formatCurrency from '../utils/formatCurrency.utils.js';

import {EventEmitter} from 'events';
const eventBus = new EventEmitter();

//Define the interface for updateItemPrice
interface IUpdateItemPrice extends Document {
  itemToBeUpdatedRefID: mongoose.Types.ObjectId;
  updateItemPriceID: string;
  itemToBeUpdatedID: string;
  itemToBeUpdatedDisplayItemCode?: string;
  itemToBeupdatedDisplayName?: string;
  itemToBeUpdatedDisplayItemDesc?: string;
  itemToBeUpdatedStartPrice?: number;
  updatedItemNewPriceByInflation: number;
  updatedItemReasonForNewPrice?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
};

//Define the UpdateItemPrice Schema
const UpdateItemPriceSchema = new Schema<IUpdateItemPrice>({
  itemToBeUpdatedRefID: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
  updateItemPriceID: {type:String, default:generateUpdateItemPriceShortId, unique:true},
  itemToBeUpdatedID: {type:String },
  itemToBeUpdatedDisplayItemCode: {type:String},
  itemToBeupdatedDisplayName: {type:String},
  itemToBeUpdatedDisplayItemDesc: {type:String},
  itemToBeUpdatedStartPrice: {type:Number},
  updatedItemNewPriceByInflation: {type:Number, required:true},
  updatedItemReasonForNewPrice: {type:String, required:true},
  createdAt: {type:Date, default:new Date(), required:true},
  lastUpdatedAt: {type:Date, default:new Date(), required:true},
});


//Ensure the updateItemPriceID is generated before saving the document
UpdateItemPriceSchema.pre<IUpdateItemPrice>('save', function (next) {
  if (!this.updateItemPriceID || this.updateItemPriceID.trim() === '') {
    return next(new Error('Update Item Price ID is required. Please ensure a valid updateItemPrice is generated.'));
  }
  next();
});

//Pre-save hook to set display fields based on the item information
UpdateItemPriceSchema.pre<IUpdateItemPrice>('save', async function (next) {
  try {
    if (this.itemToBeUpdatedRefID) {
      const itemInfo = await ItemInformation.findById(this.itemToBeUpdatedRefID);
      if (itemInfo) {
        this.itemToBeUpdatedID = itemInfo.itemInformationID;
        this.itemToBeUpdatedDisplayItemCode = itemInfo.itemInformationCode;
        this.itemToBeupdatedDisplayName = itemInfo.itemInformationName;
        this.itemToBeUpdatedDisplayItemDesc = itemInfo.itemInformationDescription;
        this.itemToBeUpdatedStartPrice = itemInfo.itemInformationMktStartPrice;
      } else {
        throw new Error('Item information not found');
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});


//Post-save hook to updateItemPrice in ItemInformation model and handle associated LayAwayPurchaseOrder & StandardPurchaseOrder.
UpdateItemPriceSchema.post<IUpdateItemPrice>('save', async function () {
  try {
    const itemInformation = await ItemInformation.findById(this.itemToBeUpdatedRefID);
    if (itemInformation) {
      itemInformation.itemInformationPriceUpdateDetails.push({
        itemInformationTranDateForNewPriceUpdate: this.lastUpdatedAt,
        itemInformationNewPriceUpdateRemarks: this.updatedItemReasonForNewPrice,
        itemInformationCurrentMktPrice: this.updatedItemNewPriceByInflation,
      });
      await itemInformation.save();
    }

    //-------------------- LAYAWAY PURCHASE ORDER UPDATE --------------------
    const layAwayPurchaseOrders = await LayAwayPurchaseOrder.find({ layAwayPurchaseOrderIntent: this.itemToBeUpdatedRefID });
    for (const layAwayPO of layAwayPurchaseOrders) {
      const previousPrice = layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.slice(-1)[0]?.newPriceAmountOnLayAwayPO || 0;
      const newPrice = this.updatedItemNewPriceByInflation * layAwayPO.layAwayPurchaseOrderNoOfUnitBought;
      const lastRemittance = layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.slice(-1)[0];
      const isFullyPaid = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO === 0;

      if (newPrice !== previousPrice && !isFullyPaid) {
        const priceChangeType = newPrice > previousPrice ? 'Increase' : 'Decrease';
        //Add new price change history entry
        layAwayPO.PriceChangeOnLayAwayPOHistoryDetails.push({
          priceChangeOnLayAwayPODate: this.createdAt,
          priceChangeOnLayAwayPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID}`,
          newPriceAmountOnLayAwayPO: newPrice,
        });
        //Adjust remittance balance
        const endingBalanceBeforePriceChange = lastRemittance?.endingBalanceAfterLastRemittanceOnLayAwayPO || 0;
        const endingBalanceAfterPriceChange = endingBalanceBeforePriceChange + previousPrice - newPrice;
        //Push new remittance balance entry
        layAwayPO.RemittanceBalanceToBePaidDetailsOnLayAwayPO.push({
          remitDateOnLayAwayPO: this.createdAt,
          remittanceExpectedBalToBePaidOnLayAwayPO: endingBalanceBeforePriceChange,
          remittanceUpdateRemarksOnLayAwayPO: `Balance adjusted for ${priceChangeType} in Item Price`,
          remittedAmountCROnLayAwayPO: 0,
          endingBalanceAfterLastRemittanceOnLayAwayPO: endingBalanceAfterPriceChange,
          priceAdjustmentAppliedOnLayAwayPO: true,
          priceChangeOnLayAwayPODate: this.createdAt, // Added missing property
          isRemittanceAfterPriceChangeOnLayAwayPO: false, // Added missing property
        });
        //Price reversal alert
        layAwayPO.PriceReverseAlertDetailsOnLayAwayPO.push({
          layAwayPurchaseOrderReverseDate: this.createdAt,
          layAwayPurchaseOrderReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment`,
          layAwayPurchaseOrderReverseNewPriceAlert: newPrice,
          layAwayPurchaseOrderReverseOldPrice: previousPrice,
        });
        
        await layAwayPO.save();
      }
    }

    //-------------------- STANDARD PURCHASE ORDER UPDATE --------------------
    const standardPurchaseOrders = await StandardPurchaseOrder.find({
      "StandardPurchaseOrderItems.standardPurchaseOrderIntent": this.itemToBeUpdatedRefID,
    });
    
    const bulkUpdates = [];
    
    for (const standardPO of standardPurchaseOrders) {
      let orderUpdated = false;
    
      const updatedItems = standardPO.StandardPurchaseOrderItems.map(item => {
        const isTarget = item.standardPurchaseOrderIntent.toString() === this.itemToBeUpdatedRefID.toString();
        const quantity = item.standardPurchaseOrderNoOfUnitBought ?? 1;
    
        // Use newUnitPriceAmountOnStandardPO for accurate unit-level history
        const history = item.PriceChangeOnStandardPOHistoryDetails ?? [];
        const previousUnitPrice =
          history.slice(-1)[0]?.newUnitPriceAmountOnStandardPO
          ?? ((item.standardPurchaseOrderTotalStartPrice ?? 0) / quantity); // Fallback to unit price from total
    
        const latestUnitPrice = isTarget
          ? this.updatedItemNewPriceByInflation
          : previousUnitPrice;
    
        const totalPrice = latestUnitPrice * quantity;
    
        return {
          item,
          isTarget,
          quantity,
          unitPrice: latestUnitPrice,
          previousUnitPrice,
          totalPrice,
        };
      });
    
      const anyItemChanged = updatedItems.some(({ isTarget, unitPrice, previousUnitPrice }) =>
        isTarget && unitPrice !== previousUnitPrice
      );
    
      if (!anyItemChanged) continue;
    
      let cumulativeBalance = 0;
    
      updatedItems.forEach(({ item, isTarget, quantity, unitPrice, previousUnitPrice, totalPrice }) => {
        cumulativeBalance += totalPrice;
    
        item.StandardPurchaseOrderCumulativeBalance ||= [];
        item.StandardPurchaseOrderCumulativeBalance.push({
          cumulativeBalance,
        });
    
        item.StandardPurchaseOrderItemsGrandTotal ||= [];
        item.StandardPurchaseOrderItemsGrandTotal.push({
          standardPurchaseOrderItemsGrandTotal: cumulativeBalance,
          updatedAt: new Date(),
        });
    
        if (isTarget) {
          const oldTotal = previousUnitPrice * quantity;
          const newTotal = unitPrice * quantity;
    
          const priceChangeType = unitPrice > previousUnitPrice ? 'Increase' : 'Decrease';
    
          // 1. Add Price History (unit + total)
          item.PriceChangeOnStandardPOHistoryDetails ||= [];
          item.PriceChangeOnStandardPOHistoryDetails.push({
            priceChangeOnStandardPODate: this.createdAt,
            priceChangeOnStandardPORemarks: `Price ${priceChangeType} Alert for Item ID: ${this.itemToBeUpdatedID} || Unit Price ${priceChangeType} from @${formatCurrency(previousUnitPrice)} to @${formatCurrency(unitPrice)} each`,
            newUnitPriceAmountOnStandardPO: unitPrice,
            newTotalPriceAmountOnStandardPO: newTotal,
            priceAdjustmentAppliedOnStandardPO: true,
          });
    
          // 2. Update Remittance Balance
          const lastRemittance = item.RemittanceBalanceToBePaidDetailsOnStandardPO?.slice(-1)[0];
          const endingBalanceBefore = lastRemittance?.endingBalanceAfterLastRemittanceOnStandardPO ?? 0;
          const endingBalanceAfter = endingBalanceBefore + (oldTotal - newTotal);
    
          item.RemittanceBalanceToBePaidDetailsOnStandardPO ||= [];
          item.RemittanceBalanceToBePaidDetailsOnStandardPO.push({
            remitDateOnStandardPO: this.createdAt,
            remittanceExpectedBalToBePaidStandardPO: endingBalanceBefore,
            remittanceUpdateRemarksOnStandardPO: `Balance adjusted for ${priceChangeType} in Item Price`,
            remittedAmountCROnStandardPO: 0,
            endingBalanceAfterLastRemittanceOnStandardPO: endingBalanceAfter,
            priceAdjustmentAppliedOnStandardPO: true,
            priceChangeOnStandardPODate: this.createdAt,
          });
    
          // 3. Add Reversal/Credit Alert
          item.PriceReverseAlertDetailsOnStandardPO ||= [];
          item.PriceReverseAlertDetailsOnStandardPO.push({
            standardPOReverseDate: this.createdAt,
            standardPOReversalID: generateUpdateItemPriceShortId(),
            standardPOReverseNewPriceAlertRemarks: `Credit Issued Due to Price Adjustment on Item ID:${this.itemToBeUpdatedID} || ${this.itemToBeUpdatedDisplayItemCode}`,
            standardPOReverseOldPrice: previousUnitPrice * quantity,
            standardPOReverseNewPriceAlert: unitPrice * quantity,
          });
        }
      });
    
      orderUpdated = true;
    
      if (orderUpdated) {
        bulkUpdates.push({
          updateOne: {
            filter: { _id: standardPO._id },
            update: {
              $set: {
                StandardPurchaseOrderItems: standardPO.StandardPurchaseOrderItems,
              },
            },
          },
        });
      }
    }
    
    // Step 4: Perform bulk database update
    if (bulkUpdates.length > 0) {
      await StandardPurchaseOrder.bulkWrite(bulkUpdates);
    }
    
    
  } catch (error) {
    console.error("Error updating purchase orders:", error);
    throw new Error(`Failed to update Purchase Orders or Item Information: ${error.message}`);
  }
});

//Create and Export the Model
const UpdateItemPrice = mongoose.model<IUpdateItemPrice>('UpdateItemPrice', UpdateItemPriceSchema);
export {UpdateItemPrice, IUpdateItemPrice};