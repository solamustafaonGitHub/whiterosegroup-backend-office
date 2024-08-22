import mongoose, { Schema } from 'mongoose';
import { AppUser } from "./appUser.model.js";
function generateShortId() {
    const min = 4101000;
    const max = 7999998;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
console.log(generateShortId());
const userProfileSchema = new Schema({
    UserProfileID: { type: String, default: generateShortId, unique: true },
    userProfilePhoneNo: { type: Schema.Types.ObjectId, ref: 'AppUser', required: true },
    UserProfileEmail: { type: String },
    userProfileFirstName: { type: String },
    userProfileLastName: { type: String },
    userProfileGender: { type: String, required: false, enum: ['MALE', 'FEMALE', 'RATHER NOT SAY'] },
    userProfileDOB: { type: String },
    userProfileWorkStatus: { type: String, required: true, enum: ['EMPLOYED', 'NOT CURRENTLY EMPLOYED'] },
    userProfileSelectCompany: { type: Schema.Types.ObjectId, ref: 'ProfiledPartner',
        validate: {
            validator: function () {
                return this.userProfileWorkStatus === 'EMPLOYED';
            },
            message: 'userProfileSelectCompany is required when userProfileWorkStatus is EMPLOYED'
        }
    },
    nonProfiledCompanyName: { type: String,
        validate: {
            validator: function () {
                return this.userProfileWorkStatus === 'EMPLOYED';
            },
            message: 'nonProfiledCompanyName is required when userProfileWorkStatus is EMPLOYED'
        }
    },
    nonProfiledUsersWorkAddress: { type: String,
        validate: {
            validator: function () {
                return this.userProfileWorkStatus === 'EMPLOYED';
            },
            message: 'nonProfiledUsersWorkAddress is required when userProfileWorkStatus is EMPLOYED'
        }
    },
    userAssetDeliveryAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
userProfileSchema.virtual('userProfileFullName').get(function () {
    return `${this.userProfileFirstName} ${this.userProfileLastName}`;
});
userProfileSchema.set('toJSON', { virtuals: true });
userProfileSchema.set('toObject', { virtuals: true });
userProfileSchema.pre('save', async function (next) {
    try {
        if (this.userProfilePhoneNo) {
            const appuser = await AppUser.findById(this.userProfilePhoneNo).exec();
            if (appuser) {
                this.UserProfileEmail = appuser.appUserEmail;
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const UserProfile = mongoose.model('userprofiles', userProfileSchema);
export { UserProfile };
