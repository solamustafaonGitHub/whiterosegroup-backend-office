import { SubscribeToProject214 } from "../models/subscribeToProject214.model.js";
import { getAvailableFractionalUnits } from "../services/subscribeToProject214.service.js";
export const getAvailableFractionalUnitsList = async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log("Received projectId:", projectId);
        const availableUnits = await getAvailableFractionalUnits(projectId);
        res.status(200).json({ availableFractionalUnits: availableUnits });
    }
    catch (error) {
        console.error("Error Fetching Available Fractional Units:", error);
        res.status(500).json({ message: "Failed to Fetch Available Fractional Units" });
    }
};
export const createSubscription = async (req, res) => {
    try {
        const { projectTheSubscriberIsInterestedIn, fractionalUnits } = req.body;
        const availableUnits = await getAvailableFractionalUnits(projectTheSubscriberIsInterestedIn);
        const selectedUnits = fractionalUnits.filter((unit) => availableUnits.some((available) => available.fractionalUnitID === unit.fractionalUnitID) && unit.isSelected);
        const totalSalePrice = selectedUnits.reduce((total, unit) => total + unit.fractionUnitSalesPrice, 0);
        const subscription = new SubscribeToProject214({
            ...req.body,
            SubscribeToFractionsOfProject214: selectedUnits,
            projectFractionalUnitsTotalSalePrice: totalSalePrice,
        });
        await subscription.save();
        res.status(201).json({ message: "Subscription Created Successfully", subscription });
    }
    catch (error) {
        console.error("Error Creating Subscription:", error);
        res.status(500).json({ message: "Failed To Create Subscription" });
    }
};
export const getSubscriptionDetails = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const subscription = await SubscribeToProject214.findById(subscriptionId).lean();
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        const availableUnits = await getAvailableFractionalUnits(subscription.projectTheSubscriberIsInterestedIn, subscription.SubscribeToFractionsOfProject214.map((unit) => unit.fractionalUnitID));
        res.status(200).json({
            ...subscription,
            availableFractionalUnits: availableUnits,
        });
    }
    catch (error) {
        console.error("Error Fetching Subscription Details:", error);
        res.status(500).json({ message: "Failed to Fetch Subscription Details" });
    }
};
