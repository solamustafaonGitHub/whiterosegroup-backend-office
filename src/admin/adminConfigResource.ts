import AdminJS, { ComponentLoader, PageContext } from 'adminjs';
import AdminJSExpress from '@adminjs/express';

import mongoose, {Schema, Document} from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import connectMongoDBSession from 'connect-mongodb-session';

import session from 'express-session';
import bcrypt from 'bcrypt';

import PDFDocument from 'pdfkit';
import {jsPDF} from "jspdf";

import {AccountSubscriber, IAccountSubscriber} from '../models/accountSubscriber.model.js'
import {ActiveSubscriber, IActiveSubscriber} from '../models/activeSubscriber.model.js';
import ActiveUserResourceOptions from '../admin/activeUserResource.js'; 
import {ItemCategory} from "../models/itemCategory.model.js"
import {ItemType} from '../models/itemType.model.js'
import {ItemSubType} from '../models/itemSubType.model.js'
import {ItemBrand} from '../models/itemBrand.model.js' 
import {ItemInformation, IItemInformation} from "../models/itemInformation.model.js"
import {UpdateItemPrice} from '../models/updateItemPrice.model.js';
import {ProfiledPartner} from '../models/profiledPartner.model.js' 
import {SubscriptionType} from '../models/subscriptionType.model.js'
import {LayAwayPurchaseOrder, ILayAwayPurchaseOrder} from '@src/models/layAwayPurchaseOrder.model.js';
import {PaymentClass} from '../models/paymentClass.model.js';
import {RemittanceOnLayAwayPO, IRemittanceLayAwayPO} from '../models/remittanceOnLayAwayPO.model.js';
import {ECommerceProfile, IECommerceProfile, IECommerceProfileItem} from '../models/eCommerceProfile.model.js';

const mongooseDB = await mongoose.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360')
const MongoDBStore = connectMongoDBSession(session);
const sessionStore = new MongoDBStore({
    uri:'mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360',
    collection:'session'});
    sessionStore.on('error', (error) => {
    console.error('MongoDB Session Store Error:', error);
});

//ComponentLoader to load custom components
const componentLoader = new ComponentLoader();
const Components = {
    Dashboard:componentLoader.add('Dashboard', './Dashboard'), // Add this line if you have a Dashboard component
};
  
//Handles SideBar Navigation Pattern
const businessNavigation = {name:'Business Profile', icon:'transaction'};
const customersNavigation = {name:'Customers Profile', icon:'customer'};
const itemsNavigation = {name:'Item Profile', icon:'item'};
const realEstateNavigation = {name:'Real Estate Profile', icon:'properties'};
const updateNavigation = {name:'Update Profile', icon:'update'};
const transactionsNavigation = {name:'Transaction Profile', icon:'payment'};

