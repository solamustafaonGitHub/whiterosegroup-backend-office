import AdminJS, {actionErrorHandler, ComponentLoader} from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express, {Request,Response} from 'express';
import {ActionResponse} from 'adminjs';

import {Project214Information, IProject214Information} from '../models/project214Information.model.js'; 

const fetchFractionalUnits = {
    name: 'fetchFractionalUnits',
    actionType: 'record',
    handler: async (request, response, context) => {
        const { record } = context;

        // Fetch the project
        const project = await Project214Information.findById(record.id());
        if (!project) {
            throw new Error('Project not found');
        }

        // Extract fractionalUnitDetails from the projectStructure
        const fractionalUnits = project.projectStructure.flatMap((block) =>
            block.houseDetails.flatMap((house) =>
                house.fractionalUnitDetails.map((unit) => ({
                    propertyCount: unit.propertyCount,
                    fractionalUnitID: unit.fractionalUnitID,
                    fractionalUnitUniqueIdentifier: unit.fractionalUnitUniqueIdentifier,
                    fractionUnitSalesPrice: unit.fractionUnitSalesPrice,
                    fractionalUnitSalesTag: unit.fractionalUnitSalesTag,
                }))
            )
        );
        // Render the custom component
        return {
            component: new ComponentLoader().add('FractionalUnitsList', './components/FractionalUnitsList'), // Path to the custom component
            props: {
                record: record.toJSON(),
                fractionalUnits,
            },
        };
    },
};

//Export the action
export default fetchFractionalUnits;