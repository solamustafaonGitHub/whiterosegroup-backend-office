"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfiledPartner = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const profiledPartnerSchema = new mongoose_1.Schema({
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
        enum: ['LIMITED LIABILITY COMPANY (LLC)', 'PUBLIC LIABILITY COMPANY (PLC)', 'FEDERAL GOVERNMENT AGENCY/PARASTATAL', 'STATE GOVERNMENT AGENCY/PARASTATAL', 'LOCAL GOVERNMENT AGENCY/PARASTATAL', 'SELF EMPLOYMENT', 'OTHERS'],
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
// Create & Export the Model. The collection name in the database is derived from the model name. By default, Mongoose will pluralize the model name to determine the collection name.
const ProfiledPartner = mongoose_1.default.model('ProfiledPartner', profiledPartnerSchema);
exports.ProfiledPartner = ProfiledPartner;
