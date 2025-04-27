import mongoose, {model,Schema,Types } from 'mongoose'

// Define the interface for SubscriptionType
interface ISubscriptionType {
    subscTypeName: string;
    subscTypeDesc: string;
    createdAt: Date;
    lastUpdatedAt: Date;
};

// Define the SubscriptionType Schema
const subscriptionTypeSchema = new Schema<ISubscriptionType>({
    subscTypeName: {type:String, unique:true, required:true},
    subscTypeDesc: {type:String, required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const SubscriptionType = mongoose.model<ISubscriptionType>('SubscriptionType', subscriptionTypeSchema);
export {SubscriptionType, ISubscriptionType};