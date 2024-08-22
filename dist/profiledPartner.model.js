import { model, Schema } from 'mongoose';
export const profiledPartnerSchema = new Schema({
    profiledPartnerName: {
        type: String,
        required: true
    },
    profiledPartnerType: {
        type: String,
        enum: ['PRIVATE COMPANY', 'PUBLIC INSTITUTION', 'SELF-EMPLOYED', 'OTHERS'],
        required: true
    },
    profiledPartnerSubType: {
        type: String,
        enum: ['LIMITED LIABILITY COMPANY', 'PUBLIC LIMITED LIABILITY COMPANY (PLC)', 'SELF EMPLOYMENT', 'FEDERAL GOVT. AGENCY/PARASTATAL', 'STATE GOVT. AGENCY/PARASTATAL', 'LOCAL GOVT. AGENCY/PARASTATAL', 'OTHERS'],
        required: true
    },
    profiledPartnerOfficeAdd: {
        type: String,
        required: true
    },
    profiledPartnerPayDay: {
        type: Number,
        enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
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
export const ProfiledPartner = model('profilePartners', profiledPartnerSchema);
