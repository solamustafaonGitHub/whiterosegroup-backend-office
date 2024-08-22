import { UserProfile } from '../models/userProfile.model.js';
const dataflowUserProfile = async (req, res) => {
    try {
        const userProfiles = await UserProfile.find().lean().exec();
        const transformedProfiles = userProfiles.map(profile => ({
            userprofileFullName: profile.userProfileFullName,
            userProfilePhoneNo: profile.userProfilePhoneNo,
            userProfileEmail: profile.userProfileEmail
        }));
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { dataflowUserProfile };
