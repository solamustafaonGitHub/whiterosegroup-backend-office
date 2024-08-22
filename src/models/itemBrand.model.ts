import mongoose, {model,Schema,Types} from 'mongoose'

interface IItemBrand {
    itemBrandName: {type:String, unique:[true, 'Item Brand name must be unique'], required:true},
    createdAt: {type:Date, default:Date},
    lastUpdatedAt: {type:Date, default:Date}
}

const itemBrandSchema = new Schema<IItemBrand>({
    itemBrandName: {type:String, unique:[true, 'Item Brand name must be unique'], required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
})

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ItemBrand = mongoose.model<IItemBrand>('ItemBrand', itemBrandSchema);
export {ItemBrand, IItemBrand};
