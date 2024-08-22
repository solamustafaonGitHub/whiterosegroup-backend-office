import mongoose, { Schema } from 'mongoose';
import { ApplUser } from "./applUser.model.js";
function generateShortId() {
    const min = 4101000;
    const max = 7999998;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
console.log(generateShortId());
const activeUserSchema = new Schema({
    activeUserID: { type: String, default: generateShortId, unique: true },
    activeUserPhoneNo: { type: Schema.Types.ObjectId, ref: 'ApplUser' },
    activeUserEmail: { type: String },
    activeUserFirstName: { type: String, required: true },
    activeUserLastName: { type: String, required: true },
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
        if (this.activeUserPhoneNo) {
            const appuser = await ApplUser.findById(this.activeUserPhoneNo).exec();
            if (appuser) {
                this.activeUserEmail = appuser.applUserEmail;
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
