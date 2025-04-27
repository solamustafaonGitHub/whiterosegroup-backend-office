import mongoose from "mongoose";
import { Project214Information } from "../models/project214Information.model.js";

export const getAvailableFractionalUnits = async (projectId, selectedUnitIDs = []) => {
  if (!projectId) {
    console.warn("No Project ID Provided.");
    return []; // Return an empty array if the project ID is undefined
  }

  //Validate that projectId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    console.error(`❌ Invalid Project ID: ${projectId}`);
    return []; // Return an empty array if the project ID is invalid
  }
  try {
    console.log("Fetching Project With ID:", projectId);

    //Query the database for the project
    const project = await Project214Information.findById(projectId);
    if (!project) {
      console.error(`❌ Project with ID ${projectId} Not Found In DB`);
      return []; // Return an empty array if the project is not found
    }

    //Extract and filter fractional units
    const allUnits = project.projectStructure.flatMap((block) =>
      block.houseDetails.flatMap((house) => house.fractionalUnitDetails)
    );

    //Filter out already selected units
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
        isSelected: false, // Ensuring it's initially not selected
      }));

    console.log("Available Fractional Units:", availableUnits);
    return availableUnits;
  } catch (error) {
    console.error("Error Fetching Available Fractional Units:", error);
    return []; // Return an empty array in case of an error
  }
};
