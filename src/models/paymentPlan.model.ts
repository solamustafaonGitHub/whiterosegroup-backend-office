import mongoose, {Schema, Document, model, Types} from 'mongoose';
import formatCurrency from '../utils/formatCurrency.utils.js';
import {generateCombinedPaymentPlanShortId} from '../utils/generateCombinedPaymentPlanShortId.utils.js';

//Interface for OtherApplicable Flat Fees | Define the Schema for the OtherApplicable Flat Fees
interface IOtherApplicableFlatFees extends Document {
    flatFeeName: string;
    flatFeeDesc: string;
    flatFeeFaceValue: number;
};
const OtherApplicableFlatFeesSchema = new Schema<IOtherApplicableFlatFees>({
    flatFeeName: {type:String, required:true},
    flatFeeDesc: {type:String, required:true},
    flatFeeFaceValue: {type:Number, required:true, default:0} 
});


//Interface for the OtherApplicable Percentage Fees | Define the Schema for the OtherApplicable Percentage Fees
interface IOtherApplicablePercentageFees extends Document {
    percentageFeeName: string;
    percentageFeeDesc: string;
    percentageRate: number;
    percentageFaceValue: number;
};
const OtherApplicablePercentageFeesSchema = new Schema<IOtherApplicablePercentageFees>({
    percentageFeeName: {type:String, required:true},
    percentageFeeDesc: {type:String, required:true},
    percentageRate: {type:Number, required:true, default:0},
    percentageFaceValue: {type:Number}
});


//Interface for the Amortization Schedule | Define  the Schema for the Amortization Schedule
interface IAmortizationSchedule extends Document {
    PaymentNoCount: number;
    PaymentDueDatePerFrequency: Date;
    DuePaymentAmountPerFrequency: number;
    InterestFeesPayablePerFrequency: number;
    OtherFlatFeePayablePerFrequency: number;
    OtherPercentageFeePayablePerFrequency: number;
    TotalPayablePerFrequency: number;
    BalanceToBePaidPerFrequency: number;
};
const AmortizationScheduleSchema = new Schema<IAmortizationSchedule>({
    PaymentNoCount: {type:Number},
    PaymentDueDatePerFrequency: {type:Date},
    DuePaymentAmountPerFrequency: {type:Number},
    InterestFeesPayablePerFrequency: {type:Number},
    OtherFlatFeePayablePerFrequency: {type:Number},
    OtherPercentageFeePayablePerFrequency: {type:Number},
    TotalPayablePerFrequency: {type:Number},
    BalanceToBePaidPerFrequency: {type:Number}
});


//Define the Interface for the main PaymentPlan
interface IPaymentPlan extends Document {
    paymentPlanId: string;
    paymentPlanName: string;
    paymentPlanDescription: string;
    paymentType: string;
    paymentFrequency: string;
    fractionalUnitPropertyAmount: number;
    paymentDurationInMonths: number;
    interestRateIfRequired: number;
    interestFeeAccumulatedFaceValue: number;
    OtherApplicableFlatFees: IOtherApplicableFlatFees[];
    OtherApplicablePercentageFees: IOtherApplicablePercentageFees[];
    AmortizationSchedule: IAmortizationSchedule[];
    createdOn: Date;
    lastUpdatedAt: Date;
};
//Define the Schema for the PaymentPlan Structure
const PaymentPlanSchema = new Schema<IPaymentPlan>({
    paymentPlanId: {type:String, unique:true, default:generateCombinedPaymentPlanShortId},
    paymentPlanName: {type:String, required:true},
    paymentPlanDescription: {type:String, required:true},
    paymentType: {type:String, required:true},
    paymentFrequency: {type:String, required:true},
    fractionalUnitPropertyAmount: {type:Number, required:true, default:0},
    paymentDurationInMonths: {type:Number, required:true},
    interestRateIfRequired: {type:Number, required:true, default:0},
    interestFeeAccumulatedFaceValue: {type:Number, default:0},
    OtherApplicableFlatFees: [OtherApplicableFlatFeesSchema],
    OtherApplicablePercentageFees: [OtherApplicablePercentageFeesSchema],
    AmortizationSchedule: [{
        PaymentNoCount: {type:Number},
        PaymentDueDatePerFrequency: {type:Date},
        DuePaymentAmountPerFrequency: {type:Number},
        InterestFeesPayablePerFrequency: {type:Number},
        OtherFlatFeePayablePerFrequency: {type:Number},
        OtherPercentageFeePayablePerFrequency: {type:Number},
        TotalPayablePerFrequency: {type:Number},
        BalanceToBePaidPerFrequency: {type:Number}
    }],
    createdOn: {type:Date, default:Date.now, required:true},
    lastUpdatedAt: {type:Date, default:Date.now, required:true}
});