const admin = new AdminJS({
    databases: [mongooseDB],
    branding: {companyName:'Asset360 Nigeria Limited'},
    assets: {styles:["/sidebar.css"]},
  resources: [
    {resource:ProfiledPartner, options:{navigation:businessNavigation, id:'ProfiledPartner', search:{type:String, isVisible:{filter:true}}}},
    {resource:SubscriptionType, options:{navigation:businessNavigation, id:'SubscriptionType', search:{type:String, isVisible:{filter:true}}}},
    {resource:PaymentClass, options:{navigation:businessNavigation, id:'PaymentClass', search:{type:String, isVisible:{filter:true}}}},
    {resource:AccountSubscriber, options:{navigation:customersNavigation, id:'AccountSubscriber', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemCategory, options:{navigation:itemsNavigation, id:'ItemCategory', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemBrand, options:{navigation:itemsNavigation, id:'ItemBrand', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemType, options:{navigation:itemsNavigation, id:'ItemType', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemSubType, options:{navigation:itemsNavigation, id:'ItemSubType', search:{type:String, isVisible:{filter:true}}}},
    {resource:ECommerceProfile, options:{navigation:itemsNavigation, id:'ECommerceProfile', search:{type:String, isVisible:{filter:true}}}},
    {resource:ItemInformation, options:{navigation:itemsNavigation, id:'ItemInformation', search:{type:String, isVisible:{filter:true}}}},
    {resource:UpdateItemPrice, options:{navigation:updateNavigation, id:'UpdateItemPrice', search:{type:String, isVisible:{filter:true}}}},
    {
        resource: LayAwayPurchaseOrder,
        options: {
            navigation: transactionsNavigation,
            id: 'PurchaseOrder',
            search: {type:String, isVisible: {filter:true}},
            actions: {
                exportToPDF: { // Define the exportToPDF action directly within the actions object
                    actionType: 'record', 
                    icon: 'Export',
                    isAccessible: true,
                    handler: async (_request: any, response: { setHeader: (arg0: string, arg1: string) => void; }, context: { record: any; }) => {
                      const {record} = context;
  
                  if (record && record.params) {
                    try {
                      // 1. Fetch the necessary data from the model
                      const data = await LayAwayPurchaseOrder.findById(record.params._id).exec(); 
  
                      // 2. Process & tabularize the data
                      const tabularData = processDataForPDF(data);

                      function processDataForPDF(data: any) {
                        // Example implementation: extract and format the data
                        return {
                          purchaseOrderId: data.purchaseOrderId,
                          pOrderUserProfileFullName: data.pOrderUserProfileFullName,
                          pOrderUserProfilePhoneNo: data.pOrderUserProfilePhoneNo,
                          pOrderUserProfileEmail: data.pOrderUserProfileEmail,
                          purchaseOrderIntentItemName: data.purchaseOrderIntentItemName,
                          purchaseOrderUnitPrice: data.purchaseOrderUnitPrice,
                          purchaseOrderTotalStartPrice: data.purchaseOrderTotalStartPrice,
                          createdAt: data.createdAt,
                          lastUpdatedAt: data.lastUpdatedAt,
                        };
                      }
                      // 3. Generate the PDF
                      const pdfDocument = generatePDF(tabularData);

                      function generatePDF(data: any) {
                        const doc = new PDFDocument();
                        doc.fontSize(12).text(`Purchase Order ID: ${data.purchaseOrderId}`);
                        doc.fontSize(12).text(`User Full Name: ${data.pOrderUserProfileFullName}`);
                        doc.fontSize(12).text(`User Phone No: ${data.pOrderUserProfilePhoneNo}`);
                        doc.fontSize(12).text(`User Email: ${data.pOrderUserProfileEmail}`);
                        doc.fontSize(12).text(`Item Name: ${data.purchaseOrderIntentItemName}`);
                        doc.fontSize(12).text(`Unit Price: ${data.purchaseOrderUnitPrice}`);
                        doc.fontSize(12).text(`Total Start Price: ${data.purchaseOrderTotalStartPrice}`);
                        doc.fontSize(12).text(`Created At: ${data.createdAt}`);
                        doc.fontSize(12).text(`Last Updated At: ${data.lastUpdatedAt}`);
                        return doc;
                      }
                      // 4. Set response headers for PDF download
                      response.setHeader('Content-Type', 'application/pdf');
                      response.setHeader('Content-Disposition', 'attachment; filename="export.pdf"');
  
                      // 5. Send the PDF document in the response
                      pdfDocument.pipe(response as any);
                      pdfDocument.end();
                    
                      // 6. Return a RecordJSON object (even though you're sending a PDF)
                      return {
                      record:record.toJSON(record), // Include the original record data
                      params: { 
                      // You can add any additional information here if needed
                      pdfGenerated: true, 
                      },
                      };
                      }catch (error) {
                      console.error('Error generating PDF:', error);
                      // Handle the error appropriately (e.g., return an error response)
                      return { 
                        notice: {message: 'Error generating PDF. Please try again later.', type: 'error'}
                      };
                    }
                  }
                  return response; // Return the default response if there's an issue with the record
                },
                    },
                },
              },
         },
      {resource:RemittanceOnLayAwayPO, options:{navigation:transactionsNavigation, id:'RemittanceOnLayAwayPO', search:{type:String, isVisible:{filter:true}}}},
      //transactionResourceOptions,  // Adding the transaction table resource with PDF export functionality
  ],
    dashboard: {component:Components.Dashboard, handler:dashboardHandler},
    componentLoader,
  rootPath: '/admin',
});
//watch the AdminJS instance
admin.watch();

function dashboardHandler(request: any, response: any, context: PageContext): Promise<any> {
    throw new Error('Function not implemented.');
}



