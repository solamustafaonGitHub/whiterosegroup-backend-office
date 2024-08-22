import mongoose, {model,Schema,Types } from 'mongoose'
interface IItemCategory {
    itemCategoryName: {type:String, unique:[true, 'Item Category name must be unique'], required:true},
    createdAt: {type:Date, default:Date},
    lastUpdatedAt: {type:Date, default:Date}
}

const itemCategorySchema = new Schema<IItemCategory>({
    itemCategoryName: {type:String, unique:[true, 'Item Category name must be unique'], required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
})

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemCategory = mongoose.model<IItemCategory>('ItemCategory', itemCategorySchema);
export {ItemCategory, IItemCategory};
