import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
;
const AccountSubscriberSchema = new Schema({
    accountSubscriberPhoneNo: { type: String, required: true, unique: true },
    accountSubscriberEmail: { type: String, required: true, unique: true },
    accountSubscriberPassword: { type: String, required: true },
    accountSubscriberConfirmPassword: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberConfirmPassword')) {
        if (accountSubscriber.accountSubscriberPassword !== accountSubscriber.accountSubscriberConfirmPassword) {
            throw new Error('Password and Confirm Password do not match');
        }
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberConfirmPassword')) {
        if (accountSubscriber.accountSubscriberPassword !== accountSubscriber.accountSubscriberConfirmPassword) {
            throw new Error('Password and Confirm Password do not match');
        }
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberPassword') || accountSubscriber.isModified('accountSubscriberConfirmPassword')) {
        accountSubscriber.accountSubscriberPassword = await bcrypt.hash(accountSubscriber.accountSubscriberPassword, 8);
        accountSubscriber.accountSubscriberConfirmPassword = await bcrypt.hash(accountSubscriber.accountSubscriberConfirmPassword, 8);
    }
    next();
});
AccountSubscriberSchema.statics.findByCredentials = async (accountSubscriberEmail, accountSubscriberPassword) => {
    const accountSubscriber = await AccountSubscriber.findOne({ accountSubscriberEmail });
    if (!accountSubscriber) {
        throw new Error('Invalid login credentials');
    }
    const isMatch = await bcrypt.compare(accountSubscriberPassword, accountSubscriber.accountSubscriberPassword);
    if (!isMatch) {
        throw new Error('Invalid login credentials');
    }
    return accountSubscriber;
};
AccountSubscriberSchema.methods.updatePassword = async function (accountSubscriberPassword) {
    const accountSubscriber = this;
    accountSubscriber.accountSubscriberPassword = accountSubscriberPassword;
    await accountSubscriber.save();
    return accountSubscriber;
};
AccountSubscriberSchema.methods.updateEmail = async function (accountSubscriberEmail) {
    const accountSubscriber = this;
    accountSubscriber.accountSubscriberEmail = accountSubscriberEmail;
    await accountSubscriber.save();
    return accountSubscriber;
};
AccountSubscriberSchema.methods.updatePhoneNo = async function (accountSubscriberPhoneNo) {
    const accountSubscriber = this;
    accountSubscriber.accountSubscriberPhoneNo = accountSubscriberPhoneNo;
    await accountSubscriber.save();
    return accountSubscriber;
};
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    const existingAccountSubscriber = await AccountSubscriber.findOne({ accountSubscriberEmail: accountSubscriber.accountSubscriberEmail });
    if (existingAccountSubscriber) {
        throw new Error('Email already exists');
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    const existingAccountSubscriber = await AccountSubscriber.findOne({ accountSubscriberPhoneNo: accountSubscriber.accountSubscriberPhoneNo });
    if (existingAccountSubscriber) {
        throw new Error('Phone number already exists');
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberPassword')) {
        if (accountSubscriber.accountSubscriberPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberEmail')) {
        if (!accountSubscriber.accountSubscriberEmail.includes('@')) {
            throw new Error('Invalid email');
        }
    }
    next();
});
AccountSubscriberSchema.pre('save', async function (next) {
    const accountSubscriber = this;
    if (accountSubscriber.isModified('accountSubscriberPhoneNo')) {
        if (accountSubscriber.accountSubscriberPhoneNo.length !== 11) {
            throw new Error('Invalid phone number');
        }
    }
    next();
});
const AccountSubscriber = mongoose.model('AccountSubscriber', AccountSubscriberSchema);
export { AccountSubscriber };
