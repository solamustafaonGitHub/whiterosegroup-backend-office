import mongoose, {Schema, Document, model, Types} from 'mongoose';
import express from 'express';

import {ActiveSubscriber} from '../models/activeSubscriber.model.js';
import {PaymentPlan} from '../models/paymentPlan.model.js';
import {Project214Information} from '../models/project214Information.model.js';
import generateCombinedOrderShortId from '../utils/generateCombinedPOShortId.util.js';


//Interface to represent the SubscribeToFractionOfProject214
interface ISubscribeToFractionsOfProject214 {
    propertyCount: number;
    fractionalUnitID:string
    fractionalUnitName: string;
    fractionalUnitDescription: string;
    fractionalUnitUniqueIdentifier: string;
    propertyAllocationNumber: string;
    fractionUnitSalesPrice: number;
    fractionalUnitSalesTag: string;
    isSelected: boolean;
};

//Define the Interface for the Subscription to Project214
interface ISubscribeToProject214 extends Document {
    subscribeP214OrderId: string;
    subscribersActiveID: mongoose.Types.ObjectId;
    subscribersFullName: string;
    subscribersEmail: string;
    subscribersPhoneNumber: string;
    subscribersContactAddress: string;
    projectTheSubscriberIsInterestedIn: mongoose.Types.ObjectId;
    projectTheSubscriberIsInterestedInName: string;
    projectTheSubscriberIsInterestedInShortDesc: string;
    projectTheSubscriberIsInterestedInStartDate: Date;
    projectTheSubscriberIsInterestedInCompletionDate: Date;
    projectTheSubscriberIsInterestedInAcquisitionStage: string;
    SubscribeToFractionsOfProject214: ISubscribeToFractionsOfProject214[];
    selectedUnits: string[];
    projectFractionalUnitsTotalSalePrice: number;
    projectTheSubscriberIsInterestedInPaymentPlanID: mongoose.Types.ObjectId;
    projectTheSubscriberIsInterestedInPaymentPlanName: string;
    projectTheSubscriberIsInterestedInPaymentPlanShortDesc: string;
    createdAt: Date;
    lastUpdatedAt: Date;
};

//Define the Schema for the Subscription to Project214
const subscribeToProject214Schema = new mongoose.Schema<ISubscribeToProject214>({
    subscribeP214OrderId: {type:String, unique:true, default:generateCombinedOrderShortId},
    subscribersActiveID: {type:mongoose.Schema.Types.ObjectId, ref:'ActiveUser', required:true},
    subscribersFullName: {type:String},
    subscribersEmail: {type:String},
    subscribersPhoneNumber: {type:String},
    subscribersContactAddress: {type:String},
    projectTheSubscriberIsInterestedIn: {type:mongoose.Schema.Types.ObjectId, ref:'Project214Information', required:true},
    projectTheSubscriberIsInterestedInName: {type:String},
    projectTheSubscriberIsInterestedInShortDesc: {type:String},
    projectTheSubscriberIsInterestedInStartDate: {type:Date},
    projectTheSubscriberIsInterestedInCompletionDate: {type:Date},
    projectTheSubscriberIsInterestedInAcquisitionStage: {type:String},
    SubscribeToFractionsOfProject214: [{
        propertyCount: {type:Number},
        fractionalUnitID: {type:String},
        fractionalUnitName: {type:String},
        fractionalUnitDescription: {type:String},
        fractionalUnitUniqueIdentifier: {type:String},
        propertyAllocationNumber: {type:String},
        fractionUnitSalesPrice: {type:Number},
        fractionalUnitSalesTag: {type:String},
        isSelected: {type:Boolean, default:false},
    }],
    selectedUnits: [{type:String}],
    projectFractionalUnitsTotalSalePrice: {type:Number},
    projectTheSubscriberIsInterestedInPaymentPlanID: {type:mongoose.Schema.Types.ObjectId, ref:'PaymentPlan', required:true},
    projectTheSubscriberIsInterestedInPaymentPlanName: {type:String},
    projectTheSubscriberIsInterestedInPaymentPlanShortDesc: {type:String},
    createdAt: {type:Date, required:true, default:Date.now()},
    lastUpdatedAt: {type:Date, required:true, default:Date.now()},
});


