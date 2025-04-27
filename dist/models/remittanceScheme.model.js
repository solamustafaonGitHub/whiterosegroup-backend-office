import mongoose, { Schema } from 'mongoose';
import { UserScheme } from './userScheme.model.js';
import { PaymentClass } from './paymentClass.model.js';
import { generateCombinedRemittanceShortId } from '../utils/generateCombinedRemittanceShortId.utils.js';
import { EventEmitter } from 'events';
const eventBus = new EventEmitter();
;
const remittanceSchemeSchema = new Schema({
    remittanceOnSchemeID: { type: String, unique: true, default: generateCombinedRemittanceShortId() },
    remittanceForWhichUserSchemeTransID: { type: Schema.Types.ObjectId, required: true, ref: 'UserScheme' },
    createdAt: { type: Date, default: Date.now, required: true },
    remittanceOnSchemeDate: { type: Date, default: Date.now, required: true },
    remittanceForWhichSchemeID: { type: String },
    remittanceForWhichActiveUserIDWhoSchemed: { type: String },
    remittanceActiveUserFullNameWhoSchemed: { type: String },
    remittanceSchemePhoneNo: { type: String, },
    remittanceSchemeAmount_CR: { type: Number, required: true },
    remittanceSchemeDueBalance: { type: Number },
    remittanceSchemePaymentRefClass: { type: Schema.Types.ObjectId, required: true, ref: 'PaymentClass' },
    remittanceSchemePaymentClass: { type: String },
    remittanceSchemeRemarks: { type: String, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
remittanceSchemeSchema.pre('save', function (next) {
    if (!this.remittanceOnSchemeID || this.remittanceOnSchemeID.trim() === '') {
        return next(new Error('Remittance Scheme Reference ID is required. Please ensure a valid Remittance Reference Scheme ID is generated.'));
    }
    next();
});
remittanceSchemeSchema.pre('save', async function (next) {
    try {
        if (this.remittanceSchemePaymentRefClass) {
            const paymentClass = await PaymentClass.findById(this.remittanceSchemePaymentRefClass).exec();
            if (paymentClass) {
                this.remittanceSchemePaymentClass = paymentClass.paymentClassName;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
remittanceSchemeSchema.pre('save', async function (next) {
    try {
        if (this.remittanceForWhichUserSchemeTransID) {
            const userSchemeOrder = await UserScheme.findById(this.remittanceForWhichUserSchemeTransID).exec();
            if (userSchemeOrder) {
                this.remittanceForWhichSchemeID = userSchemeOrder.userSchemeTransactionID;
                this.remittanceForWhichActiveUserIDWhoSchemed = userSchemeOrder.userIdRequiringScheme;
                this.remittanceActiveUserFullNameWhoSchemed = userSchemeOrder.userFullNameRequiringScheme;
                this.remittanceSchemePhoneNo = userSchemeOrder.userPhoneNoRequiringScheme;
                const totalRemittanceMadeSoFarOnSchemeHistory = userSchemeOrder.TotalRemittanceMadeSoFar || [];
                const TotalRemittanceMadeSoFar = userSchemeOrder.TotalRemittanceMadeSoFar || [];
                const lastTotalRemittance = TotalRemittanceMadeSoFar.length > 0
                    ? TotalRemittanceMadeSoFar[TotalRemittanceMadeSoFar.length - 1].TotalPaymentsMadeSoFar
                    : userSchemeOrder.amountdDepositedForSchemeByUser;
                const RemittanceBalanceToBePaidDetails = userSchemeOrder.RemittanceBalanceToBePaidDetails || [];
                const lastBalance = RemittanceBalanceToBePaidDetails.length > 0
                    ? RemittanceBalanceToBePaidDetails[RemittanceBalanceToBePaidDetails.length - 1].endingBalanceAfterLastRemittanceOnScheme
                    : userSchemeOrder.initialSchemeBalance;
                const remittanceAmount = this.remittanceSchemeAmount_CR;
                const newBalance = lastBalance + remittanceAmount;
                totalRemittanceMadeSoFarOnSchemeHistory.push({
                    remitDateOnScheme: new Date(),
                    remittedSchemeDate: new Date(),
                    remittedSchemeAmount: remittanceAmount,
                    remittedSchemeRemarks: `Remittance of ${remittanceAmount}`,
                    TotalPaymentsMadeSoFar: (Number(lastTotalRemittance) + remittanceAmount).toString(),
                });
                RemittanceBalanceToBePaidDetails.push({
                    remitOnSchemeDate: new Date(),
                    remittanceExpectedBalToBePaidOnScheme: lastBalance,
                    remitOnSchemeRemarks: `Payment Update for Remittance On Sheme ID: ${this.remittanceForWhichSchemeID}`,
                    remittedAmountCROnScheme: remittanceAmount,
                    endingBalanceAfterLastRemittanceOnScheme: newBalance,
                    remitDateOnScheme: undefined,
                    isRemittanceForSchemeFirstPayment: undefined,
                });
                userSchemeOrder.TotalRemittanceMadeSoFar = TotalRemittanceMadeSoFar;
                userSchemeOrder.RemittanceBalanceToBePaidDetails = RemittanceBalanceToBePaidDetails;
                await userSchemeOrder.save();
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const RemitOnScheme = mongoose.model('RemittanceOnScheme', remittanceSchemeSchema);
export { RemitOnScheme, remittanceSchemeSchema };
