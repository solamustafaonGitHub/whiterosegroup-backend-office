import mongoose, {model,Schema,Types } from 'mongoose';
interface IItemSubType {
    itemSubTypeName: {type:String, unique:[true, 'Item SubType name must be unique'], required:true},
    createdAt: {type:Date, default:Date},
    lastUpdatedAt: {type:Date, default:Date}
}

const itemSubTypeSchema = new Schema<IItemSubType>({
    itemSubTypeName: {type:String, unique:[true, 'Item SubType name must be unique'], required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
})

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemSubType = mongoose.model<IItemSubType>('ItemSubType', itemSubTypeSchema);
export {ItemSubType, IItemSubType};