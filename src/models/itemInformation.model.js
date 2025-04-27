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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemInformation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const eCommerceProfile_model_js_1 = require("./eCommerceProfile.model.js");
// Function to generate a 4-digit short ID starting from 1001
function generateItemInfoShortId() {
    const min = 1001;
    const max = 9999; // Maximum value for the 4-digit number starting from 1001
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0'); // Ensure the ID is 4 digits long
}
// Define the Item Information Schema
const ItemInformationSchema = new mongoose_1.Schema({
    itemInformationID: { type: String, default: generateItemInfoShortId, unique: true },
    itemInformationCode: { type: String, required: true, unique: true },
    itemInformationName: { type: String, required: true },
    itemInformationCategory: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
    itemInformationBrand: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemBrand', required: true },
    itemInformationType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemType', required: true },
    itemInformationSubType: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ItemSubType', required: true },
    itemInformationDescription: { type: String, required: true },
    itemInformationImage: { type: String },
    itemInformationECommerceProfile: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ECommerceProfile', required: true },
    itemInformationECommerceProfileName: { type: String },
    itemInformationECommerceProfileDisplay: { type: String },
    itemInformationMktStartPrice: { type: Number, required: true },
    itemInformationClassification: {
        type: String,
        enum: ['STANDARD', 'PREMIUM (Higher Quality)', 'LUXURY (Exclusive Luxury)'],
        required: true
    },
    createdAt: { type: Date, default: new Date() },
    lastUpdatedAt: { type: Date, default: new Date() },
    itemInformationPriceUpdateDetails: [{
            itemInformationTranDateForNewPriceUpdate: { type: Date, default: new Date() },
            itemInformationNewPriceUpdateRemarks: { type: String },
            itemInformationCurrentMktPrice: { type: Number }
        }]
});

// Adding a virtual field
itemInformationSchema.virtual('itemInformationMktStartPrice').get(function () {
    const price = this.itemInformationCurrentMktPrice;
    if (!price) return null;
    // Formatting price with commas for thousands and the currency symbol
    return `₦<span class="math-inline">${price
      .toFixed(2)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, ',')}</span>`;
  });


// Pre-Save Hook to ensure itemInformationID is generated before saving
ItemInformationSchema.pre('save', function (next) {
    if (!this.itemInformationID) {
        this.itemInformationID = generateItemInfoShortId(); // Ensure itemInformationID is generated if missing
    }
    next();
});
//Pre-save hook to set the itemProfiling of eCommerceProfile
ItemInformationSchema.pre('save', async function (next) {
    try {
        if (this.itemInformationECommerceProfile) {
            const eCommerceProfile = await eCommerceProfile_model_js_1.ECommerceProfile.findById(this.itemInformationECommerceProfile).exec();
            if (eCommerceProfile) {
                this.itemInformationECommerceProfileName = eCommerceProfile.eCommerceProfileName;
                this.itemInformationECommerceProfileDisplay = eCommerceProfile.itemProfiling.toString();
            }
        }
    }
    catch (err) {
        console.error(err);
    }
    next();
});
// Create & Export the Model. The collection name in the database is derived from the model name. 
// By default, Mongoose will pluralize the model name to determine the collection name.
// const ItemInformation = mongoose_1.default.model('ItemInformation', ItemInformationSchema);
// exports.ItemInformation = ItemInformation;

// Compile the schema into a model
const ItemInformation = mongoose.model('ItemInformation', itemInformationSchema);
module.exports = ItemInformation;
