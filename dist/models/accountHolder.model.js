import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const AccountHolderSchema = new Schema({
    accountHolderPhoneNo: { type: String, required: true, unique: true },
    accountHolderEmail: { type: String, required: true, unique: true },
    accountHolderPassword: { type: String, required: true },
    accountHolderConfirmPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
});
AccountHolderSchema.pre('save', async function (next) {
    if (!this.isModified('accountHolderPassword'))
        return next();
    try {
        const hashedPassword = await bcrypt.hash(this.accountHolderPassword, 12);
        this.accountHolderPassword = hashedPassword;
        this.accountHolderConfirmPassword = hashedPassword;
        next();
    }
    catch (error) {
        console.error("Error hashing password:", error.message, error.stack);
        next(error);
    }
});
const AccountHolder = mongoose.model('AccountHoder', AccountHolderSchema);
export { AccountHolder };
