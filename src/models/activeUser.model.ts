import mongoose, {Schema,Document,model} from 'mongoose';
import {AccountHolder} from "./accountHolder.model.js"; 
import {ProfiledPartner} from "./profiledPartner.model.js"

// Function to generate a 7-digit short ID starting from 4101000
function generateShortId(): string{
    const min: number = 4101000;
    const max: number = 7999998; // Maximum value for a 7-digit number starting from 4101000
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7,'0'); // Ensure the ID is 7 digits long
}
console.log(generateShortId())


// Define the interface for Active Users
interface IActiveUser extends Document {
    activeUserID: string;
    activeUserPhoneRefNo: mongoose.Types.ObjectId;
    activeUserFirstName: string;
    activeUserLastName: string;
    activeUserEmail: string;
    activeUserPhoneNo: string;
    activeUserGender:'MALE'|'FEMALE'|'RATHER NOT SAY';
    activeUserDOB: Date;
    activeUserWorkStatus:'EMPLOYED'|'NOT CURRENTLY EMPLOYED';
    activeUserSelectCompany: mongoose.Types.ObjectId;
    nonProfiledCompanyName: string;
    nonProfiledWorkAddress: string;
    activeUserAssetDeliveryAddress: string;
    createdAt: Date;
    lastUpdatedAt: Date;
}

// Define the ActiveUserSchemaSchema
const activeUserSchema = new Schema<IActiveUser>({
    activeUserID: {type:String, default:generateShortId, unique:true},
    activeUserPhoneRefNo: {type:Schema.Types.ObjectId, ref:'AccountHolder', unique:true},
    activeUserFirstName: {type:String, required:true},
    activeUserLastName: {type:String, required:true},
    activeUserEmail: {type:String},
    activeUserPhoneNo: {type:String, unique:true},
    activeUserGender:{type:String, required:false, enum:['MALE','FEMALE','RATHER NOT SAY']},
    activeUserDOB: {type:Date},
    activeUserWorkStatus: {type:String, required:true, enum:['EMPLOYED','NOT CURRENTLY EMPLOYED']},
    activeUserSelectCompany: {type:Schema.Types.ObjectId, ref:'ProfiledPartner'},
    nonProfiledCompanyName: {type:String, required:true},
    nonProfiledWorkAddress: {type:String, required:true},
    activeUserAssetDeliveryAddress:{type:String, required:true},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});

// Pre-Save Hook to set the activeUserEmail based on the activeUserPhoneNo
activeUserSchema.pre<IActiveUser>('save', async function (next) {
    try {
        if (this.activeUserPhoneRefNo) {
            const accountholder = await AccountHolder.findById(this.activeUserPhoneRefNo).exec();
            if (accountholder) {
                this.activeUserEmail = accountholder.accountHolderEmail;
                this.activeUserPhoneNo = accountholder.accountHolderPhoneNo;
            }
        }
        next();
    } catch (error) {
        next();
    }
});

// Create & Export the Model. The collection name in the database is derived from the model name. 
// By default, Mongoose will pluralize the model name to determine the collection name.
const ActiveUser = mongoose.model<IActiveUser>('ActiveUser', activeUserSchema);
export {ActiveUser, IActiveUser};