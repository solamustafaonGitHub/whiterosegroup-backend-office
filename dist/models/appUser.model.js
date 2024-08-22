import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const appUserSchema = new Schema({
    appUserPhoneNo: { type: String, required: true, unique: true },
    appUserEmail: { type: String, required: true, unique: true },
    appUserPassword: { type: String, required: true },
    appUserConfirmPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
});
appUserSchema.pre('save', async function (next) {
    if (!this.isModified('appUserPassword'))
        return next();
    try {
        const hashedPassword = await bcrypt.hash(this.appUserPassword, 12);
        this.appUserPassword = hashedPassword;
        this.appUserConfirmPassword = hashedPassword;
        next();
    }
    catch (error) {
        console.error("Error hashing password:", error.message, error.stack);
        next(error);
    }
});
const AppUser = mongoose.model('AppUser', appUserSchema);
export { AppUser };
