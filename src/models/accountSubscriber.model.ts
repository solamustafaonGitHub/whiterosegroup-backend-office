import mongoose, {model,Schema,Types, Document} from 'mongoose'
import bcrypt from 'bcrypt';

// interface for the document
interface IAccountSubscriber extends Document {
  accountSubscriberPhoneNo:string;
  accountSubscriberEmail:string;
  accountSubscriberPassword:string;
  accountSubscriberConfirmPassword:string;
  createdAt:Date;
  lastUpdatedAt:Date;
};

// Define the schema for the document
const AccountSubscriberSchema = new Schema<IAccountSubscriber>({
  accountSubscriberPhoneNo:{type:String, required:true, unique:true},
  accountSubscriberEmail:{type:String, required:true, unique:true},
  accountSubscriberPassword:{type:String, required:true},
  accountSubscriberConfirmPassword:{type:String, required:true},
  createdAt:{type:Date, default:Date.now},
  lastUpdatedAt:{type:Date, default:Date.now},
  });


//Pre-save hook to ensure that the accountSubscriberPassword is the same as the accountSubscriberConfirmPassword
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberConfirmPassword')){
    if(accountSubscriber.accountSubscriberPassword !== accountSubscriber.accountSubscriberConfirmPassword){
      throw new Error('Password and Confirm Password do not match');
    }
  }
  next();
});

//Pre-save to ensure the accountSubscriberConfirmPassword matches the accountSubscriberPassword
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberConfirmPassword')){
    if(accountSubscriber.accountSubscriberPassword !== accountSubscriber.accountSubscriberConfirmPassword){
      throw new Error('Password and Confirm Password do not match');
    }
  }
  next();
});

//Pre-save hook to hash the accountSubscriberPassword & accountSubscriberConfirmPassword before saving
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberPassword') || accountSubscriber.isModified('accountSubscriberConfirmPassword')){
    accountSubscriber.accountSubscriberPassword = await bcrypt.hash(accountSubscriber.accountSubscriberPassword, 8);
    accountSubscriber.accountSubscriberConfirmPassword = await bcrypt.hash(accountSubscriber.accountSubscriberConfirmPassword, 8);
  }
  next();
});

//Method to compare the password with the hashed password in the database
AccountSubscriberSchema.statics.findByCredentials = async (accountSubscriberEmail:string, accountSubscriberPassword:string) => {
  const accountSubscriber = await AccountSubscriber.findOne({accountSubscriberEmail});
  if(!accountSubscriber){
    throw new Error('Invalid login credentials');
  }
  const isMatch = await bcrypt.compare(accountSubscriberPassword, accountSubscriber.accountSubscriberPassword);
  if(!isMatch){
    throw new Error('Invalid login credentials');
  }
  return accountSubscriber;
};

//Method to update the password
AccountSubscriberSchema.methods.updatePassword = async function(accountSubscriberPassword:string){
  const accountSubscriber = this;
  accountSubscriber.accountSubscriberPassword = accountSubscriberPassword;
  await accountSubscriber.save();
  return accountSubscriber;
};

//Method to update the email
AccountSubscriberSchema.methods.updateEmail = async function(accountSubscriberEmail:string){
  const accountSubscriber = this;
  accountSubscriber.accountSubscriberEmail = accountSubscriberEmail;
  await accountSubscriber.save();
  return accountSubscriber;
};

//Method to update the phone number
AccountSubscriberSchema.methods.updatePhoneNo = async function(accountSubscriberPhoneNo:string){
  const accountSubscriber = this;
  accountSubscriber.accountSubscriberPhoneNo = accountSubscriberPhoneNo;
  await accountSubscriber.save();
  return accountSubscriber;
};

//Pre-save hook to ensure that the accountSubscriberEmail is unique
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  const existingAccountSubscriber = await AccountSubscriber.findOne({accountSubscriberEmail:accountSubscriber.accountSubscriberEmail});
  if(existingAccountSubscriber){
    throw new Error('Email already exists');
  }
  next();
});

//Pre-save hook to ensure that the accountSubscriberPhoneNo is unique
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  const existingAccountSubscriber = await AccountSubscriber.findOne({accountSubscriberPhoneNo:accountSubscriber.accountSubscriberPhoneNo});
  if(existingAccountSubscriber){
    throw new Error('Phone number already exists');
  }
  next();
});

//Pre-save to ensure that the accountSubscriberPassword is at least 8 characters long
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberPassword')){
    if(accountSubscriber.accountSubscriberPassword.length < 8){
      throw new Error('Password must be at least 8 characters long');
    }
  }
  next();
});

//Pre-save hook to ensure that the accountSubscriberEmail is a valid email
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberEmail')){
    if(!accountSubscriber.accountSubscriberEmail.includes('@')){
      throw new Error('Invalid email');
    }
  }
  next();
});

//Pre-save hook to ensure that the accountSubscriberPhoneNo is a valid phone number
AccountSubscriberSchema.pre<IAccountSubscriber>('save', async function(next){
  const accountSubscriber = this;
  if(accountSubscriber.isModified('accountSubscriberPhoneNo')){
    if(accountSubscriber.accountSubscriberPhoneNo.length !== 11){
      throw new Error('Invalid phone number');
    }
  }
  next();
});

// Create & Export the Model. The collection name in the database is derived from the model name. 
//By default, Mongoose will pluralize the model name to determine the collection name.
const AccountSubscriber = mongoose.model<IAccountSubscriber>('AccountSubscriber', AccountSubscriberSchema);
export {AccountSubscriber, IAccountSubscriber};