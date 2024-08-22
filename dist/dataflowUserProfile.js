import { UserProfile } from './userProfile.model.js';
const dataflowUserProfile = async (req, res) => {
    try {
        const userProfiles = await UserProfile.find().exec();
        const transformedProfiles = userProfiles.map(profile => ({
            userprofileFullName: profile.userProfileFullName
        }));
        res.status(200).json(transformedProfiles);
    }
    catch (error) {
        console.error('Error fetching user profiles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { dataflowUserProfile };
