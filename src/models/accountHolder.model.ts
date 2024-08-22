import mongoose, {model,Schema,Types} from 'mongoose'
import bcrypt from 'bcrypt';

interface IAccountHolder{
    accountHolderPhoneNo:string;
    accountHolderEmail:string;
    accountHolderPassword:string;
    accountHolderConfirmPassword:String;
    createdAt:Date;
    lastUpdatedAt:Date;
}

// Define the schema for the document
const AccountHolderSchema = new Schema<IAccountHolder>({
    accountHolderPhoneNo:{type:String, required:true, unique:true},
    accountHolderEmail:{type:String, required:true, unique:true},
    accountHolderPassword:{type:String, required:true},
    accountHolderConfirmPassword:{type:String, required:true},
    createdAt:{type:Date, default:Date.now},
    lastUpdatedAt:{type:Date, default:Date.now},
  });


// Pre-save hook
AccountHolderSchema.pre('save', async function (next) {
    if (!this.isModified('accountHolderPassword')) 
    return next(); // Skip hashing if password not modified
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(this.accountHolderPassword, 12); // Increase cost factor for better security
  
      // Update the applUserPassword field with the hashed value
      this.accountHolderPassword = hashedPassword;
      this.accountHolderConfirmPassword = hashedPassword;
  
      next();
    } catch (error) {
      console.error("Error hashing password:", error.message, error.stack);
      next(error); // Pass the error to Mongoose for handling
    }
  });

  // Create & Export the Model. The collection name in the database is derived from the model name. 
  //By default, Mongoose will pluralize the model name to determine the collection name.
const AccountHolder = mongoose.model<IAccountHolder>('AccountHoder', AccountHolderSchema);
export {AccountHolder, IAccountHolder};