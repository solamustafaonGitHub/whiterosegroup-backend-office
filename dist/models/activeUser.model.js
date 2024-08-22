import mongoose, { Schema } from 'mongoose';
import { AccountHolder } from "./accountHolder.model.js";
function generateShortId() {
    const min = 4101000;
    const max = 7999998;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
console.log(generateShortId());
const activeUserSchema = new Schema({
    activeUserID: { type: String, default: generateShortId, unique: true },
    activeUserPhoneRefNo: { type: Schema.Types.ObjectId, ref: 'AccountHolder', unique: true },
    activeUserFirstName: { type: String, required: true },
    activeUserLastName: { type: String, required: true },
    activeUserEmail: { type: String },
    activeUserPhoneNo: { type: String, unique: true },
    activeUserGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
    activeUserDOB: { type: Date },
    activeUserWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
    activeUserSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
    nonProfiledCompanyName: { type: String, required: true },
    nonProfiledWorkAddress: { type: String, required: true },
    activeUserAssetDeliveryAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
activeUserSchema.pre('save', async function (next) {
    try {
        if (this.activeUserPhoneRefNo) {
            const accountholder = await AccountHolder.findById(this.activeUserPhoneRefNo).exec();
            if (accountholder) {
                this.activeUserEmail = accountholder.accountHolderEmail;
                this.activeUserPhoneNo = accountholder.accountHolderPhoneNo;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
const ActiveUser = mongoose.model('ActiveUser', activeUserSchema);
export { ActiveUser };