//--------------------Pre-save hooks-------------------------------------------------------
//Pre-save hook to ensure that the paymentPlanId is saved 
PaymentPlanSchema.pre('save', function(next){
    if(this.paymentPlanId === null || this.paymentPlanId === undefined){
        this.paymentPlanId = generateCombinedPaymentPlanShortId();
    }
    next();
});

//Pre-save hook to set the interestFeeValue
PaymentPlanSchema.pre('save', function(next){
    if(this.interestRateIfRequired > 0){
        this.interestFeeAccumulatedFaceValue = this.fractionalUnitPropertyAmount * (this.interestRateIfRequired / 100) * (this.paymentDurationInMonths / 12);
    }
    next();
});

//Pre-save hook to set the percentageFaceValue for the OtherApplicablePercentageFees
PaymentPlanSchema.pre('save', function(next){
    if(this.OtherApplicablePercentageFees){
        this.OtherApplicablePercentageFees.forEach((fee) => {
            fee.percentageFaceValue = (this.fractionalUnitPropertyAmount * (fee.percentageRate / 100)/10);
        });
    }
    next();
});

//Pre-save hook to populate the amortizationSchedule array
PaymentPlanSchema.pre('save', function (next) {
    if (!this.fractionalUnitPropertyAmount) {
        return next(new Error("Total Amount To Be Amortized is Required"));
    }

    // Clear AmortizationSchedule array before populating
    this.AmortizationSchedule = [];

    const amortizationDuration = this.paymentDurationInMonths;

    const accumulatedInterestPayable = this.interestFeeAccumulatedFaceValue;
    const accumulatedOtherFlatFeesPayable = this.OtherApplicableFlatFees.reduce((acc, fee) => acc + fee.flatFeeFaceValue, 0);
    const accumulatedOtherPercentageFeePayable = this.OtherApplicablePercentageFees.reduce((acc, fee) => acc + fee.percentageFaceValue, 0);

    const dueAmountPerFrequency = this.fractionalUnitPropertyAmount / this.paymentDurationInMonths;
    const interestPayablePerFrequency = this.interestFeeAccumulatedFaceValue / this.paymentDurationInMonths;
    const otherFlatFeePayablePerFrequency = this.OtherApplicableFlatFees.reduce((acc, fee) => acc + fee.flatFeeFaceValue, 0) / this.paymentDurationInMonths;
    const otherPercentageFeePayablePerFrequency = this.OtherApplicablePercentageFees.reduce((acc, fee) => acc + fee.percentageFaceValue, 0) / this.paymentDurationInMonths;

    const aggregatedPaymentToBeAmortized = this.fractionalUnitPropertyAmount + accumulatedInterestPayable + accumulatedOtherFlatFeesPayable + accumulatedOtherPercentageFeePayable;

    let balanceLeftToBePaid = aggregatedPaymentToBeAmortized; // Initialize the balance

    for (let i = 1; i <= amortizationDuration; i++) {
        const totalPayablePerFrequency = dueAmountPerFrequency + interestPayablePerFrequency + otherFlatFeePayablePerFrequency + otherPercentageFeePayablePerFrequency;

        // Update balanceLeftToBePaid for the current iteration
        balanceLeftToBePaid -= totalPayablePerFrequency;

        // Push the new amortization schedule entry
        this.AmortizationSchedule.push(new (mongoose.model<IAmortizationSchedule>('AmortizationSchedule'))({
            PaymentNoCount: i,
            PaymentDueDatePerFrequency: new Date(new Date().setMonth(new Date().getMonth() + i)),
            DuePaymentAmountPerFrequency: dueAmountPerFrequency,
            InterestFeesPayablePerFrequency: interestPayablePerFrequency,
            OtherFlatFeePayablePerFrequency: otherFlatFeePayablePerFrequency,
            OtherPercentageFeePayablePerFrequency: otherPercentageFeePayablePerFrequency,
            TotalPayablePerFrequency: totalPayablePerFrequency,
            BalanceToBePaidPerFrequency: balanceLeftToBePaid
        }));
    }
    next();
});

//Register the Schemas as a Models
const PaymentPlan = model<IPaymentPlan>('PaymentPlan', PaymentPlanSchema);
const AmortizationSchedule = model<IAmortizationSchedule>('AmortizationSchedule', AmortizationScheduleSchema);
export {PaymentPlan, IPaymentPlan, AmortizationSchedule, IAmortizationSchedule};