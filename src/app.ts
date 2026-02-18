import AdminJS, {actionErrorHandler, ComponentLoader} from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express, {Request,Response} from 'express';


import dotenv from 'dotenv';
dotenv.config();

import mongoose, {Schema, Document} from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import connectMongoDBSession from 'connect-mongodb-session';

import session from 'express-session';
import bcrypt from 'bcrypt';

import PDFDocument from 'pdfkit';
import {jsPDF} from "jspdf";

import React, {FC, createElement} from 'react';
import {Box, Text} from '@adminjs/design-system';
import {ActionResponse} from 'adminjs';
import build from 'adminjs';
import {ResourceOptions, Action} from 'adminjs';

import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//--------------------------------model imports------------------------------------------------------
//-----Customer Profile
import {AccountSubscriber, IAccountSubscriber} from './models/accountSubscriber.model.js'
import {ActiveSubscriber} from './models/activeSubscriber.model.js';
//-----Item Profile
import {ItemCategory} from "./models/itemCategory.model.js";
import {ItemType} from './models/itemType.model.js';
import {ItemSubType} from './models/itemSubType.model.js';
import {ItemBrand} from './models/itemBrand.model.js' ;
import {ItemInformation, IItemInformation} from "./models/itemInformation.model.js";
import {SchemeInformation, ISchemeIP} from './models/schemeInformationProfile.model.js';
//-----Business Profile
import {UOM} from './models/uom.model.js';
import {ProfiledPartner} from './models/profiledPartner.model.js'; 
import {SubscriptionType} from './models/subscriptionType.model.js';
import {PaymentClass} from './models/paymentClass.model.js';
import {ECommerceProfile, IECommerceProfile, IECommerceProfileItem} from './models/eCommerceProfile.model.js';
//-----Transaction Profile
import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder} from './models/layAwayPurchaseOrder.model.js';
import {StandardPurchaseOrder, IStandardPurchaseOrder} from './models/standardPurchaseOrder.model.js';
import {StandardSaleOrder, IStandardSaleOrder} from './models/standardSaleOrder.model.js';
import {SchemeSaleOrder, ISchemeSaleOrder} from './models/schemeSaleOrder.model.js';
import {Project214Information, IProject214Information} from './models/project214Information.model.js'; 
import {SubscribeToProject214} from './models/subscribeToProject214.model.js';
import {PaymentPlanForFractionalOwnership, IPaymentPlanForFractionalOwnership, AmortizationSchedule, IAmortizationSchedule} from './models/paymentPlanForFractionalOwnership.model.js';
//-----Update Profile
import {UpdateScheme} from './models/updateScheme.model.js';
import {UpdateItemPrice} from './models/updateItemPrice.model.js';
//-----Remittance Profile
import {RemittanceOnLayAwayPO, IRemittanceLayAwayPO} from './models/remittanceOnLayAwayPO.model.js';
import {RemittanceOnStandardPO, IRemittanceStandardPO} from './models/remittanceOnStandardPO.model.js';
import {RemitOnScheme, IRemittanceScheme } from './models/remittanceScheme.model.js';
//-----Wallet Profile
import {NairaWalletBalance, INairaWalletBalance} from './models/walletNairaBalance.model.js';

//router-imports
import {getUserProfiles} from './routes/getUserProfiles.route.js';
import schemeInformationRouter from './routes/schemeInformation. route.js';
import lawAwayPurchaseOrderRouter from './routes/layAwayPurchaseOrder.route.js';
import standardPurchaseOrderRouter from './routes/standardPurchaseOrder.route.js';
import standardSaleOrderRouter from './routes/standardSaleOrder.route.js';
import schemeSaleOrderRouter from './routes/schemeSaleOrder.route.js';
import Project214Router from './routes/project214.route.js';
import paymentPlanRouter from './routes/paymentPlan.route.js';
import subscribeToProject214Router from './routes/subscribeToPoject214.route.js';
import nairaWalletRouter from './routes/walletNaira.route.js';

//service-imports
import {getAvailableFractionalUnits} from './services/subscribeToProject214.service.js';

//utils-imports
import {generateCombinedFOREAShortId} from './utils/generateCombinedFOREAShortId.utils.js';
import {generateCombinedPaymentPlanShortId} from './utils/generateCombinedPaymentPlanShortId.utils.js';
import {generateCombinedRemittanceShortId} from './utils/generateCombinedRemittanceShortId.utils.js';
import generateCombinedPOShortId from './utils/generateCombinedPOShortId.util.js';
import {generateCombinedPropertyID} from './utils/generateCombinedPropertyID.utils.js';
import {generateBlockShortId} from './utils/generateBlockShortId.utils.js';
import {generateHouseShortId} from './utils/generateHouseShortId.utils.js';
import {generatePropertyListingShortId} from './utils/generatePropertyListingID.utils.js';
import {fetchAvaiilableFractionalUnits} from './utils/fetchAvailableFractionalUnits.utils.js';
import generateWalletTransactionsShortId from './utils/generateWalletTransactionsShortId.utils.js';
import generateActiveUserShortId from './utils/generateActiveSubscriberShortId.utils.js';


//action-imports
import fetchFractionalUnits from './actions/fetchFractionalUnits.action.js';

//admin/component imports
import ActiveUserResourceOptions from './admin/activeUserResource.js';
import FractionalUnitsList from './admin/customComponents/FractionalUnitsList.js';
import UnitSelectionComponent from './admin/customComponents/UnitSelectionComponent.js';

//---PORT
const PORT = 3018

//initialize AdminJS
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const DEFAULT_ADMIN = {email:'admin@asset360nigeria.com', password:'MultiplierEffect1000%'};
const authenticate = async (email:string, password:string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      return Promise.resolve(DEFAULT_ADMIN)}
      return null
};

