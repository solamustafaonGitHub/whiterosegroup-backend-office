import { Schema, model } from 'mongoose';
import { Project214Information } from '../models/project214Information.model.js';
import { generatePropertyListingShortId } from '../utils/generatePropertyListingID.utils.js';
;
const project214AvailableFractionalUnitsListSchema = new Schema({
    propertyListingID: { type: String, default: generatePropertyListingShortId, unique: true },
    propertyCount: { type: Number, default: 0 },
    blockName: { type: String },
    houseName: { type: String },
    propertyFrUnitID: { type: String },
    propertyFractionalUnitIdentifier: { type: String },
    propertyAllocationNumber: { type: String },
    propertyFractionalUnitSalesPrice: { type: Number },
    propertyFractionalUnitSalesTag: { type: String },
});
project214AvailableFractionalUnitsListSchema.pre('save', async function (next) {
    const propertyListing = this;
    if (!propertyListing.isModified('propertyListingID'))
        return next();
    propertyListing.propertyListingID = generatePropertyListingShortId();
    next();
});
project214AvailableFractionalUnitsListSchema.pre('save', async function (next) {
    const propertyListing = this;
    if (!propertyListing.isModified('propertyListingID'))
        return next();
    const projectInfo = await Project214Information.findById(propertyListing.propertyListingID);
    if (!projectInfo)
        return next();
    const projectInfoData = projectInfo.toObject();
    for (const block of projectInfoData.projectStructure) {
        for (const house of block.houseDetails) {
            for (const fractionUnit of house.fractionalUnitDetails) {
                propertyListing.propertyCount = fractionUnit.propertyCount;
                propertyListing.blockName = block.blockName;
                propertyListing.houseName = house.houseName;
                propertyListing.propertyFrUnitID = fractionUnit.fractionalUnitID;
                propertyListing.propertyFractionalUnitIdentifier = fractionUnit.fractionalUnitUniqueIdentifier;
                propertyListing.propertyAllocationNumber = fractionUnit.propertyAllocationNumber;
                propertyListing.propertyFractionalUnitSalesPrice = fractionUnit.fractionUnitSalesPrice;
                propertyListing.propertyFractionalUnitSalesTag = fractionUnit.fractionalUnitSalesTag;
            }
        }
    }
    next();
});
const Project214AvailableFractionalUnitsList = model('Project214AvailableFractionalUnitsList', project214AvailableFractionalUnitsListSchema);
export { Project214AvailableFractionalUnitsList };
