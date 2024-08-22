import mongoose, {model,Schema,Types } from 'mongoose';

interface IProfiledPartner {
    profiledPartnerName: {
        type: String, 
        required: true
    },
    profiledPartnerType: {
        type:String, 
        enum:['PRIVATE COMPANY','PUBLIC INSTITUTION','SELF-EMPLOYED','OTHERS'],
        required: true
    },
    profiledPartnerSubType: {
        type:String, 
        enum:['FEDERAL GOVERNMENT AGENCY/PARASTATAL','STATE GOVERNMENT AGENCY/PARASTATAL','LOCAL GOVERNMENT AGENCY/PARASTATAL','SELF-EMPLOYED'],
        required: true
    },
    profiledPartnerOfficeAdd: {
        type: String, 
        required: true
    },
    profiledPartnerPayDay:{
        type:Number, 
        enum:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
        required: true
    }, 
    createdAt: {
        type: Date, 
        default: Date
    },
    lastUpdatedAt: {
        type: Date, 
        default: Date
    }
}

const profiledPartnerSchema = new Schema<IProfiledPartner>({
    profiledPartnerName: {
        type: String, 
        required: true
    },
    profiledPartnerType: {
        type:String, 
        enum:['PRIVATE COMPANY','PUBLIC INSTITUTION','SELF-EMPLOYED','OTHERS'],
        required: true
    },
    profiledPartnerSubType: {
        type:String, 
        enum:['LIMITED LIABILITY COMPANY (LLC)','PUBLIC LIABILITY COMPANY (PLC)','FEDERAL GOVERNMENT AGENCY/PARASTATAL','STATE GOVERNMENT AGENCY/PARASTATAL','LOCAL GOVERNMENT AGENCY/PARASTATAL','SELF EMPLOYMENT','OTHERS'],
        required: true
    },
    profiledPartnerOfficeAdd: {
        type: String, 
        required: true
    },
    profiledPartnerPayDay:{
        type:Number, 
        enum:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
        required: true
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    },
    lastUpdatedAt: {
        type: Date, 
        default: Date.now
    }
});

// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ProfiledPartner = mongoose.model<IProfiledPartner>('ProfiledPartner', profiledPartnerSchema);
export {ProfiledPartner, IProfiledPartner};