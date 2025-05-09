import mongoose, {Schema, Document, model, Types} from 'mongoose';

import {generateCombinedFOREAShortId} from '../utils/generateCombinedFOREAShortId.utils.js';
import {generateCombinedPropertyID} from '../utils/generateCombinedPropertyID.utils.js';   
import formatCurrency from '../utils/formatCurrency.utils.js';
import {generateBlockShortId} from '../utils/generateBlockShortId.utils.js';
import {generateHouseShortId} from '../utils/generateHouseShortId.utils.js';
import {generatePropertyListingShortId} from '../utils/generatePropertyListingID.utils.js';

import {PaymentPlanForFractionalOwnership} from './paymentPlanForFractionalOwnership.model.js'; 


//Interface for Fractinal Unit | House | Block
interface IFractionalUnit extends Document {
    propertyCount: number;
    fractionalUnitID: string;
    fractionalUnitName: string;
    fractionalUnitDescription: string;
    fractionalUnitUniqueIdentifier: string;
    propertyAllocationNumber: string;
    fractionUnitSalesPrice: number;
    fractionalUnitSalesTag: string;
};
interface IHouse extends Document {
    houseID: string;
    houseName: string;
    houseDescription: string;
    houseSalesPrice: number;
    fractionalUnitDetails: IFractionalUnit[];
};
interface IBlock extends Document {
    blockID: string;
    blockName: string;
    blockDescription: string;
    blockSalesPrice: number;
    houseDetails: IHouse[];
};


//Interface for MultiSelectPaymentPlan
interface IMultiSelectPaymentPlan {
    selectedPlans: Array<{
        plan: typeof PaymentPlanForFractionalOwnership; // The selected plan
        selectedPlanName: string; // Additional attribute to display
    }>;
    addPlan: (plan:typeof PaymentPlanForFractionalOwnership, selectedPlanName:string) => void; // Function to add a plan with an attribute
    removePlan: (paymentPlanId:string) => void; // Function to remove a plan
    clearSelection: () => void; // Function to clear all selections
};

interface IProject214Information extends Document {
    projectShortId: string;
    projectName: string;
    projectNameAlias: string;
    projectDescription: string;
    projectStartDate: Date;
    projectCompletionLengthInMonths: number;
    projectCompletionDate?: Date;
    projectCurrentAcquisitionPhase: string;
    projectStructure: {
        blockID: string;
        blockName: string;
        blockDescription: string;
        blockSalesPrice: number;
        houseDetails: {
            houseID: string;
            houseName: string;
            houseDescription: string;
            houseSalesPrice: number;
            fractionalUnitDetails: {
                propertyCount: number;
                fractionalUnitID: string;
                fractionalUnitName: string;
                fractionalUnitDescription: string;
                fractionalUnitUniqueIdentifier: string;
                propertyAllocationNumber: string;
                fractionUnitSalesPrice: number;
                fractionalUnitSalesTag: string;
            }[];
        }[];
    }[];
    MultiSelectPaymentPlan: IMultiSelectPaymentPlan;
    createdAt: Date;
    lastUpdatedAt: Date;
}

//Schema for Project214Information
const project214Schema = new Schema<IProject214Information>({
    projectShortId: {type:String, default:generateCombinedFOREAShortId, unique:true},
    projectName: {type:String, required:true},
    projectNameAlias: {type:String, required:true},
    projectDescription: {type:String, required:true},
    projectStartDate: {type:Date, required:true},
    projectCompletionLengthInMonths: {type:Number, required:true},
    projectCompletionDate: {type:Date},
    projectCurrentAcquisitionPhase: {type:String, required:true, enum:['OFF-PLAN PURCHASE', 'UNDER CONSTRUCTION', 'NEWLY COMPLETED', 'READY-FOR-OCCUPANCY (RFO)', 
        'PRE-OWNED/RESALE', 'DISTRESSED/FORECLOSURE SALE', 'TURNKEY PROPERTY']},
    projectStructure: [{   
            blockID: {type:String, default:generateBlockShortId, unique:true},
            blockName: {type:String, required:true},
            blockDescription: {type:String, required:true},
            blockSalesPrice: {type:Number, required:true},
            houseDetails: [{
                    houseID: {type:String, default:generateHouseShortId, unique:true},
                    houseName: {type: String, required:true},
                    houseDescription: {type:String, required:true},
                    houseSalesPrice: {type:Number, required:true},
                    fractionalUnitDetails: [{   
                            propertyCount: {type:Number, default:0, unique:true},
                            fractionalUnitID: {type:String, default:generateCombinedPropertyID, unique:true},
                            fractionalUnitName: {type:String, required:true},
                            fractionalUnitDescription: {type:String, required:true},
                            fractionalUnitUniqueIdentifier: {type:String, unique:true},
                            propertyAllocationNumber: {type:String, unique:true},
                            fractionUnitSalesPrice: {type:Number, required:true},
                            fractionalUnitSalesTag: {type:String, required:true, enum:['Not Yet Subscribed', 'Subscribed'], default:'Not Yet Subscribed'}
                        }]
                }]
        }],
    MultiSelectPaymentPlan: {selectedPlans: [{
        plan: {type:Schema.Types.ObjectId, ref:'PaymentPlanForFractionalOwnership'},
        selectedPlanName: {type:String}
    }]},
    createdAt: {type:Date, default:Date.now},
    lastUpdatedAt: {type:Date, default:Date.now}
});


