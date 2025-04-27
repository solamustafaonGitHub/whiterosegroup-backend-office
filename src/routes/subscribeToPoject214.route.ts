//routes/subscribeToProject214.route.ts
import express from 'express';
import {getAvailableFractionalUnitsList, createSubscription, getSubscriptionDetails} from '../controllers/subscribeToProject214.controller.js';

const subscribeToProject214Router = express.Router();

//GET route for fetching available fractional units
subscribeToProject214Router.get('/form/:projectId', getAvailableFractionalUnitsList);

//POST route for creating a new subscription
subscribeToProject214Router.post('/subscribe', createSubscription);

//GET route for fetching subscription details
subscribeToProject214Router.get('/listsubscription/:subscriptionId', getSubscriptionDetails);

export default subscribeToProject214Router;



