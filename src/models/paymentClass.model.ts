import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for PaymentClass
interface IPaymentClass extends Document {
    paymentClassName: string;
    paymentClassDesc: string;
    createdAt: Date;
    lastUpdatedAt: Date;
}

const PaymentClassSchema = new Schema<IPaymentClass>({
    paymentClassName: {type:String, required:true},
    paymentClassDesc: String,
    createdAt: {type:Date, default: Date.now},
    lastUpdatedAt: {type:Date, default: Date.now}
});


// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const PaymentClass = mongoose.model<IPaymentClass>('PaymentClass', PaymentClassSchema);
export {PaymentClass, IPaymentClass};