//Add methods to the schema ||Remove a plan by its ID ||Clear all selected plans
project214Schema.methods.addPlan = function (PaymentPlanId, PaymentPlanName) {
    const existingPlan = this.MultiSelectPaymentPlan.selectedPlans.find(
        (item) => item.plan.toString() === PaymentPlanId.toString());
    if (!existingPlan) {
        this.MultiSelectPaymentPlan.selectedPlans.push({
            plan: PaymentPlanId,
            selectedPlanName: PaymentPlanName
        });
    }
};
project214Schema.methods.removePlan = function (planId) {
    this.MultiSelectPaymentPlan.selectedPlans = this.MultiSelectPaymentPlan.selectedPlans.filter(
        (item) => item.plan.toString() !== planId.toString());
};
project214Schema.methods.clearSelection = function () {
    this.MultiSelectPaymentPlan.selectedPlans = [];
};



//-------------------------------------------Full Implementation Starts Here-------------------------------------------------//
//Pre-save hook to ensure that the projectShortId is generated before saving
project214Schema.pre('save', function (next) {
    if (!this.projectShortId) {
        this.projectShortId = generateCombinedFOREAShortId();
    }
    next();
});

//Pre-save hook to ensure blockID is unique and saved
project214Schema.pre('save', function (next) {
    (this as IProject214Information).projectStructure.forEach(block => {
        if (!block.blockID) {
            block.blockID = generateBlockShortId();
    }
    });
    next();
});
//Pre-save hook to ensure houseID is unique and saved
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        block.houseDetails.forEach(house => {
            if (!house.houseID) {
                house.houseID = generateHouseShortId();
            }
        });
    });
    next();
});
//Pre-save hook to ensure fractionalUnitID is unique and saved
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        block.houseDetails.forEach(house => {
            house.fractionalUnitDetails.forEach(fractionalUnit => {
                if (!fractionalUnit.fractionalUnitID) {
                    fractionalUnit.fractionalUnitID = generatePropertyListingShortId();
                }
            });
        });
    });
    next();
});

//Pre-save hook to set projectCompletionDate
project214Schema.pre('save', function (next) {
    if (this.projectStartDate && this.projectCompletionLengthInMonths) {
        // Calculate the projectCompletionDate
        const completionDate = new Date(this.projectStartDate);
        completionDate.setMonth(completionDate.getMonth() + this.projectCompletionLengthInMonths.valueOf());
        this.projectCompletionDate = completionDate;
    }
    next();
});

//Pre-save hook to increment the propertyCount of the fractionalUnitDetails
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        block.houseDetails.forEach(house => {
            house.fractionalUnitDetails.forEach(fractionalUnit => {
                fractionalUnit.propertyCount = fractionalUnit.propertyCount + 1;
            });
        });
    });
    next();
});

//Pe-save hook to populate the propertyAllocationNumber of the ProjectStructure with values
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        block.houseDetails.forEach(house => {
            house.fractionalUnitDetails.forEach(fractionalUnit => {
                const propertyAllocationNumber = `${this.projectNameAlias}/${block.blockID}/${house.houseID}/${fractionalUnit.fractionalUnitID}`;
                fractionalUnit.propertyAllocationNumber = propertyAllocationNumber;
            });
        });
    });
    next();
});

//Pre-hook to populate the fractionalUnitUniqueIdentifier of the ProjectStructure with values
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        block.houseDetails.forEach(house => {
            house.fractionalUnitDetails.forEach(fractionalUnit => {
                const fractionalUnitUniqueIdentifier = `${block.blockName}-${house.houseName}-${fractionalUnit.fractionalUnitName}`;
                fractionalUnit.fractionalUnitUniqueIdentifier = fractionalUnitUniqueIdentifier;
            });
        });
    });
    next();
});

//Pre-save hook to set selectedPlanName for each selected plan
project214Schema.pre('save', async function (next) {
    try {
        if (this.MultiSelectPaymentPlan.selectedPlans) {
            const selectedPaymentPlan = await PaymentPlanForFractionalOwnership.find({ _id: { $in: this.MultiSelectPaymentPlan.selectedPlans.map(plan => plan.plan) } });
            if (selectedPaymentPlan) {
                this.MultiSelectPaymentPlan.selectedPlans.forEach((selectedPlan) => {
                    const plan = selectedPaymentPlan.find(plan => plan._id.toString() === selectedPlan.plan.toString());
                    if (plan) {
                        selectedPlan.selectedPlanName = plan.paymentPlanName;
                    }
                });
            }
        }
    } catch (err) {
        next(err);
    }
});

// Add a virtual property or method to display the project name in the dropdown
project214Schema.virtual("title").get(function () {
    return this.projectName; // Use projectName or another field as the display name
  });

//Register the Schema as a Model
const Project214Information = mongoose.model<IProject214Information>('Project214Information', project214Schema);
export {Project214Information, IProject214Information,  IMultiSelectPaymentPlan, IFractionalUnit, IHouse, IBlock};
