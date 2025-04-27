import mongoose, { Schema } from 'mongoose';
import { ActiveSubscriber } from '../models/activeSubscriber.model.js';
import generateWalletTransactionsShortId from '../utils/generateWalletTransactionsShortId.utils.js';
;
const NairaWalletSchema = new Schema({
    nairaWalletOwner: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
    nairaWalletID: { type: String },
    nairaWalletTransactionID: { type: String, unique: true, default: generateWalletTransactionsShortId },
    nairaWalletOwnerFullName: { type: String },
    nairaWalletOwnerEmail: { type: String },
    nairaWalletOwnerPhoneNumber: { type: String },
    nairaWalletCurrency: { type: String, default: 'NGN' },
    nairaWalletOpeningBalance: { type: Number, default: 0 },
    depositFundsToNairaWallet: { type: Number, default: 0 },
    withdrawFundsFromNairaWallet: { type: Number, default: 0 },
    nairaWalletTransactionRemarks: { type: String, required: true },
    nairaWalletClosingBalance: { type: Number, default: 0 },
    createdAt: { type: Date, required: true, default: Date.now },
    lastUpdatedAt: { type: Date, required: true, default: Date.now }
});
NairaWalletSchema.pre('save', function (next) {
    if (!this.nairaWalletTransactionID) {
        this.nairaWalletTransactionID = generateWalletTransactionsShortId();
    }
    next();
});
NairaWalletSchema.pre('save', async function (next) {
    try {
        console.log("🔍 Pre-save Hook Running...");
        if (this.nairaWalletOwner) {
            const userWalletOwner = await ActiveSubscriber.findById(this.nairaWalletOwner).exec();
            if (userWalletOwner) {
                this.nairaWalletID = userWalletOwner.activeSubscriberNairaWalletID;
                this.nairaWalletOwnerFullName = `${userWalletOwner.activeSubscriberFirstName} ${userWalletOwner.activeSubscriberMiddleName || ''} ${userWalletOwner.activeSubscriberLastName}`.trim();
                this.nairaWalletOwnerEmail = userWalletOwner.activeSubscriberEmail;
                this.nairaWalletOwnerPhoneNumber = userWalletOwner.activeSubscriberPhoneNo;
            }
        }
        const lastTransaction = await NairaWallet
            .findOne({ nairaWalletOwner: this.nairaWalletOwner })
            .sort({ createdAt: -1 })
            .exec();
        let previousClosingBalance = lastTransaction ? lastTransaction.nairaWalletClosingBalance || 0 : 0;
        const deposit = Math.abs(this.depositFundsToNairaWallet || 0);
        const withdrawal = Math.abs(this.withdrawFundsFromNairaWallet || 0);
        const newClosingBalance = previousClosingBalance + deposit - withdrawal;
        this.set('nairaWalletClosingBalance', newClosingBalance);
        console.log(`✅ New Closing Balance: ${this.nairaWalletClosingBalance}`);
        next();
    }
    catch (error) {
        console.log('❌ Error in Pre-Save Hook:', error);
        next(error);
    }
});
const NairaWallet = mongoose.model('NairaWallet', NairaWalletSchema);
export { NairaWallet };
