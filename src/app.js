"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminjs_1 = __importStar(require("adminjs"));
const express_1 = __importDefault(require("@adminjs/express"));
const express_2 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importStar(require("mongoose"));
const AdminJSMongoose = __importStar(require("@adminjs/mongoose"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const express_session_1 = __importDefault(require("express-session"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const url = __importStar(require("url"));
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
//Model imports
const accountHolder_model_js_1 = require("./models/accountHolder.model.js");
const activeUser_model_js_1 = require("./models/activeUser.model.js");
const itemCategory_model_js_1 = require("./models/itemCategory.model.js");
const itemType_model_js_1 = require("./models/itemType.model.js");
const itemSubType_model_js_1 = require("./models/itemSubType.model.js");
const itemBrand_model_js_1 = require("./models/itemBrand.model.js");
const itemInformation_model_js_1 = require("./models/itemInformation.model.js");
const updateItemPrice_model_js_1 = require("./models/updateItemPrice.model.js");
const profiledPartner_model_js_1 = require("./models/profiledPartner.model.js");
const subscriptionType_model_js_1 = require("./models/subscriptionType.model.js");
const purchaseOrder_model_js_1 = require("./models/purchaseOrder.model.js");
const paymentClass_model_js_1 = require("./models/paymentClass.model.js");
const remittance_model_js_1 = require("./models/remittance.model.js");
const eCommerceProfile_model_js_1 = require("./models/eCommerceProfile.model.js");
//router imports
const getUserProfiles_route_js_1 = require("./routes/getUserProfiles.route.js");
const purchaseOrder_route_js_1 = __importDefault(require("./routes/purchaseOrder.route.js"));
const PORT = 3012;
//initialize AdminJS
adminjs_1.default.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});
const DEFAULT_ADMIN = {
    email: 'admin@asset360nigeria.com',
    password: 'MultiplierEffect1000%'
};
const authenticate = async (email, password) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};
const start = async () => {
    //initialize express
    const app = (0, express_2.default)();
    // middleware to parse JSON requests
    app.use(express_2.default.json());
    //middleware to parse form data
    app.use('/public', express_2.default.static(path_1.default.join(__dirname, 'public')));
    //middleware to serve static files
    app.use(express_2.default.static(path_1.default.join(__dirname, 'pdfs/')));
    //connect to MongoDB
    const mongooseDB = await mongoose_1.default.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360');
    const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
    const sessionStore = new MongoDBStore({
        uri: 'mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360',
        collection: 'session'
    });
    sessionStore.on('error', (error) => {
        console.error('MongoDB Session Store Error:', error);
    });
    //optionally (in case we want to access backend data on the dashboard. For example, we may want to display charts or statistics in general.
    //to do, we might need to create a handler for the dashboard to access server data'
    const dashboardHandler = async () => {
        try {
            await mongoose_1.default.connect('mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360');
            //AccountHolder Model
            const accountHolderModel = mongoose_1.default.model('AccountHolder', new mongoose_1.default.Schema({
                accountHolderPhoneNo: String,
                accountHolderEmail: String,
                accountHolderPassword: String,
                accountHolderConfirmPassword: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ActiveUser Model
            const activeUserModel = mongoose_1.default.model('ActiveUser', new mongoose_1.default.Schema({
                activeUserUserID: String,
                activeUserUserPhoneRefNo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AccountHolder' },
                activeUserUserFirstName: String,
                activeUserUserLastName: String,
                activeUserUserEmail: String,
                activeUserPhoneNo: String,
                activeUserGender: String,
                activeUserDOB: String,
                activeserWorkStatus: String,
                activeUserSelectCompany: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ProfiledPartner' },
                nonProfiledCompanyName: String,
                nonProfiledWorkAddress: String,
                activeUserAssetDeliveryAddress: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ItemCategory Model
            const itemCategoryModel = mongoose_1.default.model('ItemCategory', new mongoose_1.default.Schema({
                itemCategoryName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ItemType Model
            const itemTypeModel = mongoose_1.default.model('ItemType', new mongoose_1.default.Schema({
                itemTypeName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ItemSubType Model
            const itemSubTypeModel = mongoose_1.default.model('ItemSubType', new mongoose_1.default.Schema({
                itemSubTypeName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ItemBrand Model
            const itemBrandModel = mongoose_1.default.model('ItemBrand', new mongoose_1.default.Schema({
                itemBrandName: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            // ItemInformation Model
            const itemInformationModel = mongoose_1.default.model('ItemInformation', new mongoose_1.default.Schema({
                itemInformationID: { type: String },
                itemInformationCode: { type: String, required: true },
                itemInformationName: { type: String, required: true },
                itemInformationCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
                itemInformationBrand: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemBrand', required: true },
                itemInformationType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemType', required: true },
                itemInformationSubType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemSubType', required: true },
                itemInformationDescription: { type: String, required: true },
                itemInformationImage: { type: String },
                itemInformationECommerceProfile: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ECommerceProfile', required: true },
                itemInformationECommerceProfileName: { type: String, required: true },
                itemInformationECommerceProfileDisplay: { type: String },
                itemInformationMktStartPrice: {
                    type: Number,
                    virtual: true,
                    get(price) {
                        const iteminfocurmktprice = this.itemInformationCurrentMktPrice;
                        if (!iteminfocurmktprice)
                            return null;
                        // Option 1: Escape curly braces in regular expression
                        // return `₦<span class="math-inline">{price.toFixed(2).replace(/\\d(?=(\d{3})+) /g, ',')}</span>`;
                        // Option 2: Use template literal with backticks
                        return `₦<span class="math-inline">${price.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, ',')}</span>`;
                    }
                },
                itemInformationClassification: { type: String, enum: ['STANDARD', 'PREMIUM', 'LUXURY'], required: true },
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now }
            }));
            // updateItemPrice Model
            const updateItemPriceModel = mongoose_1.default.model('UpdateItemPrice', new mongoose_1.default.Schema({
                itemToBeUpdatedRefID: { type: mongoose_1.default.Types.ObjectId, ref: 'ItemInformation', required: true },
                itemToBeUpdatedID: { type: String, required: true },
                itemToBeupdatedDisplayName: String,
                itemToBeUppdatedDisplayItemCode: String,
                itemToBeUpdatedDisplayItemDesc: String,
                itemToBeUpdatedStartPrice: Number,
                updatedItemNewPriceByInflation: Number,
                createdAt: { type: Date, default: Date.now },
                lastUpdatedAt: { type: Date, default: Date.now },
                //New Price Update Alert
                itemInformationPriceUpdateDetails: [{
                        itemInformationTranDateForNewPriceUpdate: { type: Date },
                        itemInformationNewPriceUpdateRemarks: { type: String },
                        itemInformationCurrentMktPrice: { type: Number }
                    }]
            }));
            //profiledPartner Model
            const profiledPartnerModel = mongoose_1.default.model('ProfiledPartner', new mongoose_1.default.Schema({
                profiledPartnerName: String,
                profiledPartnerType: String,
                profiledPartnerSubType: String,
                profiledPartnerOfficeAdd: String,
                profiledPartnerPayDay: Number,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            //subscriptionType Model
            const subscriptionTypeModel = mongoose_1.default.model('SubscriptionType', new mongoose_1.default.Schema({
                subscTypeName: String,
                subscTypeDesc: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            //purchaseOrder Model
            const purchaseOrderModel = mongoose_1.default.model('PurchaseOrder', new mongoose_1.default.Schema({
                purchaseOrderId: String,
                createdAt: Date,
                pOrderForActiveUserRefID: { type: mongoose_1.default.Types.ObjectId, ref: 'ActiveUser' },
                pOrderForActiveUserID: String,
                pOrderUserProfileFullName: String,
                pOrderUserProfilePhoneNo: String,
                pOrderUserProfileEmail: String,
                pOrderUserDeliveryAddress: String,
                purchaseOrderIntent: { type: mongoose_1.default.Types.ObjectId, ref: 'ItemInformation', path: '', select: 'itemInformationName' },
                purchaseOrderIntentID: { type: String },
                purchaseOrderIntentItemCode: String,
                purchaseOrderIntentItemName: String,
                purchaseOrderIntentDesc: String,
                purchaseOrderUnitPrice: Number,
                purchaseOrderTotalStartPrice: Number,
                purchaseOrderAssetSubscType: { type: Number },
                purchaseOrderAssetSubscTypeRefID: { type: mongoose_1.default.Types.ObjectId },
                purchaseOrderAssetSubsc: String,
                //Price Change History
                PriceChangeOnPOHistoryDetails: [{
                        priceChangeOnPODate: { type: Date },
                        priceChangeOnPORemarks: { type: String },
                        newPriceAmountOnPO: { type: Number }
                    }],
                purchaseOrderNewPriceAlert: Number,
                //PO Price Reversal Alert
                purchaseOrderPriceReverseAlertDetails: [{
                        purchaseOrderReverseDate: { type: Date },
                        purchaseOrderReverseNewPriceAlertRemarks: { type: String },
                        purchaseOrderReverseNewPriceAlert: { type: Number }
                    }],
                remittanceBalanceToBePaidDetails: [{
                        remitDateOnPO: Date,
                        remittanceExpectedBalToBePaidOnPO: { type: Number },
                        remittanceUpdateRemarksOnPO: { type: String },
                        remittedAmountCROnPO: { type: Number },
                        endingBalanceAfterLastRemittance: { type: Number }
                    }],
                totalRemittanceMadeSoFar: [{
                        totalRemittanceDate: Date,
                        totalRemittanceAmountCR: { type: Number },
                        totalRemittanceRemarks: { type: String }
                    }],
                lastUpdatedAt: Date
            }));
            //paymentClass Model
            const paymentClassModel = mongoose_1.default.model('PaymentClass', new mongoose_1.default.Schema({
                paymentClassName: String,
                paymentClassDesc: String,
                createdAt: Date,
                lastUpdatedAt: Date
            }));
            //remittance Model
            const remittanceModel = mongoose_1.default.model('Remittance', new mongoose_1.default.Schema({
                remittanceReferenceID: String,
                createdAt: Date,
                remittanceDate: Date,
                remittanceForWhichPurchaseOrderRefID: { type: mongoose_1.default.Types.ObjectId, ref: 'PurchaseOrder' },
                remittanceForWhichPurchaseOrderID: String,
                remittanceForWhichActiveUserID: String,
                remittanceActiveUserFullName: String,
                remittancePOPhoneNo: String,
                remittanceAmount_CR: Number,
                remittancePaymentRefClass: { type: mongoose_1.default.Types.ObjectId, ref: 'PaymentClass' },
                remittancePaymentClass: String,
                remittanceRemarks: String,
                lastUpdatedAt: Date
            }));
            //eCommerceProfile Model
            const eCommerceProfileModel = mongoose_1.default.model('ECommerceProfile', new mongoose_1.default.Schema({
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
            //---DEFAULT COMPONENTS BEGIN HERE --//
            //appUser Component
            const accountHolderData = await accountHolderModel.find({}).exec();
            //activeUser Component
            const activeUserData = await activeUserModel.find({})
                .populate({ model: 'AccountHolder', path: '', select: 'accountHolderPhoneNo' })
                .populate({ model: 'ProfiledPartner', path: '', select: 'profiledPartnerName' })
                .exec();
            //itemCategory Component
            const itemCategoryData = await itemCategoryModel.find({}).exec();
            //itemType Component
            const itemTypeData = await itemTypeModel.find({}).exec();
            //itemsubType Component
            const itemSubTypeData = await itemSubTypeModel.find({}).exec();
            //itemBrand Component
            const itemBrandData = await itemBrandModel.find({}).exec();
            //item Information Component
            const itemInformationData = await itemInformationModel.find({})
                .populate({ model: 'ItemCategory', path: '', select: 'itemCategoryName' })
                .populate({ model: 'ItemType', path: '', select: 'itemTypeName' })
                .populate({ model: 'ItemSubType', path: '', select: 'itemBrandName' })
                .populate({ model: 'ItemBrand', path: '', select: 'itemBrandName' })
                .exec();
            //updateItemPrice Component
            const updateItemPriceData = await updateItemPriceModel.find({})
                .populate({ model: 'ItemInformation', path: '', select: 'itemInformationName' })
                .exec();
            //profiledPartner Component
            const profiledPartnerData = await profiledPartnerModel.find({}).exec();
            //subscriptionType Component
            const subscriptionTypeData = await subscriptionTypeModel.find({}).exec();
            //purchaseOrder Component
            const purchaseOrderData = await purchaseOrderModel.find({})
                .populate({ model: 'ActiveUser', path: '', select: 'activeUserPhoneNo activeUserEmail activeUserFirstName activeUserLastName' })
                .populate('Item')
                .populate('SubcriptionType')
                .exec();
            console.log(purchaseOrderData);
            //paymentClass Component
            const paymentClassData = await paymentClassModel.find({}).exec();
            //remittance Component
            const remittanceData = await remittanceModel.find({})
                .populate({ path: '', model: 'PurchaseOrder', select: 'purchaseOrderId' })
                .populate({ path: '', model: 'PaymentClass', select: 'paymentClassName' })
                .exec();
            //eCommerceProfile Component
            const eCommerceProfileData = await eCommerceProfileModel.find({}).exec();
            //---DEFAULT COMPONENTS ENDS HERE --//
            // return the data from the database      
            return { itemCategoryData, itemTypeData, itemSubTypeData, itemBrandData, eCommerceProfileData, itemInformationData, updateItemPriceData, profiledPartnerData,
                paymentClassData, subscriptionTypeData, accountHolderData, activeUserData, purchaseOrderData, remittanceData
            };
        }
        catch (error) {
            console.error('Error Fetching Data from MongoDB:', error);
            return { error: 'An error occurred while fetching ProductBrand data from the database' };
        }
        finally {
            await mongoose_1.default.disconnect();
        }
    };
    //--Custom Action Component ends here--//
    // ComponentLoader to load custom components
    const componentLoader = new adminjs_1.ComponentLoader();
    const Components = {
        Dashboard: componentLoader.add('Dashboard', './Dashboard'), // Add this line if you have a Dashboard component
    };
    ;
    // Handles SideBar Navigation Pattern
    const businessNavigation = { name: 'Business Profile', icon: 'transaction' };
    const customersNavigation = { name: 'Customers Profile', icon: 'customer' };
    const itemsNavigation = { name: 'Item Profile', icon: 'item' };
    const realEstateNavigation = { name: 'Real Estate Profile', icon: 'properties' };
    const updateNavigation = { name: 'Update Profile', icon: 'update' };
    const transactionsNavigation = { name: 'Transaction Profile', icon: 'payment' };
    //Setup AdminJS || handles all resources- database,assets,components, etc.
    const admin = new adminjs_1.default({
        databases: [mongooseDB],
        rootPath: '/admin',
        branding: { companyName: 'Asset360 Nigeria Limited' },
        assets: { styles: ["/sidebar.css"] },
        resources: [
            { resource: profiledPartner_model_js_1.ProfiledPartner, options: { navigation: businessNavigation, id: 'ProfiledPartner', search: { type: String, isVisible: { filter: true } } } },
            { resource: subscriptionType_model_js_1.SubscriptionType, options: { navigation: businessNavigation, id: 'SubscriptionType', search: { type: String, isVisible: { filter: true } } } },
            { resource: paymentClass_model_js_1.PaymentClass, options: { navigation: businessNavigation, id: 'PaymentClass', search: { type: String, isVisible: { filter: true } } } },
            { resource: accountHolder_model_js_1.AccountHolder, options: { navigation: customersNavigation, id: 'AccountHolder', search: { type: String, isVisible: { filter: true } } } },
            { resource: activeUser_model_js_1.ActiveUser, options: { navigation: customersNavigation, id: 'ActiveUser', search: { type: String, isVisible: { filter: true } } } },
            { resource: itemCategory_model_js_1.ItemCategory, options: { navigation: itemsNavigation, id: 'ItemCategory', search: { type: String, isVisible: { filter: true } } } },
            { resource: itemBrand_model_js_1.ItemBrand, options: { navigation: itemsNavigation, id: 'ItemBrand', search: { type: String, isVisible: { filter: true } } } },
            { resource: itemType_model_js_1.ItemType, options: { navigation: itemsNavigation, id: 'ItemType', search: { type: String, isVisible: { filter: true } } } },
            { resource: itemSubType_model_js_1.ItemSubType, options: { navigation: itemsNavigation, id: 'ItemSubType', search: { type: String, isVisible: { filter: true } } } },
            { resource: eCommerceProfile_model_js_1.ECommerceProfile, options: { navigation: itemsNavigation, id: 'ECommerceProfile', search: { type: String, isVisible: { filter: true } } } },
            { resource: itemInformation_model_js_1.ItemInformation, options: { navigation: itemsNavigation, id: 'ItemInformation', search: { type: String, isVisible: { filter: true } } } },
            { resource: updateItemPrice_model_js_1.UpdateItemPrice, options: { navigation: updateNavigation, id: 'UpdateItemPrice', search: { type: String, isVisible: { filter: true } } } },
            {
                resource: purchaseOrder_model_js_1.PurchaseOrder,
                options: {
                    navigation: transactionsNavigation,
                    id: 'PurchaseOrder',
                    search: { type: String, isVisible: { filter: true } },
                    actions: {
                        exportToPDF: {
                            actionType: 'record',
                            icon: 'Export',
                            isAccessible: true,
                            handler: async (request, response, context) => {
                                const { record } = context;
                                if (record && record.params) {
                                    try {
                                        // 1. Fetch the necessary data from the model
                                        const data = await purchaseOrder_model_js_1.PurchaseOrder.findById(record.params._id).exec();
                                        // 2. Process & tabularize the data
                                        const tabularData = processDataForPDF(data);
                                        function processDataForPDF(data) {
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
                                        function generatePDF(data) {
                                            const doc = new pdfkit_1.default();
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
                                        pdfDocument.pipe(response);
                                        pdfDocument.end();
                                        // 6. Return a RecordJSON object (even though you're sending a PDF)
                                        return {
                                            record: record.toJSON(record), // Include the original record data
                                            params: {
                                                // You can add any additional information here if needed
                                                pdfGenerated: true,
                                            },
                                        };
                                    }
                                    catch (error) {
                                        console.error('Error generating PDF:', error);
                                        // Handle the error appropriately (e.g., return an error response)
                                        return {
                                            notice: { message: 'Error generating PDF. Please try again later.', type: 'error' }
                                        };
                                    }
                                }
                                return response; // Return the default response if there's an issue with the record
                            },
                        },
                    },
                },
            },
            { resource: remittance_model_js_1.Remittance, options: { navigation: transactionsNavigation, id: 'Remittance', search: { type: String, isVisible: { filter: true } } } },
            //transactionResourceOptions,  // Adding the transaction table resource with PDF export functionality
        ],
        dashboard: { component: Components.Dashboard, handler: dashboardHandler },
        componentLoader,
    });
    //watch the AdminJS instance
    admin.watch();
    //Router
    const adminRouter = express_1.default.buildAuthenticatedRouter(admin, {
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
    //middleware for the Root Router
    app.use(express_2.default.json());
    app.use(admin.options.rootPath, adminRouter);
    //Use the purchaseOrder route (sets up the Express server & connects it to MongoDB. It also mounts the route to the /api endpoint).
    app.use('/api', purchaseOrder_route_js_1.default);
    //define the route for fetching full user profiles 
    app.get('/api/userfullprofile', getUserProfiles_route_js_1.getUserProfiles);
    //set up view engine
    app.set('view engine', 'ejs');
    //set the views directory
    console.log('Views directory:', path_1.default.join(__dirname, 'views'));
    app.set('views', path_1.default.join(__dirname, 'views'));
    //Start the Server
    app.listen(PORT, () => {
        console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
    });
};
start();
