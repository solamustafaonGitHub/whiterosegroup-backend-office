import mongoose, {model,Schema,Types } from 'mongoose';
interface IItemType {
    itemTypeName: {type:String, unique:[true, 'Item Type name must be unique'], required:true},
    createdAt: {type:Date, default:Date},
    lastUpdatedAt: {type:Date, default:Date}
}

const itemTypeSchema = new Schema<IItemType>({
    itemTypeName: {type:String, unique:[true, 'Item Tyoe name must be unique'], required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemType = mongoose.model<IItemType>('ItemType', itemTypeSchema);
export {ItemType, IItemType};