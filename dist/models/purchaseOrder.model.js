import mongoose, { Schema } from 'mongoose';
import { ActiveUser } from "./activeUser.model.js";
import { ItemInformation } from "./itemInformation.model.js";
function generatePOrderShortId() {
    const min = 1000200010;
    const max = 9999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10, '0');
}
console.log(generatePOrderShortId());
const purchaseOrderSchema = new Schema({
    purchaseOrderId: { type: String, default: generatePOrderShortId, unique: true },
    createdAt: { type: Date, default: Date.now },
    pOrderForActiveUserRefID: { type: Schema.Types.ObjectId, ref: 'ActiveUser', required: true },
    pOrderForActiveUserID: { type: String },
    pOrderUserProfileFullName: { type: String },
    pOrderUserProfilePhoneNo: { type: String },
    pOrderUserProfileEmail: { type: String },
    purchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
    purchaseOrderIntentItemCode: { type: String },
    purchaseOrderIntentItemName: { type: String },
    purchaseOrderIntentDesc: { type: String },
    purchaseOrderAssetSubscType: { type: Schema.Types.ObjectId, ref: 'SubscriptionType', required: true },
    PriceChangeOnPOHistoryDetails: [{
            priceChangeOnPODate: { type: Date },
            priceChangeOnPORemarks: { type: String },
            newPriceAmountOnPO: { type: Number }
        }],
    purchaseOrderCurrentPrice: { type: Number },
    purchaseOrderNewPriceAlert: { type: Number },
    purchaseOrderPriceReverseAlertDetails: [{
            purchaseOrderReverseDate: { type: Date },
            purchaseOrderReverseNewPriceAlertRemarks: { type: String },
            purchaseOrderReverseNewPriceAlert: { type: Number }
        }],
    remittanceUpdateDetails: [{
            remitDateOnPO: Date,
            remittanceExpectedBalToBePaidOnPO: { type: Number },
            remittanceUpdateRemarksOnPO: { type: String },
            remittedAmountCROnPO: { type: Number },
            endingBalanceAfterLastRemittance: { type: Number }
        }],
    lastUpdatedAt: { type: Date, default: Date.now }
});
purchaseOrderSchema.pre('save', async function (next) {
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
    }
    catch (error) {
        next(error);
    }
});
purchaseOrderSchema.pre('save', async function (next) {
    try {
        if (this.purchaseOrderIntent) {
            const itemDetails = await ItemInformation.findById(this.purchaseOrderIntent);
            if (itemDetails) {
                this.purchaseOrderIntentItemCode = itemDetails.itemInformationCode;
                this.purchaseOrderIntentItemName = itemDetails.itemInformationName;
                this.purchaseOrderIntentDesc = itemDetails.itemInformationDescription;
            }
            const firstPriceOnPO = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];
            this.purchaseOrderCurrentPrice = firstPriceOnPO?.itemInformationCurrentMktPrice || itemDetails.itemInformationMktStartPrice;
            if (this.PriceChangeOnPOHistoryDetails.length === 0) {
                const firstBalanceOnPO = {
                    priceChangeOnPODate: this.createdAt,
                    priceChangeOnPORemarks: 'Opening Balance | Purchase Order ID: ' + this.purchaseOrderId + ' ' + '(Item ID:' + this.purchaseOrderIntentItemCode + ' || ' + this.purchaseOrderIntentItemName + ')',
                    newPriceAmountOnPO: this.purchaseOrderCurrentPrice
                };
                this.PriceChangeOnPOHistoryDetails.push(firstBalanceOnPO);
                if (itemDetails.itemInformationPriceUpdateDetails && itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                    const POPriceAtBooking = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];
                    if (POPriceAtBooking) {
                        this.purchaseOrderCurrentPrice = POPriceAtBooking.itemInformationCurrentMktPrice;
                    }
                    else {
                        console.warn("ItemInformation", itemDetails._id, "has no price updates");
                    }
                }
                else {
                    console.warn("ItemInformation", itemDetails._id, "has no price update details");
                }
                if (itemDetails.itemInformationPriceUpdateDetails && itemDetails.itemInformationPriceUpdateDetails.length > 0) {
                    const latestPriceUpdate = itemDetails.itemInformationPriceUpdateDetails.slice(-1)[0];
                    if (latestPriceUpdate) {
                        this.purchaseOrderNewPriceAlert = latestPriceUpdate.itemInformationCurrentMktPrice;
                    }
                    else {
                        console.warn("ItemInformation", itemDetails._id, "has no price updates");
                    }
                }
                else {
                    console.warn("ItemInformation", itemDetails._id, "has no price update details");
                }
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export { PurchaseOrder };
