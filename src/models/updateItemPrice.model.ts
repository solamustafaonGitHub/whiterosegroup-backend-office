import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';
import {CallbackError} from 'mongoose';

import {ItemInformation, IItemInformation} from './itemInformation.model.js';
import {PurchaseOrder, IPurchaseOrder} from './purchaseOrder.model.js';

// Define the interface for updateItemPrice
interface IUpdateItemPrice extends Document {
  itemToBeUpdatedRefID: mongoose.Types.ObjectId;
  itemToBeUpdatedID: string;
  itemToBeUppdatedDisplayItemCode?: string;
  itemToBeupdatedDisplayName?: string;
  itemToBeUpdatedDisplayItemDesc?: string;
  itemToBeUpdatedStartPrice?: number;
  updatedItemNewPriceByInflation: number;
  updatedItemReasonForNewPrice?: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

// Define the UpdateItemPrice Schema
const UpdateItemPriceSchema = new Schema<IUpdateItemPrice>({
  itemToBeUpdatedRefID: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
  itemToBeUpdatedID: { type: String },
  itemToBeUppdatedDisplayItemCode: { type: String },
  itemToBeupdatedDisplayName: { type: String },
  itemToBeUpdatedDisplayItemDesc: { type: String },
  itemToBeUpdatedStartPrice: { type: Number },
  updatedItemNewPriceByInflation: { type: Number, required: true },
  updatedItemReasonForNewPrice: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
});

// Define the Pre-save Hook to set the itemToBeupdatedDisplayName,itemToBeUppdatedDisplayItemCode,itemToBeUpdatedDisplayItemDesc based on the selected itemToBeUpdatedID
UpdateItemPriceSchema.pre<IUpdateItemPrice>('save', async function (next) {
  try {
      if (this.itemToBeUpdatedRefID) {
          const updateItemPrice = await ItemInformation.findById(this.itemToBeUpdatedRefID);
          if (updateItemPrice) {
              this.itemToBeUpdatedID = updateItemPrice.itemInformationID
              this.itemToBeUppdatedDisplayItemCode = updateItemPrice.itemInformationCode
              this.itemToBeupdatedDisplayName = updateItemPrice.itemInformationName
              this.itemToBeUpdatedDisplayItemDesc = updateItemPrice.itemInformationDescription
              this.itemToBeUpdatedStartPrice = updateItemPrice.itemInformationMktStartPrice
      } else {
          throw new Error('Item information not found');
        }
      }
      next();
  } catch (error) {
      next(error as CallbackError);
  }
});

// Create a separate function to handle price updates
// async function handlePriceUpdates(updateItemPrice: IUpdateItemPrice) {
//   try {
//       const purchaseOrders = await PurchaseOrder.find({purchaseOrderIntent:updateItemPrice.itemToBeUpdatedRefID});

//       for (const purchaseOrder of purchaseOrders) {
//       // Calculate and update balance based on the new price update
//       const previousBalance = purchaseOrder.PriceChangeOnPOHistoryDetails[purchaseOrder.PriceChangeOnPOHistoryDetails.length - 1]?.newPriceAmountOnPO || 0;

//       await purchaseOrder.save();
//     }
//   } catch (error) {
//     // Handle the error here
//   }
// };

// UpdateItemPriceSchema post-save hook
UpdateItemPriceSchema.post<IUpdateItemPrice>('save', async function (next) {
  try {
    const updateItemPrice = this;
    const itemInformation = await ItemInformation.find({itemInformationID:updateItemPrice.itemToBeUpdatedID});

    // Update item information
    for (const item of itemInformation) {
      item.itemInformationPriceUpdateDetails.push({
        itemInformationTranDateForNewPriceUpdate: updateItemPrice.lastUpdatedAt,
        itemInformationNewPriceUpdateRemarks: 'New Price Alert | Item ID: ' + updateItemPrice.itemToBeUpdatedID + ' (' + updateItemPrice.itemToBeupdatedDisplayName + ')',
        itemInformationCurrentMktPrice: updateItemPrice.updatedItemNewPriceByInflation,
      });
      await item.save();
    }

  // Update purchase orders
    const purchaseOrders = await PurchaseOrder.find({purchaseOrderIntent: updateItemPrice.itemToBeUpdatedRefID});
    
    for (const purchaseOrder of purchaseOrders) {
    const previousBalance = purchaseOrder.PriceChangeOnPOHistoryDetails[purchaseOrder.PriceChangeOnPOHistoryDetails.length - 1]?.newPriceAmountOnPO || 0;
    const newBalance = updateItemPrice.updatedItemNewPriceByInflation;

  // Create new balance entry only if there's a price change
   if (newBalance !== previousBalance) {
     const priceChangeType = newBalance > previousBalance ? 'Increase' : 'Decrease';

     purchaseOrder.PriceChangeOnPOHistoryDetails.push({
       priceChangeOnPODate: new Date(),
       priceChangeOnPORemarks: `Price ${priceChangeType} Alert for Item ID:${updateItemPrice.itemToBeUpdatedID} (${updateItemPrice.itemToBeupdatedDisplayName})`,
       newPriceAmountOnPO: newBalance,
     });

  // Create a new Credit Bill Alert Entry (optional)
    if (purchaseOrder.PriceChangeOnPOHistoryDetails.length >= 1) {
        purchaseOrder.purchaseOrderPriceReverseAlertDetails.push({
          purchaseOrderReverseDate: updateItemPrice.lastUpdatedAt,
          purchaseOrderReverseNewPriceAlertRemarks: 'Credit Issued Due To Price Adjustment on Item ID:' + '' + updateItemPrice.itemToBeUpdatedID + ' ' + '(' + updateItemPrice.itemToBeupdatedDisplayName + ')',
          purchaseOrderReverseNewPriceAlert: previousBalance,
        });
      }
    }
  await purchaseOrder.save();
  }
  //await handlePriceUpdates(updateItemPrice);
      next;
    } catch (error) {
      next;
    }
  });

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const UpdateItemPrice = mongoose.model<IUpdateItemPrice>('UpdateItemPrice', UpdateItemPriceSchema);
export{UpdateItemPrice, IUpdateItemPrice};