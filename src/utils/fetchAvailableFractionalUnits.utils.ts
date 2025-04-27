//utils/fetchAvaiilableFractionalUnits.utils.ts
import { Project214Information } from "../models/project214Information.model.js";
import SelectedProject214FractionalUnits from "../models/selectedProject214FractionalUnits.model.js";
import mongoose from 'mongoose';

/**
 * Fetches available fractional units for a given project, excluding already selected units.
 * @param {mongoose.Types.ObjectId} projectShortId - The ObjectId of the project to fetch units for.
 * @returns {Promise<Array>} - A list of available fractional units.
 * @throws {Error} - If the project is not found or an error occurs during fetching.
 */
export const fetchAvaiilableFractionalUnits = async (projectShortId) => {
  try {
    // Step 1: Fetch the project by its ObjectId
    const project214info = await Project214Information.findById(projectShortId);
    if (!project214info) {
      throw new Error(`❌ Project with ID ${projectShortId} not found in the database`);
    }

    // Step 2: Fetch all units for the project
    const allUnits = project214info.projectStructure.flatMap((block) =>
      block.houseDetails.flatMap((house) => house.fractionalUnitDetails)
    );

    // Step 3: Fetch units that have already been selected for the project
    const selectedUnits = await SelectedProject214FractionalUnits.find({projectShortId}).exec();
    const selectedUnitIDs = selectedUnits.map((unit) => unit.fractionalUnitID);

    // Step 4: Filter out selected units and map to the desired format
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
        isSelected: false, // Ensure it's initially not selected
      }));

    console.log('Available fractional units:', availableUnits); // Debugging only
    return availableUnits;
  } catch (error) {
    console.error('Error fetching available units:', error);
    throw error; // Propagate the error to the caller
  }
};