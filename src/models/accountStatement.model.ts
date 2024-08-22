import mongoose, {Schema, model, Document, Model} from 'mongoose';
import {CallbackError} from 'mongoose';

import {ActiveUser, IActiveUser} from "./activeUser.model.js";
import {PaymentClass, IPaymentClass} from './paymentClass.model.js';
import {PurchaseOrder, IPurchaseOrder} from './purchaseOrder.model.js';
import {Remittance, IRemittance} from './remittance.model.js';

// Function to generate a 9-digit short ID starting from 1000200010 
function generateAcctStatShortId(): string {
    const min: number = 0o100020001000001;
    const max: number = 99100000000000000; // Maximum value for the 20-digit number starting from 0001000200010
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10,'0'); // Ensure the ID is 10 digits long
};
console.log(generateAcctStatShortId())

interface IRemittanceDetail {
  getRemittanceForWhichPurchaseOrderID: mongoose.Types.ObjectId;
  getRemittedAmountDate: Date;
  getRemittanceTransactionRemarks: string;
  getRemittedAmountCR: number;
  getRemittedBalanceToBePaid: number;
}

// Define the interface for Account Statement
interface IAccountStatement extends Document {
    acctStatID: string;
    getActiveUserIDonAcctStat: string;
    getUserProfiledFullNameOnAcctStat: string;
    getUserProfiledEmailOnAcctStat: string;
    getUserProfiledPhoneNoOnAcctStat: string;
    getPurchaseOrderCreationDate: Date;
    accountStatPurchaseOrder: mongoose.Types.ObjectId;
    getPurchaseOrderRemarks: string;
    getOpeningBalOnDRColumn: number;
    remittanceCRDetails: IRemittanceDetail[];
    getOpeningBalValue: number;
    createdAt: Date;
    lastUpdatedAt: Date;
}

const AccountStatementSchema = new Schema<IAccountStatement>({
    acctStatID: {type:String, default:generateAcctStatShortId, unique:true},
    getActiveUserIDonAcctStat: {type:String},
    getUserProfiledFullNameOnAcctStat: {type:String},
    getUserProfiledEmailOnAcctStat: {type:String},
    getUserProfiledPhoneNoOnAcctStat: {type:String},
    getPurchaseOrderCreationDate: {type:Date},
    accountStatPurchaseOrder: {type:Schema.Types.ObjectId, ref:'PurchaseOrder', required:true},
    getPurchaseOrderRemarks: {type:String},
    getOpeningBalOnDRColumn: {type:Number},
    remittanceCRDetails: [{
      getRemittanceForWhichPurchaseOrderID: {type:Schema.Types.ObjectId, ref:'Remittance', required:true},
      getRemittedAmountDate: {type:Date, required:true},
      getRemittanceTransactionRemarks: {type:String, required:true},
      getRemittedAmountCR: {type:Number},
      getRemittedBalanceToBePaid: {type:Number}
    }],
    getOpeningBalValue: {type:Number},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});


// Pre-Save Hook to set the 'accountOpeningBalance', '', orhers based on the 'accountStatPurchaseOrder'
AccountStatementSchema.pre<IAccountStatement>('save', async function (next) {
    try {
        if (this.accountStatPurchaseOrder) {
            const getAcctStatInfo = await PurchaseOrder.findById(this.accountStatPurchaseOrder).exec();
            if (getAcctStatInfo) {
                this.getActiveUserIDonAcctStat = getAcctStatInfo.pOrderForActiveUserID;
                this.getUserProfiledFullNameOnAcctStat = getAcctStatInfo.pOrderUserProfileFullName;
                this.getUserProfiledEmailOnAcctStat= getAcctStatInfo.pOrderUserProfileEmail;
                this.getUserProfiledPhoneNoOnAcctStat = getAcctStatInfo.pOrderUserProfilePhoneNo;
                this.getPurchaseOrderCreationDate = getAcctStatInfo.createdAt;
                this.getPurchaseOrderRemarks = 'Opening Balance | Purchase Order ID:' + '' + getAcctStatInfo.purchaseOrderId;
                this.getOpeningBalOnDRColumn = getAcctStatInfo.purchaseOrderNewPriceAlert;
                //this.getOpeningBalValue = getAcctStatInfo.BalanceToBePaidOnPO;
            }
        }
        next();
    } catch (error) {
        next(error as CallbackError);
    }
});

// Pre-save hook to populate remittance details based on the getRemittanceForWhichPurchaseOrderID
AccountStatementSchema.pre<IAccountStatement>('save', async function (next) {
  try {
    if (this.remittanceCRDetails && this.remittanceCRDetails.length > 0) {
      for (const remittanceDetail of this.remittanceCRDetails) {
        const remittanceInfo = await Remittance.findById(remittanceDetail.getRemittanceForWhichPurchaseOrderID).exec();
        if (remittanceInfo) {
        //   remittanceDetail.getRemittedAmountDate = remittanceInfo.remittanceDate;
        //   remittanceDetail.getRemittanceTransactionRemarks = remittanceInfo.remittanceRemarks;
        //   remittanceDetail.getRemittedAmountCR = remittanceInfo.remittanceAmount_CR;
        //   remittanceDetail.getRemittedBalanceToBePaid = remittanceInfo.expectedPurchaseOrderBalToBePaid;
         }
      }
    }
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

//Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const AccountStatement = mongoose.model<IAccountStatement>('AccountStatement', AccountStatementSchema);
export {AccountStatement, IAccountStatement};