import { ProfiledUser } from '../models/profiledUser.model.js';
const getUserProfiles = async (req, res) => {
    try {
        const userProfiles = await ProfiledUser.find().exec();
        const transformedProfiles = userProfiles.map(profile => ({
            id: profile.profiledUserID,
            fullName: profile.profiledUserFirstName,
            email: profile.profiledUserEmail,
            phoneNo: profile.profiledUserPhoneNo,
            gender: profile.profiledUserGender,
            workStatus: profile.profiledUserWorkStatus,
            deliveryAddress: profile.profiledUserAssetDeliveryAddress,
        }));
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { getUserProfiles };
