import mongoose, {model,Schema,Types } from 'mongoose';

// Define the interface for the ItemType model
interface IItemType {
    itemTypeName: {type:String, unique:[true, 'Item Type name must be unique'], required:true},
    createdAt: Date,
    lastUpdatedAt: Date
}

// Define the schema for the ItemType model
const itemTypeSchema = new Schema<IItemType>({
    itemTypeName: {type:String, unique:[true, 'Item Tyoe name must be unique'], required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});

// Add a pre-save hook to update the lastUpdatedAt property before saving the document
itemTypeSchema.pre('save', function (next) {
    this.lastUpdatedAt = new Date();
    next();
});

// Pre-Order meaning: The item is not yet available for purchase. The customer can place an order for the item, and the item will be shipped to the customer once it becomes available.

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemType = mongoose.model<IItemType>('ItemType', itemTypeSchema);
export {ItemType, IItemType};