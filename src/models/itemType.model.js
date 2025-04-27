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
exports.ItemType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the schema for the ItemType model
const itemTypeSchema = new mongoose_1.Schema({
    itemTypeName: { type: String, unique: [true, 'Item Tyoe name must be unique'], required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
// Add a pre-save hook to update the lastUpdatedAt property before saving the document
itemTypeSchema.pre('save', function (next) {
    this.lastUpdatedAt = new Date();
    next();
});
// Pre-Order meaning: The item is not yet available for purchase. The customer can place an order for the item, and the item will be shipped to the customer once it becomes available.
// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemType = mongoose_1.default.model('ItemType', itemTypeSchema);
exports.ItemType = ItemType;
