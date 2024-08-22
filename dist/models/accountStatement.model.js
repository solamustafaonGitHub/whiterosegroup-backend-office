import mongoose, { Schema } from 'mongoose';
import { PurchaseOrder } from './purchaseOrder.model.js';
import { Remittance } from './remittance.model.js';
function generateAcctStatShortId() {
    const min = 0o100020001000001;
    const max = 99100000000000000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10, '0');
}
;
console.log(generateAcctStatShortId());
const AccountStatementSchema = new Schema({
    acctStatID: { type: String, default: generateAcctStatShortId, unique: true },
    getActiveUserIDonAcctStat: { type: String },
    getUserProfiledFullNameOnAcctStat: { type: String },
    getUserProfiledEmailOnAcctStat: { type: String },
    getUserProfiledPhoneNoOnAcctStat: { type: String },
    getPurchaseOrderCreationDate: { type: Date },
    accountStatPurchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    getPurchaseOrderRemarks: { type: String },
    getOpeningBalOnDRColumn: { type: Number },
    remittanceCRDetails: [{
            getRemittanceForWhichPurchaseOrderID: { type: Schema.Types.ObjectId, ref: 'Remittance', required: true },
            getRemittedAmountDate: { type: Date, required: true },
            getRemittanceTransactionRemarks: { type: String, required: true },
            getRemittedAmountCR: { type: Number },
            getRemittedBalanceToBePaid: { type: Number }
        }],
    getOpeningBalValue: { type: Number },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.accountStatPurchaseOrder) {
            const getAcctStatInfo = await PurchaseOrder.findById(this.accountStatPurchaseOrder).exec();
            if (getAcctStatInfo) {
                this.getActiveUserIDonAcctStat = getAcctStatInfo.pOrderForActiveUserID;
                this.getUserProfiledFullNameOnAcctStat = getAcctStatInfo.pOrderUserProfileFullName;
                this.getUserProfiledEmailOnAcctStat = getAcctStatInfo.pOrderUserProfileEmail;
                this.getUserProfiledPhoneNoOnAcctStat = getAcctStatInfo.pOrderUserProfilePhoneNo;
                this.getPurchaseOrderCreationDate = getAcctStatInfo.createdAt;
                this.getPurchaseOrderRemarks = 'Opening Balance | Purchase Order ID:' + '' + getAcctStatInfo.purchaseOrderId;
                this.getOpeningBalOnDRColumn = getAcctStatInfo.purchaseOrderNewPriceAlert;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
AccountStatementSchema.pre('save', async function (next) {
    try {
        if (this.remittanceCRDetails && this.remittanceCRDetails.length > 0) {
            for (const remittanceDetail of this.remittanceCRDetails) {
                const remittanceInfo = await Remittance.findById(remittanceDetail.getRemittanceForWhichPurchaseOrderID).exec();
                if (remittanceInfo) {
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const AccountStatement = mongoose.model('AccountStatement', AccountStatementSchema);
export { AccountStatement };
