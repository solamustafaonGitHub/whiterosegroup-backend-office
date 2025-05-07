import AdminJS, { ComponentLoader } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import mongoose, { Schema } from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import connectMongoDBSession from 'connect-mongodb-session';
import session from 'express-session';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { AccountSubscriber } from './models/accountSubscriber.model.js';
import { ActiveSubscriber } from './models/activeSubscriber.model.js';
import { ItemCategory } from "./models/itemCategory.model.js";
import { ItemType } from './models/itemType.model.js';
import { ItemSubType } from './models/itemSubType.model.js';
import { ItemBrand } from './models/itemBrand.model.js';
import { ItemInformation } from "./models/itemInformation.model.js";
import { SchemeInformation } from './models/schemeInformationProfile.model.js';
import { UOM } from './models/uom.model.js';
import { ProfiledPartner } from './models/profiledPartner.model.js';
import { SubscriptionType } from './models/subscriptionType.model.js';
import { PaymentClass } from './models/paymentClass.model.js';
import { ECommerceProfile } from './models/eCommerceProfile.model.js';
import { LayAwayPurchaseOrder } from './models/layAwayPurchaseOrder.model.js';
import { StandardPurchaseOrder } from './models/standardPurchaseOrder.model.js';
import { UserScheme } from './models/userScheme.model.js';
import { Project214Information } from './models/project214Information.model.js';
import { SubscribeToProject214 } from './models/subscribeToProject214.model.js';
import { PaymentPlan } from './models/paymentPlan.model.js';
import { UpdateScheme } from './models/updateScheme.model.js';
import { UpdateItemPrice } from './models/updateItemPrice.model.js';
import { RemittanceOnLayAwayPO } from './models/remittanceOnLayAwayPO.model.js';
import { RemittanceOnStandardPO } from './models/remittanceOnStandardPO.model.js';
import { RemitOnScheme } from './models/remittanceScheme.model.js';
import { NairaWalletBalance } from './models/walletNairaBalance.model.js';
import { getUserProfiles } from './routes/getUserProfiles.route.js';
import schemeInformationRouter from './routes/schemeInformation. route.js';
import lawAwayPurchaseOrderRouter from './routes/layAwayPurchaseOrder.route.js';
import standardPurchaseOrderRouter from './routes/standardPurchaseOrder.route.js';
import userSchemeRouter from './routes/userScheme.route.js';
import Project214Router from './routes/project214.route.js';
import paymentPlanRouter from './routes/paymentPlan.route.js';
import subscribeToProject214Router from './routes/subscribeToPoject214.route.js';
import nairaWalletRouter from './routes/walletNaira.route.js';
import { generateCombinedFOREAShortId } from './utils/generateCombinedFOREAShortId.utils.js';
import { generateCombinedPaymentPlanShortId } from './utils/generateCombinedPaymentPlanShortId.utils.js';
import { generateCombinedRemittanceShortId } from './utils/generateCombinedRemittanceShortId.utils.js';
import generateCombinedPOShortId from './utils/generateCombinedPOShortId.util.js';
import { generateCombinedPropertyID } from './utils/generateCombinedPropertyID.utils.js';
import { generateBlockShortId } from './utils/generateBlockShortId.utils.js';
import { generateHouseShortId } from './utils/generateHouseShortId.utils.js';
import { fetchAvaiilableFractionalUnits } from './utils/fetchAvailableFractionalUnits.utils.js';
import generateActiveUserShortId from './utils/generateActiveSubscriberShortId.utils.js';
import UnitSelectionComponent from './admin/customComponents/UnitSelectionComponent.js';
const PORT = 3017;
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});
const DEFAULT_ADMIN = { email: 'admin@asset360nigeria.com', password: 'MultiplierEffect1000%' };
const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};
const start = async () => {
    const app = express();
    app.use(express.json());
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'pdfs/')));
    const mongooseDB = await mongoose.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360');
    const MongoDBStore = connectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri: 'mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360', collection: 'session'
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
            const activeSubscriberModel = mongoose.model('ActiveSubscriber', new mongoose.Schema({
                activeSubscriberID: { type: String, default: generateActiveUserShortId, unique: true },
                activeSubscriberPhoneRefNo: { type: Schema.Types.ObjectId, ref: 'AccountSubscriber', unique: true, required: true },
                activeSubscriberProfileImage: { type: String },
                activeSubscriberFirstName: { type: String, required: true },
                activeSubscriberMiddleName: { type: String, required: true },
                activeSubscriberLastName: { type: String, required: true },
                activeSubscriberEmail: { type: String },
                activeSubscriberPhoneNo: { type: String, unique: true },
                activeSubscriberGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
                activeSubscriberDOB: { type: Date },
                activeSubscriberWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'SELF-EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
                activeSubscriberSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
                nonProfiledCompanyName: { type: String, required: true },
                nonProfiledWorkAddress: { type: String, required: true },
                activeSubscriberAssetDeliveryAddress: { type: String, required: true },
                activeSubscriberNairaWalletID: { type: String },
                americanUSDWalletID: { type: String },
                britishPoundsWalletID: { type: String },
                marketPlaceID: { type: String },
                createdAt: { type: Date, default: Date.now, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
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
            const unitOfMeasureModel = mongoose.model('UOM', new mongoose.Schema({
                unitofMeasureID: { type: String },
                unitMeaseureName: { type: String },
                unitMeasureShortDesc: String,
                createdAt: { type: Date, default: Date.now, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
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
                itemInformationECommerceProfile: { type: Schema.Types.ObjectId, ref: 'ECommerceProfile', required: true },
                itemInformationECommerceProfileName: { type: String, required: true },
                itemInformationECommerceProfileDisplay: { type: String },
                itemInformationCurrentMktPrice: { type: Number, required: true },
                itemInformationMktStartPrice: {
                    type: Number, virtual: true, get(price) {
                        const iteminfocurmktprice = this.itemInformationCurrentMktPrice;
                        if (!iteminfocurmktprice)
                            return null;
                        return `₦<span class="math-inline">${price.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, ',')}</span>`;
                    },
                },
                itemInformationClassification: { type: String, enum: ['STANDARD', 'PREMIUM', 'LUXURY'], required: true },
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now }
            }));
            const updateItemPriceModel = mongoose.model('UpdateItemPrice', new mongoose.Schema({
                itemToBeUpdatedRefID: { type: mongoose.Types.ObjectId, ref: 'ItemInformation', required: true },
                itemToBeUpdatedID: { type: String, required: true },
                itemToBeupdatedDisplayName: String,
                itemToBeUpdatedDisplayItemCode: String,
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
            const layAwayPurchaseOrderModel = mongoose.model('LayAwayPurchaseOrder', new mongoose.Schema({
                layAwayPurchaseOrderId: { type: String, default: generateCombinedPOShortId, unique: true },
                layAwayPOrderForActiveSubscriberRefID: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
                layAwayPOrderForActiveSubscriberID: { type: String },
                layAwayPOrderUserProfileFullName: { type: String },
                layAwayPOrderUserProfilePhoneNo: { type: String },
                layAwayPOrderUserProfileEmail: { type: String },
                layAwayPOrderUserDeliveryAddress: { type: String },
                layAwayPurchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
                layAwayPurchaseOrderIntentID: { type: String },
                layAwayPurchaseOrderIntentItemCode: { type: String },
                layAwayPurchaseOrderIntentItemName: { type: String },
                layAwayPurchaseOrderIntentDesc: { type: String },
                layAwayPurchaseOrderNoOfUnitBought: { type: Number, required: true },
                layAwayPurchaseOrderUnitOfMeasureRefID: { type: Schema.Types.ObjectId, ref: 'UOM', required: true },
                layAwayPurchaseOrderUnitOfMeasure: { type: String },
                layAwayPurchaseOrderUnitPrice: { type: Number },
                layAwayPurchaseOrderTotalStartPrice: { type: Number },
                layAwayPurchaseOrderAssetSubscTypeRefID: { type: Schema.Types.ObjectId, ref: 'SubscriptionType', required: true },
                layAwayPurchaseOrderAssetSubscType: { type: String },
                layAwayPurchaseOrderNewPriceAlert: { type: Number },
                PriceChangeOnLayAwayPOHistoryDetails: [{
                        priceChangeOnLayAwayPODate: { type: Date, default: Date.now },
                        priceChangeOnLayAwayPORemarks: { type: String },
                        newPriceAmountOnLayAwayPO: { type: Number },
                        priceAdjustmentAppliedOnLayAwayPO: { type: Boolean, default: false }
                    }],
                PriceReverseAlertDetailsOnLayAwayPO: [{
                        layAwayPurchaseOrderReverseOldPrice: { type: Number },
                        layAwayPurchaseOrderReversalID: { type: String, default: generateCombinedPOShortId },
                        layAwayPurchaseOrderReverseDate: { type: Date, default: Date.now },
                        layAwayPurchaseOrderReverseNewPriceAlertRemarks: { type: String },
                        layAwayPurchaseOrderReverseNewPriceAlert: { type: Number }
                    }],
                TotalRemittanceMadeSoFarOnLayAwayPO: [{
                        remitDateOnLayAwayPO: { type: Date, default: Date.now },
                        remittedDateOnLayAwayPO: { type: Date },
                        remittedAmountOnLayAwayPO: { type: Number },
                        remittedRemarksOnLayAwayPO: { type: String },
                        TotalPaymentsMadeSoFarOnLayAwayPO: { type: String }
                    }],
                RemittanceBalanceToBePaidDetailsOnLayAwayPO: [{
                        priceChangeOnLayAwayPODate: { type: Date, default: Date.now },
                        isRemittanceAfterPriceChangeOnLayAwayPO: { type: Boolean },
                        remitDateOnLayAwayPO: { type: Date },
                        remittanceExpectedBalToBePaidOnLayAwayPO: { type: Number },
                        remittanceUpdateRemarksOnLayAwayPO: { type: String },
                        remittedAmountCROnLayAwayPO: { type: Number },
                        endingBalanceAfterLastRemittanceOnLayAwayPO: { type: Number },
                        priceAdjustmentAppliedOnLayAwayPO: { type: Boolean }
                    }],
                createdAt: { type: Date, default: Date.now, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
            }));
            const standardPurchaseOrderModel = mongoose.model('StandardPurchaseOrder', new mongoose.Schema({
                standardPurchaseOrderId: { type: String, default: generateCombinedPOShortId, unique: true },
                createdAt: { type: Date, default: Date.now, required: true },
                standardPOrderForActiveSubscriberRefID: { type: Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
                standardPOrderForActiveSubscriberID: { type: String },
                standardPOrderUserProfileFullName: { type: String },
                standardPOrderUserProfilePhoneNo: { type: String },
                standardPOrderUserProfileEmail: { type: String },
                standardPOrderUserDeliveryAddress: { type: String },
                standardPurchaseOrderAssetSubscType: { type: String, default: 'Outright Purchase' },
                StandardPurchaseOrderItems: [{
                        standardPurchaseOrderCount: { type: Number },
                        standardPurchaseOrderDate: { type: Date, required: true },
                        standardPurchaseOrderIntent: { type: Schema.Types.ObjectId, ref: 'ItemInformation', required: true },
                        standardPurchaseOrderIntentID: { type: String },
                        standardPurchaseOrderIntentItemCode: { type: String },
                        standardPurchaseOrderIntentItemName: { type: String },
                        standardPurchaseOrderIntentDesc: { type: String },
                        standardPurchaseOrderNoOfUnitBought: { type: Number, required: true },
                        standardPurchaseOrderUnitOfMeasureRefID: { type: Schema.Types.ObjectId, ref: 'UOM', required: true },
                        standardPurchaseOrderUnitOfMeasure: { type: String },
                        standardPurchaseOrderUnitPrice: { type: Number },
                        standardPurchaseOrderTotalStartPrice: { type: Number },
                        standardPurchaseOrderNewPriceAlert: { type: Number },
                        PriceChangeOnStandardPOHistoryDetails: [{
                                priceChangeOnStandardPODate: { type: Date, default: Date.now },
                                priceChangeOnStandardPORemarks: { type: String },
                                newUnitPriceAmountOnStandardPO: { type: Number },
                                newTotalPriceAmountOnStandardPO: { type: Number },
                                priceAdjustmentAppliedOnStandardPO: { type: Boolean, default: false }
                            }],
                        PriceReverseAlertDetailsOnStandardPO: [{
                                standardPOReverseDate: { type: Date, default: Date.now },
                                standardPOReversalID: { type: String },
                                standardPOReverseOldPrice: { type: Number },
                                standardPOReverseNewPriceAlertRemarks: { type: String },
                                standardPOReverseNewPriceAlert: { type: Number }
                            }],
                        RemittanceBalanceToBePaidDetailsOnStandardPO: [{
                                priceChangeOnStandardPODate: { type: Date, default: Date.now },
                                isRemittanceAfterPriceChangeOnStandardPO: { type: Boolean },
                                remitDateOnStandardPO: { type: Date, default: Date.now },
                                remittanceExpectedBalToBePaidStandardPO: { type: Number },
                                remittanceUpdateRemarksOnStandardPO: { type: String },
                                remittedAmountCROnStandardPO: { type: Number },
                                endingBalanceAfterLastRemittanceOnStandardPO: { type: Number },
                                priceAdjustmentAppliedOnStandardPO: { type: Boolean, default: false },
                            }],
                        StandardPurchaseOrderCumulativeBalance: [{
                                cumulativeBalance: { type: Number }
                            }],
                        StandardPurchaseOrderItemsGrandTotal: [{
                                updatedAt: { type: Date, default: Date.now },
                                standardPurchaseOrderItemsGrandTotal: { type: Number }
                            }],
                    }],
                TotalRemittanceMadeSoFarOnStandardPO: [{
                        remitDateOnStandardPO: { type: Date, default: Date.now },
                        remittedDateOnStandardPO: { type: Date },
                        remittedAmountOnStandardPO: { type: Number },
                        remittedRemarksOnStandardPO: { type: String },
                        TotalPaymentsMadeSoFarOnStandardPO: { type: String }
                    }],
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
            }));
            const paymentClassModel = mongoose.model('PaymentClass', new mongoose.Schema({
                paymentClassName: String,
                paymentClassDesc: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            const remittanceLayAwayPOModel = mongoose.model('Remittance', new mongoose.Schema({
                remittanceForWhichLayAwayPORefID: { type: Schema.Types.ObjectId, ref: 'LayAwayPurchaseOrder', required: true },
                createdAt: { type: Date, default: Date.now, required: true },
                remittanceDate: { type: Date, default: Date.now, required: true },
                remittanceReferenceID: { type: String, default: generateCombinedRemittanceShortId, unique: true },
                remittanceForWhichLayAwayPurchaseOrderID: { type: String },
                remittanceForWhichActiveSubscriberID: { type: String },
                remittanceActiveUserFullName: { type: String },
                remittancePOPhoneNo: { type: String },
                remittanceAmount_CR: { type: Number, required: true },
                remittanceDueBalance: { type: Number },
                remittancePaymentRefClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
                remittancePaymentClass: { type: String },
                remittanceOnLayWayPORemarks: { type: String, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
            }));
            const remittanceStandardPOModel = mongoose.model('RemittanceStandardPO', new mongoose.Schema({
                remittanceReferenceID: { type: String, default: generateCombinedRemittanceShortId, unique: true },
                remittanceForWhichStandardPORefID: { type: Schema.Types.ObjectId, ref: 'StandardPurchaseOrder', required: true },
                createdAt: { type: Date, default: Date.now, required: true },
                remittanceDate: { type: Date, default: Date.now, required: true },
                remittanceForWhichStandardPurchaseOrderID: { type: String },
                remittanceForWhichActiveSubscriberID: { type: String },
                remittanceActiveUserFullName: { type: String },
                remittancePOPhoneNo: { type: String },
                remittanceByUserEmailAddress: { type: String },
                remittanceAmount_CR: { type: Number, required: true },
                remittanceDueBalance: { type: Number },
                remittancePaymentRefClass: { type: Schema.Types.ObjectId, ref: 'PaymentClass', required: true },
                remittancePaymentClass: { type: String },
                remittanceOnStandardPORemarks: { type: String, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
            }));
            const remittanceSchemeModel = mongoose.model('RemittanceScheme', new mongoose.Schema({
                remittanceOnSchemeID: { type: String, required: true, unique: true },
                remittanceForWhichUserSchemeTransID: { type: Schema.Types.ObjectId, required: true, ref: 'UserScheme' },
                createdAt: { type: Date, default: Date.now, },
                remittanceOnSchemeDate: { type: Date, default: Date.now },
                remittanceForWhichSchemeID: { type: String },
                remittanceForWhichActiveUserIDWhoSchemed: { type: String, required: true },
                remittanceActiveUserFullNameWhoSchemed: { type: String, required: true },
                remittanceSchemePhoneNo: { type: String, required: true },
                remittanceSchemeAmount_CR: { type: Number, required: true },
                remittanceSchemeDueBalance: { type: Number, required: true },
                remittanceSchemePaymentRefClass: { type: Schema.Types.ObjectId, required: true, ref: 'PaymentClass' },
                remittanceSchemePaymentClass: { type: String, required: true },
                remittanceSchemeRemarks: { type: String, required: true },
                lastUpdatedAt: { type: Date, default: Date.now },
            }));
            const eCommerceProfileModel = mongoose.model('ECommerceProfile', new mongoose.Schema({
                eCommerceProfileId: { type: String, required: true },
                eCommerceProfileName: { type: String, required: true },
                itemProfiling: [{
                        itemAvailability: { type: String, enum: ['IN-STOCK/AVAILABLE', 'OUT-OF-STOCK', 'BACKORDER', 'DISCONTINUED', 'OTHERS'], required: true },
                        itemPricingValue: { type: String, enum: ['BUDGET/VALUE', 'MID-RANGE', 'HIGH-END', 'OTHERS'], required: true },
                        itemProductLifeCycle: { type: String, enum: ['BEST SELLERS', 'CLEARANCE/SALE', 'SEASONAL', 'OTHERS'], required: true },
                        itemCustomization: { type: String, enum: ['PERSONALIZED', 'MADE-TO-ORDER', 'OTHERS'], required: true },
                        itemSustainability: { type: String, enum: ['ECO-FRIENDLY/SUSTAINABLE', 'ORGANIC', 'FAIR-TRADE', 'OTHERS'], required: true },
                        itemAttributes: { type: String, enum: ['COLOR', 'SIZE', 'STYLE', 'MATERIAL', 'OTHERS'], required: true },
                        itemOtherAttrbutes: { type: String, enum: ['EXCLUSIVE', 'LIMITED EDITION', 'REFURBISHED', 'OPEN-BOX', 'OTHERS'], required: true },
                    }],
                createdAt: { type: Date, default: Date },
                lastUpdatedAt: { type: Date, default: Date },
            }));
            const schemeModel = mongoose.model('SchemeInformation', new mongoose.Schema({
                schemaID: { type: String, unique: true, required: true },
                itemRefIDToBeSchemed: { type: Schema.Types.ObjectId, ref: 'ItemInformation', unique: true },
                itemIDToBeSchemed: { type: String },
                itemNameToBeSchemed: { type: String },
                itemDescriptionToBeSchemed: { type: String },
                schemeName: { type: String, required: true },
                schemeShortDescription: { type: String, required: true },
                itemToBeSchemedOriginalPrice: { type: Number, required: true },
                schemeRefUnitOfMeasure: { type: Schema.Types.ObjectId, ref: 'UnitOfMeasure', required: true },
                schemeUnitOfMeasure: { type: String },
                schemeUnitPrice: { type: Number, required: true },
                schemeDiscountWaved: { type: Number },
                schemePaymentPlan: { type: String, required: true, enum: [
                        'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE BEFORE DUE DATE', 'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE ON DELIVERY',
                        'PAYMENT ON DELIVERY', 'FULL PAYMENT UPFRONT'
                    ]
                },
                schemeMinimumSecurityDeposit: { type: Number, required: true },
                totalUnitsAvailableForScheme: { type: Number, required: true },
                schemeStartDate: { type: Date, required: true },
                schemeEndDate: { type: Date, required: true },
                schemeStatus: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE'] },
                schemeRunForHowManyDays: { type: String },
                postDateBegins: { type: Date, required: true },
                expectedNoOfDaysToDeliver: { type: Number, required: true },
                expectedDeliveryDate: { type: Date, required: true },
                createdAt: { type: Date, default: Date.now },
                schemePoolDetailsUpdate: [{
                        schemeCount: { type: Number },
                        userSchemeTransID: { type: String },
                        userIDWhoSuccessfullySchemed: { type: String },
                        userNameWhoSuccessfullySchemed: { type: String },
                        userPhoneNoWhoSuccessfullySchemed: { type: String },
                        userDurationBeforeActionWasTaken: { type: String },
                        userAmountUserPaid: { type: Number },
                        userSchemedHowManyUnits: { type: Number }
                    }],
                noOfUnitsAvailableAfterAUserSchemed: { type: Number },
                lastUpdatedAt: { type: Date, default: Date.now }
            }));
            const userSchemeModel = mongoose.model('UserScheme', new mongoose.Schema({
                userSchemeTransactionID: { type: String, required: true, unique: true },
                userRefIdRequiringScheme: { type: Schema.Types.ObjectId, ref: 'ActiveUser', required: true },
                userFullNameRequiringScheme: { type: String },
                userEmailRequiringScheme: { type: String },
                userPhoneNoRequiringScheme: { type: String },
                userDeliveryAddressRequiringScheme: { type: String },
                schemeRefIDUserSchemed: { type: Schema.Types.ObjectId, ref: 'SchemeInformation', required: true },
                schemeIDUserSchemed: { type: String },
                schemeItemNameUserSchemed: { type: String },
                schemeItemShortDescUserSchemed: { type: String },
                schemeNameUserSchemed: { type: String },
                schemeShortDescUserSchemed: { type: String },
                schemePaymentStructureUserSchemed: { type: String },
                userSchemeMinimumSecurityDeposit: { type: Number },
                schemePaymentDueDate: { type: Date },
                schemeItemOriginalPriceUserSchemed: { type: Number },
                schemeUnitPriceUserSchemed: { type: Number },
                schemeDiscountWavedUserSchemed: { type: Number },
                schemeNoOfUnitsUserSchemed: { type: Number, required: true },
                schemeTotalAmountUserSchemed: { type: Number },
                schemeTotalSecurityDeposit: { type: Number },
                schemeBalancePaymentBeforeDueDate: { type: Number },
                schemeUserSchemedStartDate: { type: Date },
                schemeUserSchemedEndDate: { type: Date },
                shemeUserSchemedPostDateBegins: { type: Date },
                expectedNoOfDaysToDeliver: { type: Number },
                expectedDeliveryDate: { type: Date },
                StatingBalanceOnSchemeHistory: [{
                        startSchemeDate: { type: Date },
                        startingBalanceRemarksOnScheme: { type: String },
                        startingBalanceOnScheme: { type: Number },
                    }],
                TotalRemittanceMadeSoFar: [{
                        remitDateOnScheme: { type: Date },
                        remittedSchemeDate: { type: Date },
                        remittedSchemeAmount: { type: Number },
                        remittedSchemeRemarks: { type: String },
                        TotalPaymentsMadeSoFar: { type: String }
                    }],
                RemittanceBalanceToBePaidDetails: [{
                        remitOnSchemeDate: { type: Date },
                        remittanceExpectedBalToBePaidOnScheme: { type: Number },
                        remitOnSchemeRemarks: { type: String },
                        remittedAmountCROnScheme: { type: Number },
                        endingBalanceAfterLastRemittanceOnScheme: { type: Number }
                    }],
                amountdDepositedForSchemeByUser: { type: Number },
                sumTotalAmountSecuritDepositsPaidByAllUsers: { type: Number },
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now }
            }));
            const project214Model = new Schema({
                projectShortId: { type: String, default: generateCombinedFOREAShortId, unique: true },
                projectName: { type: String, required: true },
                projectNameAlias: { type: String, required: true },
                projectDescription: { type: String, required: true },
                projectStartDate: { type: Date, required: true },
                projectCompletionLengthInMonths: { type: Number, required: true },
                projectCompletionDate: { type: Date },
                projectCurrentAcquisitionPhase: { type: String, required: true, enum: ['OFF-PLAN PURCHASE', 'UNDER CONSTRUCTION', 'NEWLY COMPLETED', 'READY-FOR-OCCUPANCY (RFO)',
                        'PRE-OWNED/RESALE', 'DISTRESSED/FORECLOSURE SALE', 'TURNKEY PROPERTY'] },
                projectStructure: [{
                        blockID: { type: String, default: generateBlockShortId, unique: true },
                        blockName: { type: String, required: true },
                        blockDescription: { type: String, required: true },
                        houseDetails: [{
                                houseID: { type: String, default: generateHouseShortId, unique: true },
                                houseName: { type: String, required: true },
                                houseDescription: { type: String, required: true },
                                houseSalesPrice: { type: Number, required: true },
                                fractionalUnitDetails: [{
                                        fractionalUnitID: { type: String, default: generateCombinedPropertyID, unique: true },
                                        fractionalUnitName: { type: String, required: true },
                                        fractionalUnitDescription: { type: String, required: true },
                                        fractionUnitSalesPrice: { type: Number, required: true },
                                        fractionalUnitSalesTag: { type: String, enum: ['Not Yet Subscribed', 'Subscribed'], default: 'Not Yet Subscribed' }
                                    }]
                            }]
                    }],
                MultiSelectPaymentPlan: { selectedPlans: [{
                            plan: { type: Schema.Types.ObjectId, ref: 'PaymentPlan' },
                            selectedPlanName: { type: String }
                        }] },
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now }
            });
            const OtherApplicableFlatFeesSchema = new Schema({
                flatFeeName: { type: String, required: true },
                flatFeeAmount: { type: Number, required: true }
            });
            const OtherApplicablePercentageFeesSchema = new Schema({
                percentageFeeName: { type: String, required: true },
                percentageFeeAmount: { type: Number, required: true }
            });
            const paymentPlanModel = mongoose.model('PaymentPlan', new mongoose.Schema({
                paymentPlanId: { type: String, unique: true, default: generateCombinedPaymentPlanShortId },
                paymentPlanName: { type: String, required: true },
                paymentPlanDescription: { type: String, required: true },
                paymentType: { type: String, required: true },
                paymentFrequency: { type: String, required: true },
                fractionalUnitPropertyAmount: { type: Number, required: true, default: 0 },
                paymentDurationInMonths: { type: Number, required: true },
                interestRateIfRequired: { type: Number, required: true, default: 0 },
                interestFeeFaceValue: { type: Number, default: 0 },
                OtherApplicableFlatFees: [OtherApplicableFlatFeesSchema],
                OtherApplicablePercentageFees: [OtherApplicablePercentageFeesSchema],
                AmortizationSchedule: [{
                        PaymentNoCount: { type: Number },
                        PaymentDueDatePerFrequency: { type: Date },
                        DuePaymentAmountPerFrequency: { type: Number },
                        InterestFeesPayablePerFrequency: { type: Number },
                        OtherFlatFeePayablePerFrequency: { type: Number },
                        OtherPercentageFeePayablePerFrequency: { type: Number },
                        TotalPayablePerFrequency: { type: Number },
                        BalanceToBePaidPerFrequency: { type: Number }
                    }],
                createdOn: { type: Date, default: Date.now, required: true },
                lastUpdatedAt: { type: Date, default: Date.now, required: true }
            }));
            const subscribeToProject214Model = mongoose.model('SubscribeToProject214', new Schema({
                subscribeP214OrderId: { type: String, unique: true, default: generateCombinedPOShortId },
                subscribersActiveID: { type: Schema.Types.ObjectId, ref: 'ActiveUser', required: true },
                subscribersFullName: { type: String },
                subscribersEmail: { type: String },
                subscribersPhoneNumber: { type: String },
                subscribersContactAddress: { type: String },
                projectTheSubscriberIsInterestedIn: { type: Schema.Types.ObjectId, ref: 'Project214Information', required: true },
                projectTheSubscriberIsInterestedInName: { type: String },
                projectTheSubscriberIsInterestedInShortDesc: { type: String },
                projectTheSubscriberIsInterestedInStartDate: { type: Date },
                projectTheSubscriberIsInterestedInCompletionDate: { type: Date },
                projectTheSubscriberIsInterestedInAcquisitionStage: { type: String },
                SubscribeToFractionsOfProject214: [{
                        propertyCount: { type: Number },
                        fractionalUnitID: { type: String },
                        fractionalUnitName: { type: String },
                        fractionalUnitDescription: { type: String },
                        fractionalUnitUniqueIdentifier: { type: String },
                        propertyAllocationNumber: { type: String },
                        fractionUnitSalesPrice: { type: Number },
                        fractionalUnitSalesTag: { type: String },
                        isSelected: { type: Boolean, default: false }
                    }],
                selectedUnits: [{ type: String }],
                projectFractionalUnitsTotalSalePrice: { type: Number },
                projectTheSubscriberIsInterestedInPaymentPlanID: { type: Schema.Types.ObjectId, ref: 'PaymentPlan', required: true },
                projectTheSubscriberIsInterestedInPaymentPlanName: { type: String },
                projectTheSubscriberIsInterestedInPaymentPlanShortDesc: { type: String },
                createdAt: { type: Date, required: true, default: Date.now() },
                lastUpdatedAt: { type: Date, required: true, default: Date.now() },
            }));
            const nairaWalletBalanceModel = mongoose.model('NairaWalletBalance', new Schema({
                nairaWalletOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'ActiveSubscriber', required: true },
                nairaWalletID: { type: String },
                nairaWalletOwnerFullName: { type: String },
                nairaWalletOwnerEmail: { type: String },
                nairaWalletOwnerPhoneNumber: { type: String },
                nairaWalletCurrency: { type: String, default: 'NGN' },
                nairaWalletOpeningBalance: { type: Number },
                depositFundsToNairaWallet: { type: Number },
                withdrawFundsFromNairaWallet: { type: Number },
                nairaWalletTransactionRemarks: { type: String, required: true },
                nairaWalletClosingBalance: { type: Number },
                createdAt: { type: Date, required: true, default: Date.now },
                lastUpdatedAt: { type: Date, required: true, default: Date.now }
            }));
            const accountHolderData = await accountHolderModel.find({}).exec();
            const activeSubscriberData = await activeSubscriberModel.find({})
                .populate({ model: 'AccountHolder', path: '', select: 'accountHolderPhoneNo' })
                .populate({ model: 'ProfiledPartner', path: '', select: 'profiledPartnerName' })
                .exec();
            const itemCategoryData = await itemCategoryModel.find({}).exec();
            const itemTypeData = await itemTypeModel.find({}).exec();
            const itemSubTypeData = await itemSubTypeModel.find({}).exec();
            const itemBrandData = await itemBrandModel.find({}).exec();
            const unitOfMeasureData = await unitOfMeasureModel.find({}).exec();
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
            const layAwayPurchaseOrderData = await layAwayPurchaseOrderModel.find({})
                .populate({ model: 'ActiveSubscriber', path: '', select: 'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName' })
                .populate('ItemInfomation')
                .populate('UOM')
                .populate('SubcriptionType')
                .exec();
            const standardPurchaseOrderData = await standardPurchaseOrderModel.find({})
                .populate({ model: 'ActiveSubscriber', path: '', select: 'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName' })
                .populate('ItemInfomation')
                .populate('UOM')
                .populate('SubcriptionType')
                .exec();
            const paymentClassData = await paymentClassModel.find({}).exec();
            const remittanceLayAwayPOData = await remittanceLayAwayPOModel.find({})
                .populate({ path: '', model: 'LayWayPurchaseOrder', select: 'purchaseOrderId' })
                .populate({ path: '', model: 'PaymentClass', select: 'paymentClassName' })
                .exec();
            const remittanceStandardPOData = await remittanceStandardPOModel.find({})
                .populate({ path: '', model: 'StandardPurchaseOrder', select: 'standardPurchaseOrderId' })
                .populate({ path: '', model: 'PaymentClass', select: 'paymentClassName' })
                .exec();
            const remittanceSchemeData = await remittanceSchemeModel.find({})
                .populate({ path: '', model: 'SchemeInformation', select: 'schemeID' })
                .populate({ path: '', model: 'PaymentClass', select: 'paymentClassName' })
                .exec();
            const eCommerceProfileData = await eCommerceProfileModel.find({}).exec();
            const schemeInformationData = await schemeModel.find({})
                .populate({ model: 'ItemInformation', path: '', select: 'itemInformationName' })
                .populate({ model: 'UOM', path: '', select: 'unitofMeasureID' })
                .exec();
            const userSchemeData = await userSchemeModel.find({})
                .populate({ model: 'SchemeInformationProfile', path: '', select: 'schemeID' })
                .exec();
            const Project214InformationModel = mongoose.model('Project214Information', project214Model);
            const project214Data = await Project214InformationModel.find({})
                .exec();
            const paymentPlanData = await paymentPlanModel.find({})
                .exec();
            const subscribeToProject214Data = await subscribeToProject214Model.findById('subscribeP214OrderId')
                .populate({ model: 'ActiveSubscriber', path: 'subscribersActiveID', select: 'fullName email' })
                .populate({ model: 'Project214Information', path: 'project214ID', select: 'projectName location' })
                .populate({ model: 'PaymentPlan', path: 'paymentPlanID', select: 'planName installmentAmount' })
                .populate({ model: 'SubscribeToProject214', path: 'SubscribeToFractionsOfProject214',
                populate: { model: 'FractionalUnit', path: 'fractionalUnitID', select: 'fractionalUnitName fractionUnitSalesPrice' } })
                .exec();
            const nairaWalletBalanceData = await nairaWalletBalanceModel.find({})
                .populate({ model: 'ActiveSubscriber', path: '', select: 'activeUserFullName' })
                .exec();
            return { itemCategoryData, itemTypeData, itemSubTypeData, itemBrandData, eCommerceProfileData, unitOfMeasureData, itemInformationData, updateItemPriceData,
                profiledPartnerData, paymentClassData, subscriptionTypeData, accountHolderData, activeSubscriberData, layAwayPurchaseOrderData, standardPurchaseOrderData,
                remittanceLayAwayPOData, remittanceStandardPOData, remittanceSchemeData, schemeInformationData, userSchemeData, project214Data, paymentPlanData, subscribeToProject214Data,
                nairaWalletBalanceData };
        }
        catch (error) {
            console.error('Error Fetching Data from MongoDB:', error);
            return { error: 'An error occurred while fetching ProductBrand data from the database' };
        }
        finally {
            await mongoose.disconnect();
        }
    };
    const componentLoader = new ComponentLoader();
    const Components = { Dashboard: componentLoader.add('Dashboard', './Dashboard') };
    const fractionalUnitsComponent = componentLoader.add("FractionalUnitsList", './admin/customComponents/FractionalUnitsList');
    const businessNavigation = { name: 'Business Profile', icon: 'transaction' };
    const customersNavigation = { name: 'Customers Profile', icon: 'customer' };
    const itemsNavigation = { name: 'Item Profile', icon: 'item' };
    const fractionalOwnership = { name: 'F.O.R.E.A Profile', icon: 'properties' };
    const updateNavigation = { name: 'Update Profile', icon: 'update' };
    const transactionsNavigation = { name: 'Transaction Profile', icon: 'payment' };
    const remittanceNavigation = { name: 'Remittance Profile', icon: 'remittance' };
    const WalletNavigation = { name: 'Wallet Profile', icon: 'wallet' };
    const admin = new AdminJS({
        databases: [mongooseDB],
        rootPath: '/admin',
        branding: { companyName: 'AssetLoop Nigeria Limited' },
        assets: { styles: ["/sidebar.css"] },
        resources: [
            { resource: ProfiledPartner, options: { navigation: businessNavigation, id: 'ProfiledPartner', search: { type: String, isVisible: { filter: true } } } },
            { resource: SubscriptionType, options: { navigation: businessNavigation, id: 'SubscriptionType', search: { type: String, isVisible: { filter: true } } } },
            { resource: PaymentClass, options: { navigation: businessNavigation, id: 'PaymentClass', search: { type: String, isVisible: { filter: true } } } },
            { resource: PaymentPlan, options: { navigation: businessNavigation, id: 'PaymentPlan', search: { type: String, isVisible: { filter: true } } } },
            { resource: UOM, options: { navigation: businessNavigation, id: 'UOM', search: { type: String, isVisible: { filter: true } } } },
            { resource: AccountSubscriber, options: { navigation: customersNavigation, id: 'AccountSubscriber', search: { type: String, isVisible: { filter: true } } } },
            { resource: ActiveSubscriber, options: { navigation: customersNavigation, id: 'ActiveSubscriber', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemCategory, options: { navigation: itemsNavigation, id: 'ItemCategory', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemBrand, options: { navigation: itemsNavigation, id: 'ItemBrand', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemType, options: { navigation: itemsNavigation, id: 'ItemType', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemSubType, options: { navigation: itemsNavigation, id: 'ItemSubType', search: { type: String, isVisible: { filter: true } } } },
            { resource: ECommerceProfile, options: { navigation: itemsNavigation, id: 'ECommerceProfile', search: { type: String, isVisible: { filter: true } } } },
            { resource: ItemInformation, options: { navigation: itemsNavigation, id: 'ItemInformation', search: { type: String, isVisible: { filter: true } } } },
            { resource: SchemeInformation, options: { navigation: itemsNavigation, id: 'SchemeInformation', search: { type: String, isVisible: { filter: true } } } },
            { resource: Project214Information, options: { navigation: fractionalOwnership, id: 'Project214Information', search: { type: String, isVisible: { filter: true } }, properties: { project214AvailableFractionalUnitsList: {} } } },
            { resource: UpdateItemPrice, options: { navigation: updateNavigation, id: 'UpdateItemPrice', search: { type: String, isVisible: { filter: true } }, actions: { edit: false, delete: false } } },
            { resource: UpdateScheme, options: { navigation: updateNavigation, id: 'UpdateScheme', search: { type: String, isVisible: { filter: true } } } },
            { resource: LayAwayPurchaseOrder, options: { navigation: transactionsNavigation, id: 'LayAwayPurchaseOrder', search: { type: String, isVisible: { filter: true } } } },
            { resource: StandardPurchaseOrder, options: { navigation: transactionsNavigation, id: 'StandardPurchaseOrder', search: { type: String, isVisible: { filter: true } } } },
            { resource: UserScheme, options: { navigation: transactionsNavigation, id: 'UserScheme', search: { type: String, isVisible: { filter: true } } } },
            { resource: SubscribeToProject214,
                options: {
                    navigation: transactionsNavigation,
                    id: 'SubscribeToProject214',
                    search: { type: String, isVisible: { filter: true } },
                    properties: {
                        projectTheSubscriberIsInterestedIn: {
                            type: 'reference',
                            reference: 'Project214Information',
                            isRequired: true,
                            isVisible: { list: true, show: true, edit: true, filter: true },
                        },
                        selectedUnits: {
                            isVisible: {
                                list: false,
                                edit: true,
                                show: true,
                                filter: false,
                            },
                            components: {
                                edit: UnitSelectionComponent,
                                show: UnitSelectionComponent,
                            },
                        },
                    },
                    actions: {
                        new: {
                            before: async (request) => {
                                console.log('📢 Request Query:', request.query);
                                console.log('📢 Request Params:', request.params);
                                console.log('📢 Request Record:', request.record);
                                let projectShortId = request.query?.projectShortId;
                                if (!projectShortId) {
                                    console.error('❌ Error: Project ID is missing in the request query.');
                                    throw new Error('Project ID is required to create a subscription. Ensure the request includes ?projectShortId=<ID>');
                                }
                                const projectId = new mongoose.Types.ObjectId(projectShortId);
                                request.availableUnits = await fetchAvaiilableFractionalUnits(projectId);
                                return request;
                            }
                        },
                        edit: {
                            before: async (request) => {
                                console.log('📢 Request Query:', request.query);
                                console.log('📢 Request Params:', request.params);
                                console.log('📢 Request Record:', request.record);
                                let projectShortId = request.query?.projectShortId;
                                if (!projectShortId) {
                                    console.error('❌ Error: Project ID is missing in the request query.');
                                    throw new Error('Project ID is required to create a subscription. Ensure the request includes ?projectShortId=<ID>');
                                }
                                const projectId = new mongoose.Types.ObjectId(projectShortId);
                                request.availableUnits = await fetchAvaiilableFractionalUnits(projectId);
                                return request;
                            }
                        },
                    },
                },
            },
            { resource: RemittanceOnLayAwayPO, options: { navigation: remittanceNavigation, id: 'RemittanceOnLayAwayPO', search: { type: String, isVisible: { filter: true } } } },
            { resource: RemittanceOnStandardPO, options: { navigation: remittanceNavigation, id: 'RemittanceOnStandardPO', search: { type: String, isVisible: { filter: true } } } },
            { resource: RemitOnScheme, options: { navigation: remittanceNavigation, id: 'RemitOnScheme', search: { type: String, isVisible: { filter: true } } } },
            { resource: NairaWalletBalance, options: { navigation: WalletNavigation, id: 'NairaWalletBalance', search: { type: String, isVisible: { filter: true } } } },
        ],
        dashboard: { component: Components.Dashboard, handler: dashboardHandler },
        componentLoader,
    });
    admin.watch();
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, { authenticate, cookieName: 'adminjs', cookiePassword: 'sessionsecret' }, null, { store: sessionStore, resave: true, saveUninitialized: true, secret: 'sessionsecret',
        cookie: { httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production' },
        name: 'adminjs',
    });
    app.use(express.json());
    app.use(admin.options.rootPath, adminRouter);
    app.use('/api', lawAwayPurchaseOrderRouter);
    app.use('/api', standardPurchaseOrderRouter);
    app.use('/api', schemeInformationRouter);
    app.use('/api', userSchemeRouter);
    app.use('/api', Project214Router);
    app.use('/api', paymentPlanRouter);
    app.use('/api', subscribeToProject214Router);
    app.use('/api', nairaWalletRouter);
    app.use('/api/userfullprofile', getUserProfiles);
    app.set('view engine', 'ejs');
    console.log('Views directory:', path.join(__dirname, 'views'));
    app.set('views', path.join(__dirname, 'views'));
    app.listen(PORT, () => { console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`); });
};
start();
