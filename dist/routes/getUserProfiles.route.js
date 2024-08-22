import { ActiveUser } from '../models/activeUser.model.js';
const getUserProfiles = async (req, res) => {
    try {
        const userProfiles = await ActiveUser.find().exec();
        const transformedProfiles = userProfiles.map(profile => ({
            id: profile.activeUserID,
            fullName: profile.activeUserFirstName,
            email: profile.activeUserEmail,
            phoneNo: profile.activeUserPhoneNo,
            gender: profile.activeUserGender,
            workStatus: profile.activeUserWorkStatus,
            deliveryAddress: profile.activeUserAssetDeliveryAddress,
        }));
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { getUserProfiles };