const start = async () => {
  const app = express(); //initialize express
  app.use(express.json()); // middleware to parse JSON requests
  app.use('/public', express.static(path.join(__dirname, 'public'))); //middleware to parse form data
  app.use(express.static(path.join(__dirname, 'pdfs/'))); //middleware to serve static files
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  const mongooseDB = await mongoose.connect(MONGODB_URI) //connect to MongoDB
  const MongoDBStore = connectMongoDBSession(session);
  const sessionStore = new MongoDBStore({
    uri: MONGODB_URI, collection:'session'});
    sessionStore.on('error', (error) => {
    console.error('MongoDB Session Store Error:', error);
  });

  //Optionally (in case we want to access backend data on the dashboard. For example, we may want to display charts or statistics in general.
  //To do this, we might need to create a handler for the dashboard to access server data'.
  const dashboardHandler = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        
        //AccountHolder Model
        const accountHolderModel = mongoose.model('AccountHolder', new mongoose.Schema({
          accountHolderPhoneNo: String,
          accountHolderEmail: String,
          accountHolderPassword: String,
          accountHolderConfirmPassword: String,
          createdAt: Date,
          lastUpdatedAt: Date
        }));

        //ActiveSubscriber Model
        const activeSubscriberModel = mongoose.model('ActiveSubscriber', new mongoose.Schema({
          activeSubscriberID: {type:String, default:generateActiveUserShortId, unique:true},
              activeSubscriberPhoneRefNo: {type:Schema.Types.ObjectId, ref:'AccountSubscriber', unique:true, required:true},
              activeSubscriberProfileImage: {type:String},
              activeSubscriberFirstName: {type:String, required:true},
              activeSubscriberMiddleName: {type:String, required:true},
              activeSubscriberLastName: {type:String, required:true},
              activeSubscriberEmail: {type:String},
              activeSubscriberPhoneNo: {type:String, unique:true},
              activeSubscriberGender: {type:String, required:false, enum:['MALE','FEMALE','RATHER NOT SAY']},
              activeSubscriberDOB: {type:Date},
              activeSubscriberWorkStatus: {type:String, required:true, enum:['EMPLOYED', 'SELF-EMPLOYED', 'NOT CURRENTLY EMPLOYED']},
              activeSubscriberSelectCompany: {type:Schema.Types.ObjectId, ref:'ProfiledPartner'},
              nonProfiledCompanyName: {type:String, required:true},
              nonProfiledWorkAddress: {type:String, required:true},
              activeSubscriberAssetDeliveryAddress: {type:String, required:true},
              activeSubscriberNairaWalletID: {type:String},
              americanUSDWalletID: {type:String},
              britishPoundsWalletID: {type:String},
              marketPlaceID: {type:String},
              createdAt: {type:Date, default:Date.now, required:true},
              lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));
          

        //ItemCategory Model
        const itemCategoryModel = mongoose.model('ItemCategory', new mongoose.Schema({
          itemCategoryName:String, 
          createdAt:Date, 
          lastUpdatedAt:Date
        }));

        //ItemType Model
        const itemTypeModel =  mongoose.model('ItemType', new mongoose.Schema({
          itemTypeName:String, 
          createdAt:Date, 
          lastUpdatedAt:Date
        }));

        //ItemSubType Model
        const itemSubTypeModel =  mongoose.model('ItemSubType', new mongoose.Schema({
          itemSubTypeName:String, 
          createdAt:Date, 
          lastUpdatedAt:Date
        }));

        //ItemBrand Model
        const itemBrandModel = mongoose.model('ItemBrand', new mongoose.Schema({
          itemBrandName:String, 
          createdAt:Date, 
          lastUpdatedAt:Date
        }));

        //UnitOfMeasure Model
        const unitOfMeasureModel = mongoose.model('UOM', new mongoose.Schema({
          unitofMeasureID: {type:String},
          unitMeaseureName: {type:String},
          unitMeasureShortDesc: String,
          createdAt: {type:Date, default:Date.now, required:true},
          lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));

        //ItemInformation Model
        const itemInformationModel = mongoose.model('ItemInformation', new mongoose.Schema({
          itemInformationID: {type:String},
          itemInformationCode: {type:String, required:true},
          itemInformationName: {type:String, required:true},
          itemInformationCategory: {type:Schema.Types.ObjectId, ref:'ItemCategory', required:true},
          itemInformationBrand:{type:Schema.Types.ObjectId, ref:'ItemBrand', required:true},
          itemInformationType:{type:Schema.Types.ObjectId, ref:'ItemType', required:true},
          itemInformationSubType:{type:Schema.Types.ObjectId, ref:'ItemSubType', required:true},
          itemInformationDescription:{type:String, required:true},
          itemInformationImage: {type:String},
          itemInformationECommerceProfile: {type:Schema.Types.ObjectId, ref:'ECommerceProfile', required:true},
          itemInformationECommerceProfileName: {type:String, required:true},
          itemInformationECommerceProfileDisplay: {type:String},
          itemInformationCurrentMktPrice: { type: Number, required: true },
          itemInformationMktStartPrice: {
            type: Number, virtual: true, get(price: number) {
            const iteminfocurmktprice = this.itemInformationCurrentMktPrice;
            if (!iteminfocurmktprice) return null;
            // Option 1: Escape curly braces in regular expression
            // return `₦<span class="math-inline">{price.toFixed(2).replace(/\\d(?=(\d{3})+) /g, ',')}</span>`;
            // Option 2: Use template literal with backticks
            return `₦<span class="math-inline">${price.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, ',')}</span>`;
            },
          },
          itemInformationClassification: {type:String, enum:['STANDARD','PREMIUM','LUXURY'], required:true},
          createdAt: {type:Date, default:Date.now},
          lastUpdatedAt: {type:Date, default:Date.now}
        }));

        //UpdateItemPrice Model
         const updateItemPriceModel = mongoose.model('UpdateItemPrice', new mongoose.Schema({
          itemToBeUpdatedRefID: {type:mongoose.Types.ObjectId, ref:'ItemInformation', required:true},
          itemToBeUpdatedID: {type:String, required:true},
          itemToBeupdatedDisplayName:String,
          itemToBeUpdatedDisplayItemCode:String,
          itemToBeUpdatedDisplayItemDesc:String,
          itemToBeUpdatedStartPrice:Number,
          updatedItemNewPriceByInflation:Number,
          createdAt: {type:Date, default:Date.now},
          lastUpdatedAt: {type:Date, default:Date.now},
          itemInformationPriceUpdateDetails:[{
            itemInformationTranDateForNewPriceUpdate: {type:Date},
            itemInformationNewPriceUpdateRemarks: {type:String},
            itemInformationCurrentMktPrice: {type:Number}
          }]
        }));  

        //ProfiledPartner Model
        const profiledPartnerModel = mongoose.model('ProfiledPartner', new mongoose.Schema({
          profiledPartnerName: {type:String, required:true},
          profiledPartnerType: {type:String, enum:['PRIVATE COMPANY','PUBLIC INSTITUTION','SELF-EMPLOYED','OTHERS'], required:true},
          profiledPartnerSubType: {type:String, enum:['LIMITED LIABILITY COMPANY (LLC)','PUBLIC LIABILITY COMPANY (PLC)','FEDERAL GOVERNMENT AGENCY/PARASTATAL','STATE GOVERNMENT AGENCY/PARASTATAL','LOCAL GOVERNMENT AGENCY/PARASTATAL','SELF EMPLOYMENT','OTHERS'],
                  required:true},
          profiledPartnerOfficeAdd: {type:String, required:true},
          approvedEquityContributionInPercentage: {type:Number, required:true},
          approvedPaymentPlans: [{type:mongoose.Schema.Types.ObjectId, ref:'PaymentPlan', required:true}],
          profiledPartnerPayDay:{type:Number, enum:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31], required:true}, 
          createdAt: {type:Date, default:Date.now},
          lastUpdatedAt: {type:Date, default:Date.now}
        }));

        //SubscriptionType Model
        const subscriptionTypeModel = mongoose.model('SubscriptionType', new mongoose.Schema({
          subscTypeName:String, 
          subscTypeDesc:String,
          createdAt:Date, 
          lastUpdatedAt:Date
        }));
      
        //LayAway PurchaseOrder Model
        const layAwayPurchaseOrderModel = mongoose.model('LayAwayPurchaseOrder', new mongoose.Schema({
          layAwayPurchaseOrderId: {type:String, default:generateCombinedPOShortId, unique:true},
            layAwayPOrderForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
            layAwayPOrderForActiveSubscriberID: {type:String},
            layAwayPOrderUserProfileFullName: {type:String},
            layAwayPOrderUserProfilePhoneNo: {type:String},
            layAwayPOrderUserProfileEmail: {type:String},
            layAwayPOrderUserDeliveryAddress: {type:String},
            layAwayPurchaseOrderIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
            layAwayPurchaseOrderIntentID: {type:String},
            layAwayPurchaseOrderIntentItemCode: {type:String},
            layAwayPurchaseOrderIntentItemName: {type:String},
            layAwayPurchaseOrderIntentDesc: {type:String},
            layAwayPurchaseOrderNoOfUnitBought: {type:Number, required:true},
            layAwayPurchaseOrderUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
            layAwayPurchaseOrderUnitOfMeasure: {type:String},
            layAwayPurchaseOrderUnitPrice: {type:Number},
            layAwayPurchaseOrderTotalStartPrice: {type:Number},
            layAwayPurchaseOrderAssetSubscTypeRefID: {type:Schema.Types.ObjectId, ref:'SubscriptionType', required:true},
            layAwayPurchaseOrderAssetSubscType: {type:String},
            layAwayPurchaseOrderNewPriceAlert: {type:Number},
            PriceChangeOnLayAwayPOHistoryDetails: [{
              priceChangeOnLayAwayPODate: {type:Date, default:Date.now},
              priceChangeOnLayAwayPORemarks: {type:String},
              newPriceAmountOnLayAwayPO: {type:Number},
              priceAdjustmentAppliedOnLayAwayPO: {type:Boolean, default:false}
            }],
            PriceReverseAlertDetailsOnLayAwayPO: [{
              layAwayPurchaseOrderReverseOldPrice: {type:Number},
              layAwayPurchaseOrderReversalID: {type:String, default:generateCombinedPOShortId},
              layAwayPurchaseOrderReverseDate: {type:Date, default:Date.now},
              layAwayPurchaseOrderReverseNewPriceAlertRemarks: {type:String},
              layAwayPurchaseOrderReverseNewPriceAlert: {type:Number}
            }],
            TotalRemittanceMadeSoFarOnLayAwayPO: [{
              remitDateOnLayAwayPO: {type:Date, default:Date.now},
              remittedDateOnLayAwayPO: {type:Date},
              remittedAmountOnLayAwayPO: {type:Number},
              remittedRemarksOnLayAwayPO: {type:String},
              TotalPaymentsMadeSoFarOnLayAwayPO: {type:String}
            }],
            RemittanceBalanceToBePaidDetailsOnLayAwayPO: [{
              priceChangeOnLayAwayPODate: {type:Date, default:Date.now},
              isRemittanceAfterPriceChangeOnLayAwayPO: {type:Boolean},
              remitDateOnLayAwayPO: {type:Date},
              remittanceExpectedBalToBePaidOnLayAwayPO: {type:Number},
              remittanceUpdateRemarksOnLayAwayPO: {type:String},
              remittedAmountCROnLayAwayPO: {type:Number},
              endingBalanceAfterLastRemittanceOnLayAwayPO: {type:Number},
              priceAdjustmentAppliedOnLayAwayPO: {type:Boolean}
            }],
            createdAt: {type:Date, default:Date.now, required:true}, 
            lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));

        //StandardPurchaseOrder Model
        const standardPurchaseOrderModel = mongoose.model('StandardPurchaseOrder', new mongoose.Schema({
          standardPurchaseOrderId: {type:String, default:generateCombinedPOShortId, unique:true},
            createdAt: {type:Date, default:Date.now, required:true},
            standardPOrderForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
            standardPOrderForActiveSubscriberID: {type:String},
            standardPOrderUserProfileFullName: {type:String},
            standardPOrderUserProfilePhoneNo: {type:String},
            standardPOrderUserProfileEmail: {type:String},
            standardPOrderUserDeliveryAddress: {type:String},
            standardPurchaseOrderAssetSubscType: {type:String, default:'Outright Purchase'},
            StandardPurchaseOrderItems: [{
              standardPurchaseOrderCount: {type:Number},
                standardPurchaseOrderDate: {type:Date, required:true},
                standardPurchaseOrderIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
                standardPurchaseOrderIntentID: {type:String},
                standardPurchaseOrderIntentItemCode: {type:String},
                standardPurchaseOrderIntentItemName: {type:String},
                standardPurchaseOrderIntentDesc: {type:String},
                standardPurchaseOrderNoOfUnitBought: {type:Number, required:true},
                standardPurchaseOrderUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
                standardPurchaseOrderUnitOfMeasure: {type:String},
                standardPurchaseOrderUnitPrice: {type:Number},
                standardPurchaseOrderTotalStartPrice: {type:Number},
                standardPurchaseOrderNewPriceAlert: {type:Number},
                PriceChangeOnStandardPOHistoryDetails: [{
                  priceChangeOnStandardPODate: {type:Date, default:Date.now},
                  priceChangeOnStandardPORemarks: {type:String},
                  newUnitPriceAmountOnStandardPO: {type:Number},
                  newTotalPriceAmountOnStandardPO: {type:Number},
                  priceAdjustmentAppliedOnStandardPO: {type:Boolean, default:false}
                }],
                PriceReverseAlertDetailsOnStandardPO: [{
                  standardPOReverseDate: {type:Date, default:Date.now},
                  standardPOReversalID: {type:String},
                  standardPOReverseOldPrice: {type:Number},
                  standardPOReverseNewPriceAlertRemarks: {type:String},
                  standardPOReverseNewPriceAlert: {type:Number}
                }],
                RemittanceBalanceToBePaidDetailsOnStandardPO: [{
                  priceChangeOnStandardPODate: {type:Date, default:Date.now},
                  isRemittanceAfterPriceChangeOnStandardPO: {type:Boolean},
                  remitDateOnStandardPO: {type:Date, default:Date.now},
                  remittanceExpectedBalToBePaidStandardPO: {type:Number},
                  remittanceUpdateRemarksOnStandardPO: {type:String},
                  remittedAmountCROnStandardPO: {type:Number},
                  endingBalanceAfterLastRemittanceOnStandardPO: {type:Number},
                  priceAdjustmentAppliedOnStandardPO: {type:Boolean, default:false},
                }],
                StandardPurchaseOrderCumulativeBalance: [{
                  cumulativeBalance: {type:Number}
                }],
                StandardPurchaseOrderItemsGrandTotal: [{
                  updatedAt: {type:Date, default:Date.now},
                  standardPurchaseOrderItemsGrandTotal: {type:Number}
                }],
              }],
              TotalRemittanceMadeSoFarOnStandardPO: [{
                remitDateOnStandardPO: {type:Date, default:Date.now},
                remittedDateOnStandardPO: {type:Date},
                remittedAmountOnStandardPO: {type:Number},
                remittedRemarksOnStandardPO: {type:String},
                TotalPaymentsMadeSoFarOnStandardPO: {type:String}
              }],
              lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));

        //StandardSaleInvoice Model
        const standardSaleOrderModel = mongoose.model('StandardSaleOrder', new mongoose.Schema({
          standardSaleInvoiceId: {type:String, default:generateCombinedPOShortId, unique:true},
            createdAt: {type:Date, default:Date.now, required:true},
            standardSaleInvoiceForActiveSubscriberRefID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
            standardSaleInvoiceForActiveSubscriberID: {type:String},
            standardSaleInvoiceUserProfileFullName: {type:String},
            standardSaleInvoiceUserProfilePhoneNo: {type:String},
            standardSaleInvoiceUserProfileEmail: {type:String},
            standardSaleInvoiceUserDeliveryAddress: {type:String},
            standardSaleInvoiceAssetSubscType: {type:String, default:'Outright Purchase'},
            StandardSaleInvoiceItems: [{
              standardSaleCount: {type:Number},
              standardSaleInvoiceDate: {type:Date, required:true},
              standardSaleInvoiceIntent: {type:Schema.Types.ObjectId, ref:'ItemInformation', required:true},
              standardSaleInvoiceIntentID: {type:String},
              standardSaleInvoiceIntentItemCode: {type:String},
              standardSaleInvoiceIntentItemName: {type:String},
              standardSaleInvoiceIntentDesc: {type:String},
              standardSaleInvoiceNoOfUnitBought: {type:Number, required:true},
              standardSaleInvoiceUnitOfMeasureRefID: {type:Schema.Types.ObjectId, ref:'UOM', required:true},
              standardSaleInvoiceUnitOfMeasure: {type:String},
              standardSaleInvoiceUnitPrice: {type:Number},
              standardSaleInvoiceTotalStartPrice: {type:Number},
              standardSaleInvoiceNewPriceAlert: {type:Number},
              PriceChangeOnStandardSaleInvoiceHistoryDetails: [{
                  priceChangeOnStandardSaleInvoiceDate: {type:Date, default:Date.now},
                  priceChangeOnStandardSaleInvoiceRemarks: {type:String},
                  newUnitPriceAmountOnStandardSaleInvoice: {type:Number},
                  newTotalPriceAmountOnStandardSaleInvoice: {type:Number},
                  priceAdjustmentAppliedOnStandardSaleInvoice: {type:Boolean, default:false}
                }],
                PriceReverseAlertDetailsOnStandardSaleInvoice: [{
                  standardSaleInvoiceReverseDate: {type:Date, default:Date.now},
                  standardSaleInvoiceReversalID: {type:String},
                  standardSaleInvoiceReverseOldPrice: {type:Number},
                  standardSaleInvoiceReverseNewPriceAlertRemarks: {type:String},
                  standardSaleInvoiceReverseNewPriceAlert: {type:Number}
                }],
                RemittanceBalanceToBePaidDetailsOnStandardSaleInvoice: [{
                  priceChangeOnStandardSaleInvoiceDate: {type:Date, default:Date.now},
                  isRemittanceAfterPriceChangeOnStandardSaleInvoice: {type:Boolean},
                  remitDateOnStandardSaleInvoice: {type:Date, default:Date.now},
                  remittanceExpectedBalToBePaidStandardSaleInvoice: {type:Number},
                  remittanceUpdateRemarksOnStandardSaleInvoice: {type:String},
                  remittedAmountCROnStandardSaleInvoice: {type:Number},
                  endingBalanceAfterLastRemittanceOnStandardSaleInvoice: {type:Number},
                  priceAdjustmentAppliedOnStandardSaleInvoice: {type:Boolean, default:false},
                }],
                StandardSaleInvoiceCumulativeBalance: [{
                  cumulativeBalance: {type:Number}
                }],
                StandardSaleInvoiceItemsGrandTotal: [{
                  updatedAt: {type:Date, default:Date.now},
                  standardSaleInvoiceItemsGrandTotal: {type:Number}
                }],
              }],
              TotalRemittanceMadeSoFarOnStandardSaleInvoice: [{
                remitDateOnStandardSaleInvoice: {type:Date, default:Date.now},
                remittedDateOnStandardSaleInvoice: {type:Date},
                remittedAmountOnStandardSaleInvoice: {type:Number},
                remittedRemarksOnStandardSaleInvoice: {type:String},
                TotalPaymentsMadeSoFarOnStandardSaleInvoice: {type:String}
              }],
              lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));
      
        //PaymentClass Model
        const paymentClassModel = mongoose.model('PaymentClass', new mongoose.Schema({
          paymentClassName:String,
          paymentClassDesc: String,
          createdAt:Date,
          lastUpdatedAt:Date
        }));

        //remittanceLayAwayPO Model
        const remittanceLayAwayPOModel = mongoose.model('Remittance', new mongoose.Schema({
         remittanceForWhichLayAwayPORefID: {type:Schema.Types.ObjectId, ref:'LayAwayPurchaseOrder', required:true},
            createdAt: {type:Date, default:Date.now, required:true},
            remittanceDate: {type:Date, default:Date.now, required:true},
            remittanceReferenceID: {type:String, default:generateCombinedRemittanceShortId, unique:true},
            remittanceForWhichLayAwayPurchaseOrderID: {type:String},
            remittanceForWhichActiveSubscriberID: {type:String},
            remittanceActiveUserFullName: {type:String},
            remittancePOPhoneNo: {type:String},
            remittanceAmount_CR: {type:Number, required:true},
            remittanceDueBalance: {type:Number},
            remittancePaymentRefClass: {type:Schema.Types.ObjectId, ref:'PaymentClass', required:true},
            remittancePaymentClass: {type:String},
            remittanceOnLayWayPORemarks: {type:String, required:true},
            lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));

        //remittanceStandardPO Model
        const remittanceStandardPOModel = mongoose.model('RemittanceStandardPO', new mongoose.Schema({
          remittanceReferenceID: {type:String, default:generateCombinedRemittanceShortId, unique:true},
          remittanceForWhichStandardPORefID: {type:Schema.Types.ObjectId, ref:'StandardPurchaseOrder', required:true},
          createdAt: {type:Date, default:Date.now, required:true},
          remittanceDate: {type:Date, default:Date.now, required:true},
          remittanceForWhichStandardPurchaseOrderID: {type:String},
          remittanceForWhichActiveSubscriberID: {type:String},
          remittanceActiveUserFullName: {type:String},
          remittancePOPhoneNo: {type:String},
          remittanceByUserEmailAddress: {type:String},
          remittanceAmount_CR: {type:Number, required:true},
          remittanceDueBalance: {type:Number},
          remittancePaymentRefClass: {type:Schema.Types.ObjectId, ref:'PaymentClass', required:true},
          remittancePaymentClass: {type:String},
          remittanceOnStandardPORemarks: {type:String, required:true},
          lastUpdatedAt: {type:Date, default:Date.now, required:true}
        }));

        //remittanceScheme Model
        const remittanceSchemeModel = mongoose.model('RemittanceScheme', new mongoose.Schema({
          remittanceOnSchemeID: {type:String, required:true, unique:true},
          remittanceForWhichUserSchemeTransID: {type:Schema.Types.ObjectId, required:true, ref:'UserScheme'},
          createdAt: {type:Date, default:Date.now,},
          remittanceOnSchemeDate: {type: Date, default:Date.now},
          remittanceForWhichSchemeID: {type:String},
          remittanceForWhichActiveUserIDWhoSchemed: {type:String, required:true},
          remittanceActiveUserFullNameWhoSchemed: {type:String, required:true},
          remittanceSchemePhoneNo: {type:String, required:true},
          remittanceSchemeAmount_CR: {type:Number, required:true},
          remittanceSchemeDueBalance: {type:Number, required:true},
          remittanceSchemePaymentRefClass: {type:Schema.Types.ObjectId, required:true, ref:'PaymentClass'},
          remittanceSchemePaymentClass: {type:String, required:true},
          remittanceSchemeRemarks: {type:String, required:true},
          lastUpdatedAt: {type:Date, default:Date.now},
        }));

        //eCommerceProfile Model
        const eCommerceProfileModel = mongoose.model('ECommerceProfile', new mongoose.Schema({
          eCommerceProfileId: {type:String, required:true},
          eCommerceProfileName: {type:String, required:true},
          itemProfiling: [{
            itemAvailability: {type:String, enum:['IN-STOCK/AVAILABLE','OUT-OF-STOCK', 'BACKORDER', 'DISCONTINUED', 'OTHERS'], required:true},
            itemPricingValue: {type:String, enum:['BUDGET/VALUE', 'MID-RANGE', 'HIGH-END', 'OTHERS'], required:true},
            itemProductLifeCycle: {type:String, enum:['BEST SELLERS','CLEARANCE/SALE', 'SEASONAL', 'OTHERS'], required:true},
            itemCustomization: {type:String, enum:['PERSONALIZED', 'MADE-TO-ORDER', 'OTHERS'], required:true},
            itemSustainability: {type:String, enum:['ECO-FRIENDLY/SUSTAINABLE', 'ORGANIC', 'FAIR-TRADE', 'OTHERS'], required:true},
            itemAttributes: {type:String, enum:['COLOR', 'SIZE', 'STYLE', 'MATERIAL', 'OTHERS'], required:true},
            itemOtherAttrbutes: {type:String, enum:['EXCLUSIVE', 'LIMITED EDITION', 'REFURBISHED', 'OPEN-BOX','OTHERS'], required:true},
          }],
          createdAt: {type:Date, default:Date},
          lastUpdatedAt: {type:Date, default:Date},
        }));

        //Scheme Model
        const schemeModel = mongoose.model('SchemeInformation', new mongoose.Schema({
          schemaID: {type:String, unique:true, required:true},
          itemRefIDToBeSchemed: {type:Schema.Types.ObjectId, ref:'ItemInformation', unique:true},
          itemIDToBeSchemed: {type:String},
          itemNameToBeSchemed: {type:String},
          itemDescriptionToBeSchemed: {type:String},
          schemeName: {type:String, required:true},
          schemeShortDescription: {type:String, required:true},
          itemToBeSchemedOriginalPrice: {type:Number, required:true},
          schemeRefUnitOfMeasure: {type:Schema.Types.ObjectId, ref:'UnitOfMeasure', required:true},
          schemeUnitOfMeasure: {type:String},
          schemeUnitPrice: {type:Number, required:true},
          schemeDiscountWaved: {type:Number},
          schemePaymentPlan: {type:String, required:true, enum:[
            'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE BEFORE DUE DATE', 'MAKE SECURITY DEPOSIT FIRST, PAY BALANCE ON DELIVERY',
            'PAYMENT ON DELIVERY', 'FULL PAYMENT UPFRONT']
          },
          schemeMinimumSecurityDeposit: {type:Number, required:true},
          totalUnitsAvailableForScheme: {type:Number, required:true},
          schemeStartDate: {type:Date, required:true},
          schemeEndDate: {type:Date, required:true},
          schemeStatus: {type:String, required:true, enum:['ACTIVE', 'INACTIVE']},
          schemeRunForHowManyDays: {type:String},
          postDateBegins: {type:Date, required:true},
          expectedNoOfDaysToDeliver: {type:Number, required:true},
          expectedDeliveryDate: {type:Date, required:true},
          createdAt: {type: Date, default:Date.now},
          schemePoolDetailsUpdate: [{
            schemeCount: {type:Number},
            userSchemeTransID: {type:String},
            userIDWhoSuccessfullySchemed: {type:String},
            userNameWhoSuccessfullySchemed: {type:String},
            userPhoneNoWhoSuccessfullySchemed: {type:String},
            userDurationBeforeActionWasTaken: {type:String},
            userAmountUserPaid: {type:Number},
            userSchemedHowManyUnits: {type:Number}
          }],
          noOfUnitsAvailableAfterAUserSchemed: {type:Number},
          lastUpdatedAt: {type:Date, default:Date.now}
        }));

        //CreateUserScheme Model
        const SchemeSaleOrderModel = mongoose.model('SchemeSaleOrder', new mongoose.Schema({
          userSchemeTransactionID: {type:String, required:true, unique:true},
          userRefIdRequiringScheme: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
          userFullNameRequiringScheme: {type:String},
          userEmailRequiringScheme: {type:String},
          userPhoneNoRequiringScheme: {type:String},
          userDeliveryAddressRequiringScheme: {type:String},
          schemeRefIDUserSchemed: {type:Schema.Types.ObjectId, ref:'SchemeInformation', required:true},
          schemeIDUserSchemed: {type:String},
          schemeItemNameUserSchemed: {type:String},
          schemeItemShortDescUserSchemed: {type:String},
          schemeNameUserSchemed: {type:String},
          schemeShortDescUserSchemed: {type:String},
          schemePaymentStructureUserSchemed: {type:String},
          userSchemeMinimumSecurityDeposit: {type:Number},
          schemePaymentDueDate: {type:Date},
          schemeItemOriginalPriceUserSchemed: {type:Number},
          schemeUnitPriceUserSchemed: {type:Number},
          schemeDiscountWavedUserSchemed: {type:Number},
          schemeNoOfUnitsUserSchemed: {type:Number, required:true},
          schemeTotalAmountUserSchemed: {type:Number},
          schemeTotalSecurityDeposit: {type:Number},
          schemeBalancePaymentBeforeDueDate: {type:Number},
          schemeUserSchemedStartDate: {type:Date},
          schemeUserSchemedEndDate: {type:Date},
          shemeUserSchemedPostDateBegins: {type:Date},
          expectedNoOfDaysToDeliver: {type:Number},
          expectedDeliveryDate: {type:Date},
          StatingBalanceOnSchemeHistory: [{
            startSchemeDate: {type:Date},
            startingBalanceRemarksOnScheme: {type:String},
            startingBalanceOnScheme: {type:Number}, 
          }],
          TotalRemittanceMadeSoFar: [{
            remitDateOnScheme: {type:Date},
            remittedSchemeDate: {type:Date},
            remittedSchemeAmount: {type:Number},
            remittedSchemeRemarks: {type:String},
            TotalPaymentsMadeSoFar: {type:String}
          }],
          RemittanceBalanceToBePaidDetails: [{
            remitOnSchemeDate: {type:Date},
            remittanceExpectedBalToBePaidOnScheme: {type:Number},
            remitOnSchemeRemarks: {type:String},
            remittedAmountCROnScheme: {type:Number},
            endingBalanceAfterLastRemittanceOnScheme: {type:Number}
          }],
          amountdDepositedForSchemeByUser: {type:Number},
          sumTotalAmountSecuritDepositsPaidByAllUsers: {type:Number}, 
          createdAt: {type: Date, default:Date.now},
          lastUpdatedAt: {type:Date, default:Date.now}
        }));

        //Project214 Model
        const project214Model = new Schema<IProject214Information>({
          projectShortId: {type:String, default:generateCombinedFOREAShortId, unique:true},
          projectName: {type:String, required:true},
          projectNameAlias: {type:String, required:true},
          projectDescription: {type:String, required:true},
          projectStartDate: {type:Date, required:true},
          projectCompletionLengthInMonths: {type:Number, required:true},
          projectCompletionDate: {type:Date},
          projectCurrentAcquisitionPhase: {type:String, required:true, enum: ['OFF-PLAN PURCHASE', 'UNDER CONSTRUCTION', 'NEWLY COMPLETED', 'READY-FOR-OCCUPANCY (RFO)', 
          'PRE-OWNED/RESALE', 'DISTRESSED/FORECLOSURE SALE', 'TURNKEY PROPERTY']},
          projectStructure: [{
            blockID: {type:String, default:generateBlockShortId, unique:true},
            blockName: {type:String, required:true},
            blockDescription: {type:String, required:true},
            houseDetails: [{
                  houseID: {type:String, default:generateHouseShortId, unique:true},
                  houseName: {type:String, required:true},
                  houseDescription: {type:String, required:true},
                  houseSalesPrice: {type:Number, required:true},
                  fractionalUnitDetails: [{
                          fractionalUnitID: {type:String, default:generateCombinedPropertyID, unique:true},
                          fractionalUnitName: {type:String, required:true},
                          fractionalUnitDescription: {type:String, required:true},
                          fractionUnitSalesPrice: {type:Number, required:true},
                          fractionalUnitSalesTag: {type:String, enum:['Not Yet Subscribed','Subscribed'], default:'Not Yet Subscribed'}
                          }]
                      }]
                  }],
            MultiSelectPaymentPlan: {selectedPlans: [{
            plan: {type:Schema.Types.ObjectId, ref:'PaymentPlan'},
            selectedPlanName: {type:String}
            }]},
            createdAt: {type:Date, default:Date.now},
            lastUpdatedAt: {type:Date, default:Date.now}
          });

          //PaymentPlan Model. First, Define the schema for OtherApplicableFlatFees & OtherApplicablePercentageFees
          const OtherApplicableFlatFeesSchema = new Schema({
            flatFeeName: {type:String, required:true},
            flatFeeAmount: {type:Number, required:true}
          });
          const OtherApplicablePercentageFeesSchema = new Schema({
            percentageFeeName: {type:String, required:true},
            percentageFeeAmount: {type:Number, required:true}
          });
          const paymentPlanForFractionalOwnershipModel = mongoose.model('PaymentPlanForFractionalOwnership', new mongoose.Schema({
            paymentPlanName: {type:String, required:true},
            paymentPlanDescription: {type:String, required:true},
            paymentType: {type:String, required:true},
            paymentFrequency: {type:String, required:true},
            fractionalUnitPropertyAmount: {type:Number, required:true, default:0},
            paymentDurationInMonths: {type:Number, required:true},
            interestRateIfRequired: {type:Number, required:true, default:0},
            interestFeeFaceValue: {type:Number, default:0},
            OtherApplicableFlatFees: [OtherApplicableFlatFeesSchema],
            OtherApplicablePercentageFees: [OtherApplicablePercentageFeesSchema],
            AmortizationSchedule: [{
              PaymentNoCount: {type:Number},
              PaymentDueDatePerFrequency: {type:Date},
              DuePaymentAmountPerFrequency: {type:Number},
              InterestFeesPayablePerFrequency: {type:Number},
              OtherFlatFeePayablePerFrequency: {type:Number},
              OtherPercentageFeePayablePerFrequency: {type:Number},
              TotalPayablePerFrequency: {type:Number},
              BalanceToBePaidPerFrequency: {type:Number}
              }],
            paymentPlanId: {type:String, unique:true, default:generateCombinedPaymentPlanShortId},
            createdOn: {type:Date, default:Date.now, required:true},
            lastUpdatedAt: {type:Date, default:Date.now, required:true}
          }));

          //SubscribeToProject214 Model
          const subscribeToProject214Model = mongoose.model('SubscribeToProject214', new Schema({
            subscribeP214OrderId: {type:String, unique:true, default:generateCombinedPOShortId},
            subscribersActiveID: {type:Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
            subscribersFullName: {type:String},
            subscribersEmail: {type:String},
            subscribersPhoneNumber: {type:String },
            subscribersContactAddress: {type:String},
            projectTheSubscriberIsInterestedIn: {type:Schema.Types.ObjectId, ref:'Project214Information', required:true},
            projectTheSubscriberIsInterestedInName: {type:String},
            projectTheSubscriberIsInterestedInShortDesc: {type:String},
            projectTheSubscriberIsInterestedInStartDate: {type:Date},
            projectTheSubscriberIsInterestedInCompletionDate: {type:Date},
            projectTheSubscriberIsInterestedInAcquisitionStage: {type:String},
            SubscribeToFractionsOfProject214: [{
              propertyCount: {type:Number},
              fractionalUnitID: {type:String},
              fractionalUnitName: {type:String},
              fractionalUnitDescription: {type:String},
              fractionalUnitUniqueIdentifier: {type:String},
              propertyAllocationNumber: {type:String},
              fractionUnitSalesPrice: {type:Number},
              fractionalUnitSalesTag: {type:String},
              isSelected: {type:Boolean, default:false}
            }],
            selectedUnits: [{type:String}],
            projectFractionalUnitsTotalSalePrice: {type:Number},
            projectTheSubscriberIsInterestedInPaymentPlanID: {type:Schema.Types.ObjectId, ref:'PaymentPlan', required:true},
            projectTheSubscriberIsInterestedInPaymentPlanName: {type:String},
            projectTheSubscriberIsInterestedInPaymentPlanShortDesc: {type:String},
            createdAt: {type:Date, required:true, default:Date.now()},
            lastUpdatedAt: {type:Date, required:true, default:Date.now()},
          }));

          //NairaWalletBalance Model
          const nairaWalletBalanceModel = mongoose.model('NairaWalletBalance', new Schema({
            nairaWalletOwner: {type:mongoose.Schema.Types.ObjectId, ref:'ActiveSubscriber', required:true},
            nairaWalletID: {type:String},
            nairaWalletOwnerFullName: {type:String},
            nairaWalletOwnerEmail: {type:String},
            nairaWalletOwnerPhoneNumber: {type:String},
            nairaWalletCurrency: {type:String, default:'NGN'},
            nairaWalletOpeningBalance: {type:Number},
            depositFundsToNairaWallet: {type:Number},
            withdrawFundsFromNairaWallet: {type:Number},
            nairaWalletTransactionRemarks: {type:String, required:true},
            nairaWalletClosingBalance: {type:Number},
            createdAt: {type:Date, required:true, default:Date.now},
            lastUpdatedAt: {type:Date, required:true, default:Date.now}
          }));
        
        
        //---DEFAULT COMPONENTS BEGIN HERE --//
        //1. appUser Component
        const accountHolderData = await accountHolderModel.find({}).exec();

        //2. activeSubscriber Component
        const activeSubscriberData = await activeSubscriberModel.find({})
        .populate({model:'AccountHolder', path:'', select:'accountHolderPhoneNo'})
        .populate({model:'ProfiledPartner', path:'', select:'profiledPartnerName'})
        .exec();

        //3. itemCategory Component
        const itemCategoryData = await itemCategoryModel.find({}).exec();

        //4. itemType Component
        const itemTypeData = await itemTypeModel.find({}).exec();

        //5. itemsubType Component
        const itemSubTypeData = await itemSubTypeModel.find({}).exec();

        //6. itemBrand Component
        const itemBrandData = await itemBrandModel.find({}).exec();

        //7. unitOfMeasure Component
        const unitOfMeasureData = await unitOfMeasureModel.find({}).exec();

        //8. item Information Component
        const itemInformationData = await itemInformationModel.find({})
        .populate({model:'ItemCategory', path:'', select:'itemCategoryName'})
        .populate({model:'ItemType', path:'', select:'itemTypeName'})
        .populate({model:'ItemSubType', path:'', select:'itemBrandName'})
        .populate({model:'ItemBrand', path:'', select:'itemBrandName'})
        .exec();
        
        //9. updateItemPrice Component
        const updateItemPriceData = await updateItemPriceModel.find({})
        .populate({model:'ItemInformation', path:'', select:'itemInformationName'})
        .exec();
    
        //10. profiledPartner Component
        const profiledPartnerData = await profiledPartnerModel.find({}).exec();

        //11. subscriptionType Component
        const subscriptionTypeData = await subscriptionTypeModel.find({}).exec();

        //12. layAwaypurchaseOrder Component
        const layAwayPurchaseOrderData = await layAwayPurchaseOrderModel.find({})
        .populate({model:'ActiveSubscriber', path:'', select:'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName'})
        .populate('ItemInfomation')
        .populate('UOM')
        .populate('SubcriptionType')
        .exec();

        //13. standardPurchaseOrder Component
        const standardPurchaseOrderData = await standardPurchaseOrderModel.find({})
        .populate({model:'ActiveSubscriber', path:'', select:'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName'})
        .populate('ItemInfomation')
        .populate('UOM')
        .populate('SubcriptionType')
        .exec();

        //13b. standardSaleInvoice Component
        const standardSaleOrderData = await standardSaleOrderModel.find({})
        .populate({model:'ActiveSubscriber', path:'', select:'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName'})
        .populate('ItemInfomation')
        .populate('UOM')
        .populate('SubcriptionType')
        .exec();

        //14. paymentClass Component
        const paymentClassData = await paymentClassModel.find({}).exec();

        //15. remittanceLayAwayPO Component
        const remittanceLayAwayPOData = await remittanceLayAwayPOModel.find({})
        .populate({path:'', model:'LayWayPurchaseOrder', select:'purchaseOrderId'})
        .populate({path:'', model:'PaymentClass', select:'paymentClassName'})
        .exec();

        //16. remittanceStandardPO Component
        const remittanceStandardPOData = await remittanceStandardPOModel.find({})
        .populate({path:'', model:'StandardPurchaseOrder', select:'standardPurchaseOrderId'})
        .populate({path:'', model:'PaymentClass', select:'paymentClassName'})
        .exec();

        //17. remittanceScheme Component
        const remittanceSchemeData = await remittanceSchemeModel.find({})
        .populate({path:'', model:'SchemeInformation', select:'schemeID'})
        .populate({path:'', model:'PaymentClass', select:'paymentClassName'})
        .exec();


        //18. eCommerceProfile Component
        const eCommerceProfileData = await eCommerceProfileModel.find({}).exec();

        //19. Schema Component
        const schemeInformationData = await schemeModel.find({})
        .populate({model:'ItemInformation', path:'', select:'itemInformationName'})
        .populate({model:'UOM', path:'', select:'unitofMeasureID'})
        .exec();

        //20. createUserScheme Component
        const SchemeSaleOrderData = await SchemeSaleOrderModel.find({})
        .populate({model:'SchemeInformationProfile', path:'', select:'schemeID'})
        .exec();

        //21. projectInformation Component
        const Project214InformationModel = mongoose.model('Project214Information', project214Model);
        const project214Data = await Project214InformationModel.find({})
        .exec();

        //22. paymentPlan Component
        const paymentPlanForFractionalOwnershipData = await paymentPlanForFractionalOwnershipModel.find({})
        .exec();

       //23. SubscribeToProject214 Component
        const subscribeToProject214Data = await subscribeToProject214Model.findById('subscribeP214OrderId')
        .populate({model:'ActiveSubscriber', path:'subscribersActiveID', select:'fullName email' }) 
        .populate({model:'Project214Information', path:'project214ID', select:'projectName location' }) 
        .populate({model:'PaymentPlan', path:'paymentPlanID', select:'planName installmentAmount' }) 
        .populate({model:'SubscribeToProject214',  path:'SubscribeToFractionsOfProject214', 
          populate:{model:'FractionalUnit', path:'fractionalUnitID', select:'fractionalUnitName fractionUnitSalesPrice'}})
        .exec();

        //24. NairaWalletBalance Component
        const nairaWalletBalanceData = await nairaWalletBalanceModel.find({})
        .populate({model:'ActiveSubscriber', path:'', select:'activeUserFullName'})
        .exec();

      //---DEFAULT COMPONENTS ENDS HERE --//

      //return the data from the database      
      return {itemCategoryData, itemTypeData, itemSubTypeData, itemBrandData, eCommerceProfileData, unitOfMeasureData, itemInformationData, updateItemPriceData,
          profiledPartnerData, paymentClassData, subscriptionTypeData, accountHolderData, activeSubscriberData, layAwayPurchaseOrderData, standardPurchaseOrderData,
          standardSaleOrderData, remittanceLayAwayPOData, remittanceStandardPOData, remittanceSchemeData, schemeInformationData, SchemeSaleOrderData, project214Data, 
          paymentPlanForFractionalOwnershipData, subscribeToProject214Data, nairaWalletBalanceData};

} catch (error) {
    console.error('Error Fetching Data from MongoDB:', error);
    return {error: 'An error occurred while fetching ProductBrand data from the database'};
  }finally {
        await mongoose.disconnect();
      }
};

//ComponentLoader to load custom components
const componentLoader = new ComponentLoader();
const Components = {Dashboard:componentLoader.add('Dashboard', './Dashboard')};
const fractionalUnitsComponent = componentLoader.add("FractionalUnitsList", './admin/customComponents/FractionalUnitsList');

//Handles SideBar Navigation Pattern
const businessNavigation = {name:'Business Profile', icon:'transaction'};
const customersNavigation = {name:'Customers Profile', icon:'customer'};
const itemsNavigation = {name:'Item Profile', icon:'item'};
const fractionalOwnership = {name:'F.O.R.E.A Profile', icon:'properties'};
const updateNavigation = {name:'Update Profile', icon:'update'};
const transactionsNavigation = {name:'Transaction Profile', icon:'payment'};
const remittanceNavigation = {name:'Remittance Profile', icon:'remittance'};
const WalletNavigation = {name:'Wallet Profile', icon:'wallet'};

//Setup AdminJS || handles all resources- database,assets,components, etc.
const admin = new AdminJS({
  databases: [mongooseDB],
  rootPath: '/admin',
  branding: {companyName:'AssetLoop Nigeria Limited'},
  assets: {styles:["/sidebar.css"]},
  resources:[
    {resource:ProfiledPartner, options:{navigation:businessNavigation, id:'ProfiledPartner', search:{type:String, isVisible:{filter:true}}}},
    {resource:SubscriptionType, options:{navigation:businessNavigation, id:'SubscriptionType', search:{type:String, isVisible:{filter:true}}}},
    {resource:PaymentClass, options:{navigation:businessNavigation, id:'PaymentClass', search:{type:String, isVisible:{filter:true}}}},
    {resource:PaymentPlanForFractionalOwnership, options:{navigation:businessNavigation, id:'PaymentPlanForFractionalOwnership', search:{type:String, isVisible:{filter:true}}}},
    {resource:UOM, options:{navigation:businessNavigation, id:'UOM', search:{type:String, isVisible:{filter:true}}}},
    {resource:AccountSubscriber, options:{navigation:customersNavigation, id:'AccountSubscriber', search:{type:String, isVisible:{filter:true}}}},
    {resource:ActiveSubscriber, options:{navigation:customersNavigation, id:'ActiveSubscriber', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemCategory, options:{navigation:itemsNavigation, id:'ItemCategory', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemBrand, options:{navigation:itemsNavigation, id:'ItemBrand', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemType, options:{navigation:itemsNavigation, id:'ItemType', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemSubType, options:{navigation:itemsNavigation, id:'ItemSubType', search:{type:String, isVisible:{filter:true}}}},
    {resource:ECommerceProfile, options:{navigation:itemsNavigation, id:'ECommerceProfile', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemInformation, options:{navigation:itemsNavigation, id:'ItemInformation', search:{type:String, isVisible:{filter:true}}}},
    {resource:SchemeInformation, options:{navigation:itemsNavigation, id:'SchemeInformation', search:{type:String, isVisible:{filter:true}}}},
    {resource:Project214Information, options:{navigation:fractionalOwnership, id:'Project214Information', search:{type:String, isVisible:{filter:true}}, properties:{project214AvailableFractionalUnitsList: {}}}},
    {resource:UpdateItemPrice, options:{navigation:updateNavigation, id:'UpdateItemPrice', search:{type:String, isVisible:{filter:true}}, actions:{edit:false, delete:false}}},
    {resource:UpdateScheme, options:{navigation:updateNavigation, id:'UpdateScheme', search:{type:String, isVisible:{filter:true}}}},
    {resource:StandardSaleOrder, options: {navigation:transactionsNavigation, id:'StandardSaleOrder', search:{type:String, isVisible:{filter:true}}}},
    {resource:SchemeSaleOrder, options:{navigation:transactionsNavigation, id:'SchemeSaleOrder', search:{type:String, isVisible:{filter:true}}}},
//     {resource:SubscribeToProject214, 
//       options:{
//         navigation:transactionsNavigation, 
//         id:'SubscribeToProject214', 
//         search:{type:String, isVisible:{filter:true}},
//         properties: {
//           projectTheSubscriberIsInterestedIn: {
//             type:'reference',
//             reference:'Project214Information',
//             isRequired:true, 
//             isVisible:{list:true, show:true, edit:true, filter:true},
//           },
//         SubscribeToFractionsOfProject214:{
//           type:'mixed', 
//           isArray:true, 
//           components:{
//             list:fractionalUnitsComponent, 
//             show:fractionalUnitsComponent, 
//             edit:fractionalUnitsComponent, 
//             new:fractionalUnitsComponent
//             }
//           },
//           projectFractionalUnitsTotalSalePrice: {
//             type: 'number',
//             isVisible: {list:true, show:true, edit:false, new:false},
//           },
//         },
//         actions: {
//         //✅Populate SubscribeToFractionsOfProject214 dynamically before showing
//         list: {
//           before: async (request) => {
//             console.log("Request Query:", request.query);
//             //If projectTheSubscriberIsInterestedIn is not in the query, set a default value
//             if (request.query.projectTheSubscriberIsInterestedIn) {
//               const availableUnits = await getAvailableFractionalUnits(request.query.projectTheSubscriberIsInterestedIn);
//               console.log("Available Units in List Before Hook:", availableUnits); // Log the fetched units
//               request.query.availableFractionalUnits = availableUnits;
//             } else {
//               console.warn("projectTheSubscriberIsInterestedIn is undefined in request.query");
//             }
//             return request;
//           },
//         },
//         show: {
//           after: async (response) => {
//             const record = response.record;
//             console.log("Record Params:", record?.params); 
//             if (record?.params?.projectTheSubscriberIsInterestedIn) {
//               const availableUnits = await getAvailableFractionalUnits(
//                 record.params.projectTheSubscriberIsInterestedIn,
//                 record.params.SubscribeToFractionsOfProject214?.map((unit) => unit.fractionalUnitID) || []);
//                 console.log("Available Units in Show After Hook:", availableUnits); // Log the fetched units
//                 record.params.availableFractionalUnits = availableUnits;
//             } else {
//               console.warn("projectTheSubscriberIsInterestedIn is undefined in record.params");
//             }
//             return response;
//           },
//         },
//         edit: {
//           after: async (response) => {
//             const record = response.record;
//             console.log("Record Params:", record?.params); // Debugging
//             if (record?.params?.projectTheSubscriberIsInterestedIn) {
//               const availableUnits = await getAvailableFractionalUnits(
//                 record.params.projectTheSubscriberIsInterestedIn,
//                 record.params.SubscribeToFractionsOfProject214?.map((unit) => unit.fractionalUnitID) || []);
//                 console.log("Available Units in Edit After Hook:", availableUnits); // Log the fetched units
//               record.params.availableFractionalUnits = availableUnits;
//             } else {
//               console.warn("projectTheSubscriberIsInterestedIn is undefined in record.params");
//             }
//             return response;
//           },
//         },
//         new: {
//           before: async (request) => {
//             console.log("Request Payload:", request.payload);
//             if (request.payload.projectTheSubscriberIsInterestedIn) {
//               const availableUnits = await getAvailableFractionalUnits(request.payload.projectTheSubscriberIsInterestedIn);
//               console.log("Available Units in New Before Hook:", availableUnits); // Log the fetched units
//               request.payload.availableFractionalUnits = availableUnits;
//             } else {
//               console.warn("projectTheSubscriberIsInterestedIn is undefined in request.payload");
//             }
//             return request;
//           },
//         },
//     },
//   },
// },
{resource: SubscribeToProject214,
  options: {
    navigation:transactionsNavigation, 
    id:'SubscribeToProject214', 
    search:{type:String, isVisible:{filter:true}},
    properties: {
      projectTheSubscriberIsInterestedIn: {
        type:'reference',
        reference:'Project214Information',
        isRequired:true, 
        isVisible:{list:true, show:true, edit:true, filter:true},
      },
      selectedUnits: {
        isVisible: {
          list: false, // Hide in the list view
          edit: true,  // Show in the edit view
          show: true,  // Show in the show view
          filter: false, // Hide in the filter
        },
        components: {
          edit: UnitSelectionComponent, // Use the custom component for the edit view
          show: UnitSelectionComponent, // Use the custom component for the show view
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
    {resource:LayAwayPurchaseOrder, options: {navigation:transactionsNavigation, id:'LayAwayPurchaseOrder', search:{type:String, isVisible:{filter:true}}}},
    {resource:StandardPurchaseOrder, options: {navigation:transactionsNavigation, id:'StandardPurchaseOrder', search:{type:String, isVisible:{filter:true}}}},
    {resource:RemittanceOnLayAwayPO, options:{navigation:remittanceNavigation, id:'RemittanceOnLayAwayPO', search:{type:String, isVisible:{filter:true}}}},
    {resource:RemittanceOnStandardPO, options:{navigation:remittanceNavigation, id:'RemittanceOnStandardPO', search:{type:String, isVisible:{filter:true}}}},
    {resource:RemitOnScheme, options:{navigation:remittanceNavigation, id:'RemitOnScheme', search:{type:String, isVisible:{filter:true}}}},
    {resource:NairaWalletBalance, options:{navigation:WalletNavigation, id:'NairaWalletBalance', search:{type:String, isVisible:{filter:true}}}},
    ],
    dashboard: {component:Components.Dashboard, handler:dashboardHandler},
    componentLoader,
});
//watch the AdminJS instance
admin.watch();

//Router
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {authenticate, cookieName:'adminjs', cookiePassword:'sessionsecret'}, null,
    {store:sessionStore, resave:true, saveUninitialized:true, secret:'sessionsecret', 
    cookie:{httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production'},
    name:'adminjs',
});

//Middleware for the Root Router
app.use(express.json());
app.use(admin.options.rootPath, adminRouter)

//Use the purchaseOrder route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', lawAwayPurchaseOrderRouter);

//Use the standardPurchaseOrder route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', standardPurchaseOrderRouter);

//Use the standardSaleInvoice route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', standardSaleOrderRouter);

//Use the scheme information route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', schemeInformationRouter);

//Use the userScheme route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', schemeSaleOrderRouter);

//Use the project214 route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', Project214Router);

//Use the paymentPlan route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
app.use('/api', paymentPlanRouter);

//Define the route for fetching subscription to Project214
app.use('/api', subscribeToProject214Router);

//Define the route for fetching nairaWallet
app.use('/api', nairaWalletRouter);
  
//Register the route for fetching full user profiles 
app.use('/api/userfullprofile', getUserProfiles);

//Set up view engine
app.set('view engine', 'ejs');
//Set the views directory
console.log('Views directory:', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'views'));

//Method 1:Enable Mongoose debugging to get detailed logs about the validation errors
//mongoose.set('debug', true);

//Method 2:Enable Mongoose debugging to get detailed logs about the validation errors
// mongoose.set("debug", function (collectionName, method, query, doc) {
//   console.log(`🚀 Mongoose Query - ${method.toUpperCase()} on ${collectionName}`);
//   console.log("🔍 Query:", JSON.stringify(query, null, 2));
//   console.log("📄 Document:", JSON.stringify(doc, null, 2));
// });


//Start the Server
app.listen(PORT, () => {console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)})};
start();