//Pre-save hook to ensure subscribeP214OrderId is unique & saved
subscribeToProject214Schema.pre('save', function(next) {
    if (!this.subscribeP214OrderId) {
        this.subscribeP214OrderId = generateCombinedOrderShortId();
    }
    next();
});

//Pre-save hook to set subscribersFullName, subscribersEmail, subscribersPhoneNumber, subscribersContactAddress
subscribeToProject214Schema.pre<ISubscribeToProject214>('save', async function(next) {
    try{
        if(this.subscribersActiveID){
            const subscribingActiveID = await ActiveSubscriber.findById(this.subscribersActiveID).exec();
            if(subscribingActiveID){
                this.subscribersFullName = subscribingActiveID.activeSubscriberFirstName + ' ' + subscribingActiveID.activeSubscriberMiddleName + ' ' + subscribingActiveID.activeSubscriberLastName;
                this.subscribersEmail = subscribingActiveID.activeSubscriberEmail;
                this.subscribersPhoneNumber = subscribingActiveID.activeSubscriberPhoneNo;
                this.subscribersContactAddress = subscribingActiveID.activeSubscriberAssetDeliveryAddress;
            }
        }
    }catch(err){
        console.log(`Error occurred in pre-save hook: ${err}`);
    }
});

//Pre-save hook to set projectTheSubscriberIsInterestedInShortDesc, projectTheSubscriberIsInterestedInStartDate, projectTheSubscriberIsInterestedInCompletionDate, projectTheSubscriberIsInterestedInAcquisitionStage
subscribeToProject214Schema.pre<ISubscribeToProject214>('save', async function(next) {
    try{
        if(this.projectTheSubscriberIsInterestedIn){
            const projectInterestedIn = await Project214Information.findById(this.projectTheSubscriberIsInterestedIn).exec();
            if(projectInterestedIn){
                this.projectTheSubscriberIsInterestedInName = projectInterestedIn.projectName;
                this.projectTheSubscriberIsInterestedInShortDesc = projectInterestedIn.projectDescription;
                this.projectTheSubscriberIsInterestedInStartDate = projectInterestedIn.projectStartDate;
                this.projectTheSubscriberIsInterestedInCompletionDate = projectInterestedIn.projectCompletionDate;
                this.projectTheSubscriberIsInterestedInAcquisitionStage = projectInterestedIn.projectCurrentAcquisitionPhase;
            }
        }
    }catch(err){
        console.log(`Error occurred in pre-save hook: ${err}`);
    }
});

//Pre-save hook to set projectTheSubscriberIsInterestedInPaymentPlanName, projectTheSubscriberIsInterestedInPaymentPlanShortDesc, 
subscribeToProject214Schema.pre<ISubscribeToProject214>('save', async function(next) {
    try{
        if(this.projectTheSubscriberIsInterestedInPaymentPlanID){
            const paymentPlan = await PaymentPlan.findById(this.projectTheSubscriberIsInterestedInPaymentPlanID).exec();
            if(paymentPlan){
                this.projectTheSubscriberIsInterestedInPaymentPlanName = paymentPlan.paymentPlanName;
                this.projectTheSubscriberIsInterestedInPaymentPlanShortDesc = paymentPlan.paymentPlanDescription;
            }
        }
    } catch (err) {
        console.log(`Error occurred in pre-save hook: ${err}`);
    }
});

//Register the Schema as a Model
const SubscribeToProject214 = model<ISubscribeToProject214>('SubscribeToProject214', subscribeToProject214Schema);
export {SubscribeToProject214, ISubscribeToProject214, ISubscribeToFractionsOfProject214};
