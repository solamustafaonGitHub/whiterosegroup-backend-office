import mongoose, { Schema } from 'mongoose';
import { AccountHolder } from "./accountHolder.model.js";
function generateShortId() {
    const min = 4101000;
    const max = 7999998;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
console.log(generateShortId());
const profiledUserSchema = new Schema({
    profiledUserID: { type: String, default: generateShortId, unique: true },
    profiledUserPhoneNo: { type: Schema.Types.ObjectId, ref: 'ApplUser' },
    profiledUserEmail: { type: String },
    profiledUserFirstName: { type: String, required: true },
    profiledUserLastName: { type: String, required: true },
    profiledUserGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
    profiledUserDOB: { type: Date },
    profiledUserWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
    profiledUserSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner' },
    nonProfiledUserCompanyName: { type: String, required: true },
    nonProfiledUsersWorkAddress: { type: String, required: true },
    profiledUserAssetDeliveryAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
profiledUserSchema.pre('save', async function (next) {
    try {
        if (this.profiledUserPhoneNo) {
            const appuser = await AccountHolder.findById(this.profiledUserPhoneNo).exec();
            if (appuser) {
                this.profiledUserEmail = appuser.accountHolderEmail;
            }
        }
        next();
    }
    catch (error) {
        next();
    }
});
const ProfiledUser = mongoose.model('ProfiledUser', profiledUserSchema);
export { ProfiledUser };
