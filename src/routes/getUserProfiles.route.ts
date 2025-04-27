import {Request,Response} from 'express';
import {ActiveSubscriber} from '../models/activeSubscriber.model.js'

const getUserProfiles = async (req:Request, res:Response) => {
    try {
        // Fetch user profiles from the database
        const userProfiles = await ActiveSubscriber.find().exec();

        // Transform the data if necessary
        const transformedProfiles = userProfiles.map(profile => ({
            id: profile.activeSubscriberID,
            fullName: profile.activeSubscriberFirstName, // This uses the virtual property
            email: profile.activeSubscriberEmail,
            phoneNo: profile.activeSubscriberPhoneNo,
            gender: profile.activeSubscriberGender,
            workStatus: profile.activeSubscriberWorkStatus,
            deliveryAddress: profile.activeSubscriberAssetDeliveryAddress,
        }));

       // Send the transformed data as the response
       res.status(200).json(transformedProfiles);
    } catch (error) {
        console.error('Error fetching user profiles:',error);
        res.status(500).json({message:'Internal server error'});
    }
};

export {getUserProfiles}
