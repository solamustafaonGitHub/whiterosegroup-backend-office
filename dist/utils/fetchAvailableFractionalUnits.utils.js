import { Project214Information } from "../models/project214Information.model.js";
import SelectedProject214FractionalUnits from "../models/selectedProject214FractionalUnits.model.js";
export const fetchAvaiilableFractionalUnits = async (projectShortId) => {
    try {
        const project214info = await Project214Information.findById(projectShortId);
        if (!project214info) {
            throw new Error(`❌ Project with ID ${projectShortId} not found in the database`);
        }
        const allUnits = project214info.projectStructure.flatMap((block) => block.houseDetails.flatMap((house) => house.fractionalUnitDetails));
        const selectedUnits = await SelectedProject214FractionalUnits.find({ projectShortId }).exec();
        const selectedUnitIDs = selectedUnits.map((unit) => unit.fractionalUnitID);
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
        console.log('Available fractional units:', availableUnits);
        return availableUnits;
    }
    catch (error) {
        console.error('Error fetching available units:', error);
        throw error;
    }
};
