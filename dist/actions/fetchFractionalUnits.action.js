import { ComponentLoader } from 'adminjs';
import { Project214Information } from '../models/project214Information.model.js';
const fetchFractionalUnits = {
    name: 'fetchFractionalUnits',
    actionType: 'record',
    handler: async (request, response, context) => {
        const { record } = context;
        const project = await Project214Information.findById(record.id());
        if (!project) {
            throw new Error('Project not found');
        }
        const fractionalUnits = project.projectStructure.flatMap((block) => block.houseDetails.flatMap((house) => house.fractionalUnitDetails.map((unit) => ({
            propertyCount: unit.propertyCount,
            fractionalUnitID: unit.fractionalUnitID,
            fractionalUnitUniqueIdentifier: unit.fractionalUnitUniqueIdentifier,
            fractionUnitSalesPrice: unit.fractionUnitSalesPrice,
            fractionalUnitSalesTag: unit.fractionalUnitSalesTag,
        }))));
        return {
            component: new ComponentLoader().add('FractionalUnitsList', './components/FractionalUnitsList'),
            props: {
                record: record.toJSON(),
                fractionalUnits,
            },
        };
    },
};
export default fetchFractionalUnits;
