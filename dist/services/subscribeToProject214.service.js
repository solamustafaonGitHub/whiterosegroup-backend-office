import mongoose from "mongoose";
import { Project214Information } from "../models/project214Information.model.js";
export const getAvailableFractionalUnits = async (projectId, selectedUnitIDs = []) => {
    if (!projectId) {
        console.warn("No Project ID Provided.");
        return [];
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        console.error(`❌ Invalid Project ID: ${projectId}`);
        return [];
    }
    try {
        console.log("Fetching Project With ID:", projectId);
        const project = await Project214Information.findById(projectId);
        if (!project) {
            console.error(`❌ Project with ID ${projectId} Not Found In DB`);
            return [];
        }
        const allUnits = project.projectStructure.flatMap((block) => block.houseDetails.flatMap((house) => house.fractionalUnitDetails));
        const availableUnits = allUnits
            .filter((unit) => !selectedUnitIDs.includes(unit.fractionalUnitID))
            .map((unit) => ({
            propertyCount: unit.propertyCount,
            fractionalUnitID: unit.fractionalUnitID,
            fractionalUnitName: unit.fractionalUnitName,
            fractionalUnitDescription: unit.fractionalUnitDescription,
            fractionalUnitUniqueIdentifier: unit.fractionalUnitUniqueIdentifier,
            propertyAllocationNumber: unit.propertyAllocationNumber,
            fractionUnitSalesPrice: unit.fractionUnitSalesPrice,
            fractionalUnitSalesTag: unit.fractionalUnitSalesTag,
            isSelected: false,
        }));
        console.log("Available Fractional Units:", availableUnits);
        return availableUnits;
    }
    catch (error) {
        console.error("Error Fetching Available Fractional Units:", error);
        return [];
    }
};
