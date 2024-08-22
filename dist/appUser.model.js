import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const appUserSchema = new Schema({
    appUserPhoneNo: { type: String },
    appUserEmail: { type: String, required: true, unique: true },
    appUserPassword: { type: String },
    appUserConfirmPassword: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
appUserSchema.pre('save', async function (next) {
    try {
        if (this.isModified('appUserPassword') || this.isNew) {
            if (this.appUserPassword !== this.appUserConfirmPassword) {
                throw new Error("Passwords do not match");
            }
            const hash = await bcrypt.hash(this.appUserPassword, 10);
            this.appUserPassword = hash;
            this.appUserConfirmPassword = hash;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
appUserSchema.methods.validatePassword = async function (password) {
    try {
        const compare = await bcrypt.compare(password, this.appUserPassword);
        return compare;
    }
    catch (error) {
        return false;
    }
};
const AppUser = mongoose.model('AppUser', appUserSchema);
export { AppUser };
