import express from 'express';
import { getAvailableFractionalUnitsList, createSubscription, getSubscriptionDetails } from '../controllers/subscribeToProject214.controller.js';
const subscribeToProject214Router = express.Router();
subscribeToProject214Router.get('/form/:projectId', getAvailableFractionalUnitsList);
subscribeToProject214Router.post('/subscribe', createSubscription);
subscribeToProject214Router.get('/listsubscription/:subscriptionId', getSubscriptionDetails);
export default subscribeToProject214Router;
