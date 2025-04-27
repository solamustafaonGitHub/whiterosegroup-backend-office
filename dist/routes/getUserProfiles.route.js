import { ActiveSubscriber } from '../models/activeSubscriber.model.js';
const getUserProfiles = async (req, res) => {
    try {
        const userProfiles = await ActiveSubscriber.find().exec();
        const transformedProfiles = userProfiles.map(profile => ({
            id: profile.activeSubscriberID,
            fullName: profile.activeSubscriberFirstName,
            email: profile.activeSubscriberEmail,
            phoneNo: profile.activeSubscriberPhoneNo,
            gender: profile.activeSubscriberGender,
            workStatus: profile.activeSubscriberWorkStatus,
            deliveryAddress: profile.activeSubscriberAssetDeliveryAddress,
        }));
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { getUserProfiles };
