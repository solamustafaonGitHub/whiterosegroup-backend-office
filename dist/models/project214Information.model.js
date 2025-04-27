import mongoose, { Schema } from 'mongoose';
import { generateCombinedFOREAShortId } from '../utils/generateCombinedFOREAShortId.utils.js';
import { generateCombinedPropertyID } from '../utils/generateCombinedPropertyID.utils.js';
import { generateBlockShortId } from '../utils/generateBlockShortId.utils.js';
import { generateHouseShortId } from '../utils/generateHouseShortId.utils.js';
import { generatePropertyListingShortId } from '../utils/generatePropertyListingID.utils.js';
import { PaymentPlan } from './paymentPlan.model.js';
;
;
;
;
const project214Schema = new Schema({
    projectShortId: { type: String, default: generateCombinedFOREAShortId, unique: true },
    projectName: { type: String, required: true },
    projectNameAlias: { type: String, required: true },
    projectDescription: { type: String, required: true },
    projectStartDate: { type: Date, required: true },
    projectCompletionLengthInMonths: { type: Number, required: true },
    projectCompletionDate: { type: Date },
    projectCurrentAcquisitionPhase: { type: String, required: true, enum: ['OFF-PLAN PURCHASE', 'UNDER CONSTRUCTION', 'NEWLY COMPLETED', 'READY-FOR-OCCUPANCY (RFO)',
            'PRE-OWNED/RESALE', 'DISTRESSED/FORECLOSURE SALE', 'TURNKEY PROPERTY'] },
    projectStructure: [{
            blockID: { type: String, default: generateBlockShortId, unique: true },
            blockName: { type: String, required: true },
            blockDescription: { type: String, required: true },
            blockSalesPrice: { type: Number, required: true },
            houseDetails: [{
                    houseID: { type: String, default: generateHouseShortId, unique: true },
                    houseName: { type: String, required: true },
                    houseDescription: { type: String, required: true },
                    houseSalesPrice: { type: Number, required: true },
                    fractionalUnitDetails: [{
                            propertyCount: { type: Number, default: 0, unique: true },
                            fractionalUnitID: { type: String, default: generateCombinedPropertyID, unique: true },
                            fractionalUnitName: { type: String, required: true },
                            fractionalUnitDescription: { type: String, required: true },
                            fractionalUnitUniqueIdentifier: { type: String, unique: true },
                            propertyAllocationNumber: { type: String, unique: true },
                            fractionUnitSalesPrice: { type: Number, required: true },
                            fractionalUnitSalesTag: { type: String, required: true, enum: ['Not Yet Subscribed', 'Subscribed'], default: 'Not Yet Subscribed' }
                        }]
                }]
        }],
    MultiSelectPaymentPlan: { selectedPlans: [{
                plan: { type: Schema.Types.ObjectId, ref: 'PaymentPlan' },
                selectedPlanName: { type: String }
            }] },
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now }
});
project214Schema.methods.addPlan = function (PaymentPlanId, PaymentPlanName) {
    const existingPlan = this.MultiSelectPaymentPlan.selectedPlans.find((item) => item.plan.toString() === PaymentPlanId.toString());
    if (!existingPlan) {
        this.MultiSelectPaymentPlan.selectedPlans.push({
            plan: PaymentPlanId,
            selectedPlanName: PaymentPlanName
        });
    }
};
project214Schema.methods.removePlan = function (planId) {
    this.MultiSelectPaymentPlan.selectedPlans = this.MultiSelectPaymentPlan.selectedPlans.filter((item) => item.plan.toString() !== planId.toString());
};
project214Schema.methods.clearSelection = function () {
    this.MultiSelectPaymentPlan.selectedPlans = [];
};
project214Schema.pre('save', function (next) {
    if (!this.projectShortId) {
        this.projectShortId = generateCombinedFOREAShortId();
    }
    next();
});
project214Schema.pre('save', function (next) {
    this.projectStructure.forEach(block => {
        if (!block.blockID) {
            block.blockID = generateBlockShortId();
        }
    });
    next();
});
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
project214Schema.pre('save', function (next) {
    if (this.projectStartDate && this.projectCompletionLengthInMonths) {
        const completionDate = new Date(this.projectStartDate);
        completionDate.setMonth(completionDate.getMonth() + this.projectCompletionLengthInMonths.valueOf());
        this.projectCompletionDate = completionDate;
    }
    next();
});
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
project214Schema.pre('save', async function (next) {
    try {
        if (this.MultiSelectPaymentPlan.selectedPlans) {
            const selectedPaymentPlan = await PaymentPlan.find({ _id: { $in: this.MultiSelectPaymentPlan.selectedPlans.map(plan => plan.plan) } });
            if (selectedPaymentPlan) {
                this.MultiSelectPaymentPlan.selectedPlans.forEach((selectedPlan) => {
                    const plan = selectedPaymentPlan.find(plan => plan._id.toString() === selectedPlan.plan.toString());
                    if (plan) {
                        selectedPlan.selectedPlanName = plan.paymentPlanName;
                    }
                });
            }
        }
    }
    catch (err) {
        next(err);
    }
});
project214Schema.virtual("title").get(function () {
    return this.projectName;
});
const Project214Information = mongoose.model('Project214Information', project214Schema);
export { Project214Information };
