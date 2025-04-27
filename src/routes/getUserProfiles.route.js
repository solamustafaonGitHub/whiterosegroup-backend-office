"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfiles = void 0;
const activeUser_model_js_1 = require("../models/activeUser.model.js");
const getUserProfiles = async (req, res) => {
    try {
        // Fetch user profiles from the database
        const userProfiles = await activeUser_model_js_1.ActiveUser.find().exec();
        // Transform the data if necessary
        const transformedProfiles = userProfiles.map(profile => ({
            id: profile.activeUserID,
            fullName: profile.activeUserFirstName, // This uses the virtual property
            email: profile.activeUserEmail,
            phoneNo: profile.activeUserPhoneNo,
            gender: profile.activeUserGender,
            workStatus: profile.activeUserWorkStatus,
            deliveryAddress: profile.activeUserAssetDeliveryAddress,
        }));
        // Send the transformed data as the response
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserProfiles = getUserProfiles;
