import mongoose, { Schema, model } from 'mongoose';
import { ActiveSubscriber } from './activeSubscriber.model.js';
import generateWalletTransactionsShortId from '../utils/generateWalletTransactionsShortId.utils.js';
;
const NairaWalletBalanceSchema = new Schema({
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
NairaWalletBalanceSchema.pre('save', function (next) {
    if (!this.nairaWalletTransactionID) {
        this.nairaWalletTransactionID = generateWalletTransactionsShortId();
    }
    next();
});
NairaWalletBalanceSchema.pre('save', async function (next) {
    const wallet = this;
    try {
        if (!mongoose.Types.ObjectId.isValid(wallet.nairaWalletOwner)) {
            return next(new Error(`Invalid ObjectId format for nairaWalletOwner: ${wallet.nairaWalletOwner}`));
        }
        const userWalletOwner = await ActiveSubscriber.findById(wallet.nairaWalletOwner).exec();
        if (!userWalletOwner) {
            return next(new Error(`Active Subscriber with ID ${wallet.nairaWalletOwner} not found.`));
        }
        wallet.nairaWalletID = userWalletOwner.activeSubscriberNairaWalletID;
        wallet.nairaWalletOwnerFullName = `${userWalletOwner.activeSubscriberFirstName} ${userWalletOwner.activeSubscriberMiddleName} ${userWalletOwner.activeSubscriberLastName}`;
        wallet.nairaWalletOwnerEmail = userWalletOwner.activeSubscriberEmail;
        wallet.nairaWalletOwnerPhoneNumber = userWalletOwner.activeSubscriberPhoneNo;
        next();
    }
    catch (error) {
        next(error);
    }
});
NairaWalletBalanceSchema.pre('save', async function (next) {
    const wallet = this;
    try {
        if (!mongoose.Types.ObjectId.isValid(wallet.nairaWalletOwner)) {
            return next(new Error(`Invalid ObjectId format for nairaWalletOwner: ${wallet.nairaWalletOwner}`));
        }
        const userWalletOwner = await ActiveSubscriber.findById(wallet.nairaWalletOwner).exec();
        if (!userWalletOwner) {
            return next(new Error(`Active Subscriber with ID ${wallet.nairaWalletOwner} not found.`));
        }
        const lastWalletEntry = await NairaWalletBalance.findOne({ nairaWalletOwner: wallet.nairaWalletOwner })
            .sort({ createdAt: -1 })
            .select('nairaWalletClosingBalance');
        let previousBalance = lastWalletEntry ? lastWalletEntry.nairaWalletClosingBalance : 0;
        let newClosingBalance = previousBalance;
        if (wallet.depositFundsToNairaWallet)
            newClosingBalance += wallet.depositFundsToNairaWallet;
        if (wallet.withdrawFundsFromNairaWallet) {
            if (wallet.withdrawFundsFromNairaWallet > previousBalance) {
                return next(new Error('Insufficient funds in wallet!'));
            }
            newClosingBalance -= wallet.withdrawFundsFromNairaWallet;
        }
        wallet.nairaWalletClosingBalance = newClosingBalance;
        wallet.lastUpdatedAt = new Date();
        next();
    }
    catch (error) {
        next(error);
    }
});
const NairaWalletBalance = model('NairaWalletBalance', NairaWalletBalanceSchema);
export { NairaWalletBalance };
