import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import session from 'express-session';
import mongoose, { Schema } from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import connectMongoDBSession from 'connect-mongodb-session';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { Components, componentLoader } from './components.js';
import { AccountHolder } from './models/accountHolder.model.js';
import { ActiveUser } from './models/activeUser.model.js';
import { ItemCategory } from "./models/itemCategory.model.js";
import { ItemType } from './models/itemType.model.js';
import { ItemSubType } from './models/itemSubType.model.js';
import { ItemBrand } from './models/itemBrand.model.js';
import { ItemInformation } from "./models/itemInformation.model.js";
import { UpdateItemPrice } from './models/updateItemPrice.model.js';
import { ProfiledPartner } from './models/profiledPartner.model.js';
import { SubscriptionType } from './models/subscriptionType.model.js';
import { PurchaseOrder } from './models/purchaseOrder.model.js';
import { PaymentClass } from './models/paymentClass.model.js';
import { Remittance } from './models/remittance.model.js';
import { AccountStatement } from './models/accountStatement.model.js';
import { getUserProfiles } from './routes/getUserProfiles.route.js';
const PORT = 3012;
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});
const DEFAULT_ADMIN = {
    email: 'admin@assets360nigeria.com',
    password: 'MultiplierEffect1000%',
};
const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};
const start = async () => {
    const app = express();
    app.use(express.static(path.join(__dirname, "../public")));
    const mongooseDB = await mongoose.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360');
    const MongoDBStore = connectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri: 'mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360',
        collection: 'session'
    });
    sessionStore.on('error', (error) => {
        console.error('MongoDB Session Store Error:', error);
    });
    const dashboardHandler = async () => {
        try {
            await mongoose.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360');
            const accountHolderModel = mongoose.model('AccountHolder', new mongoose.Schema({
                accountHolderPhoneNo: String,
                accountHolderEmail: String,
                accountHolderPassword: String,
                accountHolderConfirmPassword: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const activeUserModel = mongoose.model('ActiveUser', new mongoose.Schema({
                activeUserUserID: String,
                activeUserUserPhoneRefNo: { type: Schema.Types.ObjectId, ref: 'AccountHolder' },
                activeUserUserFirstName: String,
                activeUserUserLastName: String,
                activeUserUserEmail: String,
                activeUserPhoneNo: String,
                activeUserGender: String,
                activeUserDOB: String,
                activeserWorkStatus: String,
                activeUserSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
                nonProfiledCompanyName: String,
                nonProfiledWorkAddress: String,
                activeUserAssetDeliveryAddress: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const itemCategoryModel = mongoose.model('ItemCategory', new mongoose.Schema({
                itemCategoryName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const itemTypeModel = mongoose.model('ItemType', new mongoose.Schema({
                itemTypeName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const itemSubTypeModel = mongoose.model('ItemSubType', new mongoose.Schema({
                itemSubTypeName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const itemBrandModel = mongoose.model('ItemBrand', new mongoose.Schema({
                itemBrandName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const itemInformationModel = mongoose.model('ItemInformation', new mongoose.Schema({
                itemInformationID: { type: String },
                itemInformationCode: { type: String, required: true },
                itemInformationName: { type: String, required: true },
                itemInformationCategory: { type: Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
                itemInformationBrand: { type: Schema.Types.ObjectId, ref: 'ItemBrand', required: true },
                itemInformationType: { type: Schema.Types.ObjectId, ref: 'ItemType', required: true },
                itemInformationSubType: { type: Schema.Types.ObjectId, ref: 'ItemSubType', required: true },
                itemInformationDescription: { type: String, required: true },
                itemInformationImage: { type: String },
                itemInformationMktStartPrice: {
                    type: Number,
                    virtual: true,
                    get(price) {
                        const iteminfocurmktprice = this.itemInformationCurrentMktPrice;
                        if (!iteminfocurmktprice)
                            return null;
                        return `₦<span class="math-inline">${price.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, ',')}</span>`;
                    }
                },
                itemInformationCurrentMktPrice: { typw: Number },
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now }
            }));
            const updateItemPriceModel = mongoose.model('UpdateItemPrice', new mongoose.Schema({
                itemToBeUpdatedRefID: { type: mongoose.Types.ObjectId, ref: 'ItemInformation', required: true },
                itemToBeUpdatedID: { type: String, required: true },
                itemToBeupdatedDisplayName: String,
                itemToBeUppdatedDisplayItemCode: String,
                itemToBeUpdatedDisplayItemDesc: String,
                itemToBeUpdatedStartPrice: Number,
                updatedItemNewPriceByInflation: Number,
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now },
                itemInformationPriceUpdateDetails: [{
                        itemInformationTranDateForNewPriceUpdate: { type: Date },
                        itemInformationNewPriceUpdateRemarks: { type: String },
                        itemInformationCurrentMktPrice: { type: Number }
                    }]
            }));
            const profiledPartnerModel = mongoose.model('ProfiledPartner', new mongoose.Schema({
                profiledPartnerName: String,
                profiledPartnerType: String,
                profiledPartnerSubType: String,
                profiledPartnerOfficeAdd: String,
                profiledPartnerPayDay: Number,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const subscriptionTypeModel = mongoose.model('SubscriptionType', new mongoose.Schema({
                subscTypeName: String,
                subscTypeDesc: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const purchaseOrderModel = mongoose.model('PurchaseOrder', new mongoose.Schema({
                purchaseOrderId: String,
                createdAt: Date,
                pOrderForActiveUserRefID: { type: mongoose.Types.ObjectId, ref: 'ActiveUser' },
                pOrderForActiveUserID: String,
                pOrderUserProfileFullName: String,
                pOrderUserProfilePhoneNo: String,
                pOrderUserProfileEmail: String,
                purchaseOrderIntent: { type: mongoose.Types.ObjectId, ref: 'ItemInformation', path: '', select: 'itemInformationName' },
                purchaseOrderIntentItemCode: String,
                purchaseOrderIntentItemName: String,
                purchaseOrderIntentDesc: String,
                purchaseOrderAssetSubscType: { type: mongoose.Types.ObjectId },
                PriceChangeOnPOHistoryDetails: [{
                        priceChangeOnPODate: { type: Date },
                        priceChangeOnPORemarks: { type: String },
                        newPriceAmountOnPO: { type: Number }
                    }],
                purchaseOrderCurrentPrice: Number,
                purchaseOrderNewPriceAlert: Number,
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
                lastUpdatedAt: Date
            }));
            const paymentClassModel = mongoose.model('PaymentClass', new mongoose.Schema({
                paymentClassName: String,
                paymentClassDesc: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const remittanceModel = mongoose.model('Remittance', new mongoose.Schema({
                remittanceReferenceID: String,
                createdAt: Date,
                remittanceDate: Date,
                remittanceForWhichPurchaseOrderRefID: { type: mongoose.Types.ObjectId, ref: 'PurchaseOrder' },
                remittanceForWhichPurchaseOrderID: String,
                remittanceForWhichActiveUserID: String,
                remittanceActiveUserFullName: String,
                remittancePOPhoneNo: String,
                remittanceDueOpeningAmount: Number,
                remittanceAmount_CR: Number,
                remittanceDueBalance: Number,
                remittancePaymentRefClass: { type: mongoose.Types.ObjectId, ref: 'PaymentClass' },
                remittancePaymentClass: String,
                remittanceRemarks: String,
                lastUpdatedAt: Date
            }));
            const accountStatementModel = mongoose.model('AccountStatement', new mongoose.Schema({
                acctStatID: String,
                getActiveUserIDonAcctStat: String,
                getUserProfiledFullNameOnAcctStat: String,
                getUserProfiledEmailOnAcctStat: String,
                getUserProfiledPhoneNoOnAcctStat: String,
                accountStatPurchaseOrder: String,
                getPurchaseOrderCreationDate: Date,
                getPurchaseOrderRemarks: String,
                getOpeningBalOnDRColumn: Number,
                remittanceCRDetails: [{ getRemittanceForWhichPurchaseOrderID: mongoose.Types.ObjectId },
                    { getRemittedAmountDate: Date,
                        getRemittanceTransactionRemarks: String,
                        getremittedAmountCR: Number,
                        getremittedBalanceToBePaid: Number
                    }],
                getOpeningBalValue: Number,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const accountHolderData = await accountHolderModel.find({}).exec();
            const activeUserData = await activeUserModel.find({})
                .populate({ model: 'AccountHolder', path: '', select: 'accountHolderPhoneNo' })
                .populate({ model: 'ProfiledPartner', path: '', select: 'profiledPartnerName' })
                .exec();
            const itemCategoryData = await itemCategoryModel.find({}).exec();
            const itemTypeData = await itemTypeModel.find({}).exec();
            const itemSubTypeData = await itemSubTypeModel.find({}).exec();
            const itemBrandData = await itemBrandModel.find({}).exec();
            const itemInformationData = await itemInformationModel.find({})
                .populate({ model: 'ItemCategory', path: '', select: 'itemCategoryName' })
                .populate({ model: 'ItemType', path: '', select: 'itemTypeName' })
                .populate({ model: 'ItemSubType', path: '', select: 'itemBrandName' })
                .populate({ model: 'ItemBrand', path: '', select: 'itemBrandName' })
                .exec();
            const updateItemPriceData = await updateItemPriceModel.find({})
                .populate({ model: 'ItemInformation', path: '', select: 'itemInformationName' })
                .exec();
            const profiledPartnerData = await profiledPartnerModel.find({}).exec();
            const subscriptionTypeData = await subscriptionTypeModel.find({}).exec();
            const purchaseOrderData = await purchaseOrderModel.find({})
                .populate({ model: 'ActiveUser', path: '', select: 'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName' })
                .populate('Item')
                .populate('SubcriptionType')
                .exec();
            console.log(purchaseOrderData);
            const paymentClassData = await paymentClassModel.find({}).exec();
            const remittanceData = await remittanceModel.find({})
                .populate({ path: '', model: 'PurchaseOrder', select: 'purchaseOrderId' })
                .populate({ path: '', model: 'PaymentClass', select: 'paymentClassName' })
                .exec();
            function structureAccountStatementData(accountStatement) {
                const tableData = [];
                tableData.push({
                    transactionDate: accountStatement.getPurchaseOrderCreationDate,
                    transactionRemarks: accountStatement.getPurchaseOrderRemarks,
                    dr: accountStatement.getOpeningBalOnDRColumn,
                    cr: 0,
                    balance: accountStatement.getOpeningBalValue,
                });
                if (accountStatement.remittanceCRDetails && accountStatement.remittanceCRDetails.length > 0) {
                    for (const remittanceDetail of accountStatement.remittanceCRDetails) {
                        tableData.push({
                            transactionDate: remittanceDetail.getRemittedAmountDate,
                            transactionRemarks: remittanceDetail.getRemittanceTransactionRemarks,
                            dr: 0,
                            cr: remittanceDetail.getRemittedAmountCR,
                            balance: calculateBalance(tableData, remittanceDetail.getRemittedAmountCR),
                        });
                    }
                }
                return tableData;
            }
            function calculateBalance(tableData, remittanceAmount) {
                let runningBalance = 0;
                for (const data of tableData) {
                    runningBalance += data.cr - data.dr;
                }
                return runningBalance + remittanceAmount;
            }
            return {
                itemCategoryData, itemTypeData, itemSubTypeData, itemBrandData, itemInformationData, updateItemPriceData, structureAccountStatementData,
                profiledPartnerData, subscriptionTypeData, accountHolderData, activeUserData, purchaseOrderData, paymentClassData, remittanceData
            };
        }
        catch (error) {
            console.error('Error Fetching Data from MongoDB:', error);
            return { error: 'An error occurred while fetching ProductBrand data from the database' };
        }
        finally {
            await mongoose.disconnect();
        }
    };
    const businessNavigation = { name: 'Business Profile', icon: 'transaction' };
    const customersNavigation = { name: 'Customers Profile', icon: 'customer' };
    const itemsNavigation = { name: 'Item Profile', icon: 'item' };
    const realEstateNavigation = { name: 'Real Estate Profile', icon: 'properties' };
    const transactionsNavigation = { name: 'Transaction Profile', icon: 'payment' };
    const admin = new AdminJS({
        databases: [mongooseDB],
        rootPath: '/admin',
        assets: { styles: ["/sidebar.css"] },
        resources: [
            { resource: ProfiledPartner, options: { navigation: businessNavigation, id: 'ProfiledPartner', search: { type: String, isVisible: { filter: true } } } },
            { resource: SubscriptionType, options: { navigation: businessNavigation, id: 'SubscriptionType', search: { type: String, isVisible: { filter: true } } } },
            { resource: PaymentClass, options: { navigation: businessNavigation, id: 'PaymentClass', search: { type: String, isVisible: { filter: true } } } },
            { resource: AccountHolder, options: { navigation: customersNavigation, id: 'AccountHolder', search: { type: String, isVisible: { filter: true } } } },
            { resource: ActiveUser, options: { navigation: customersNavigation, id: 'ActiveUser', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemCategory, options: { navigation: itemsNavigation, id: 'ItemCategory', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemBrand, options: { navigation: itemsNavigation, id: 'ItemBrand', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemType, options: { navigation: itemsNavigation, id: 'ItemType', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemSubType, options: { navigation: itemsNavigation, id: 'ItemSubType', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemInformation, options: { navigation: itemsNavigation, id: 'ItemInformation', search: { type: String, isVisible: { filter: true } } } },
            { resource: UpdateItemPrice, options: { navigation: itemsNavigation, id: 'UpdateItemPrice', search: { type: String, isVisible: { filter: true } } } },
            { resource: PurchaseOrder, options: { navigation: transactionsNavigation, id: 'PurchaseOrder', search: { type: String, isVisible: { filter: true } } } },
            { resource: Remittance, options: { navigation: transactionsNavigation, id: 'Remittance', search: { type: String, isVisible: { filter: true } } } },
            { resource: AccountStatement, options: { navigation: transactionsNavigation, id: 'AccountStatement', search: { type: String, isVisible: { filter: true } } } },
        ],
        dashboard: { component: Components.Dashboard, handler: dashboardHandler },
        componentLoader
    });
    admin.watch();
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret',
    }, null, {
        store: sessionStore,
        resave: true,
        saveUninitialized: true,
        secret: 'sessionsecret',
        cookie: {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
        },
        name: 'adminjs',
    });
    app.use(admin.options.rootPath, adminRouter);
    app.get('/api/userfullprofile', getUserProfiles);
    app.listen(PORT, () => {
        console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
    });
};
start();
function insertNewUpdateItemPrice() {
    throw new Error('Function not implemented.');
}
