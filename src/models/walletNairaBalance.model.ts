//model/nairaWallet.model.ts
import mongoose, {Schema, Document, model, Types} from 'mongoose';
import {ActiveSubscriber} from './activeSubscriber.model.js';

import generateWalletTransactionsShortId from '../utils/generateWalletTransactionsShortId.utils.js';
import formatCurrency from '../utils/formatCurrency.utils.js';
import session from 'express-session';

//Define the interface for the walletNairaBalance model
interface INairaWalletBalance extends Document {
    nairaWalletOwner: mongoose.Types.ObjectId;
    nairaWalletID: string;
    nairaWalletTransactionID: string;
    nairaWalletOwnerFullName: string;
    nairaWalletOwnerEmail: string;
    nairaWalletOwnerPhoneNumber: string;
    nairaWalletCurrency: string;
    nairaWalletOpeningBalance: number;
    depositFundsToNairaWallet: number;
    withdrawFundsFromNairaWallet: number;
    nairaWalletTransactionRemarks: string;
    nairaWalletClosingBalance: number;
    createdAt: Date;
    lastUpdatedAt: Date;
};

//Define the NairaWalletBalance Schema
const NairaWalletBalanceSchema = new Schema<INairaWalletBalance>({
    nairaWalletOwner: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
    nairaWalletID: {type:String},
    nairaWalletTransactionID: {type:String, unique:true, default:generateWalletTransactionsShortId},
    nairaWalletOwnerFullName: {type:String},
    nairaWalletOwnerEmail: {type:String},
    nairaWalletOwnerPhoneNumber: {type:String},
    nairaWalletCurrency: {type:String, default:'NGN'},
    nairaWalletOpeningBalance: {type:Number, default:0},
    depositFundsToNairaWallet: {type:Number, default:0},
    withdrawFundsFromNairaWallet: {type:Number, default:0},
    nairaWalletTransactionRemarks: {type:String, required:true},
    nairaWalletClosingBalance: {type:Number, default:0},
    createdAt: {type:Date, required:true, default:Date.now},
    lastUpdatedAt: {type:Date, required:true, default:Date.now}
});

//Pre-save hook to ensure nairaWalletTransactionID is generated and valid
NairaWalletBalanceSchema.pre<INairaWalletBalance>('save', function (next) {
    if (!this.nairaWalletTransactionID) {
        this.nairaWalletTransactionID = generateWalletTransactionsShortId();
    }
    next();
});

//Pe-save hook to set nairaWalletOwnerFullName, nairaWalletOwnerEmail, nairaWalletOwnerPhoneNumber each time there is a change in the nairaWalletOwner
NairaWalletBalanceSchema.pre('save', async function (next) {
    const wallet = this as INairaWalletBalance; // Reference to the document being saved
    try {
        // Step 1: Validate and find Active Subscriber
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
    } catch (error) {
        next(error);
    }
});


//Pre-save hook to set the nairaWalletClosingBalance each time there is a change in the deposit or withdrawal amounts
NairaWalletBalanceSchema.pre('save', async function (next) {
    const wallet = this as INairaWalletBalance; // Reference to the document being saved
    try {
        //Step 1: Validate and find Active Subscriber
        if (!mongoose.Types.ObjectId.isValid(wallet.nairaWalletOwner)) {
            return next(new Error(`Invalid ObjectId format for nairaWalletOwner: ${wallet.nairaWalletOwner}`));
        }
        const userWalletOwner = await ActiveSubscriber.findById(wallet.nairaWalletOwner).exec();
        if (!userWalletOwner) {
            return next(new Error(`Active Subscriber with ID ${wallet.nairaWalletOwner} not found.`));
        }

        //Step 2: Fetch last wallet balance
        const lastWalletEntry = await NairaWalletBalance.findOne({nairaWalletOwner:wallet.nairaWalletOwner})
            .sort({createdAt:-1})
            .select('nairaWalletClosingBalance');

        let previousBalance = lastWalletEntry ? lastWalletEntry.nairaWalletClosingBalance : 0;
        let newClosingBalance = previousBalance;

        //Step 3: Process deposits and withdrawals
        if (wallet.depositFundsToNairaWallet) newClosingBalance += wallet.depositFundsToNairaWallet;
        if (wallet.withdrawFundsFromNairaWallet) {
            if (wallet.withdrawFundsFromNairaWallet > previousBalance) {
                return next(new Error('Insufficient funds in wallet!'));
            }
            newClosingBalance -= wallet.withdrawFundsFromNairaWallet;
        }
        //Step 4: Update balance and timestamps
        wallet.nairaWalletClosingBalance = newClosingBalance;
        wallet.lastUpdatedAt = new Date();

        next();
    } catch (error) {
        next(error);
    }
});


//Register the NairaWalletBalance model
const NairaWalletBalance = model<INairaWalletBalance>('NairaWalletBalance', NairaWalletBalanceSchema);
export {NairaWalletBalance, INairaWalletBalance};