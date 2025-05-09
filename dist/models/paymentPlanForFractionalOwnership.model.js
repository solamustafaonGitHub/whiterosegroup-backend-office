import mongoose, { Schema, model } from 'mongoose';
import { generateCombinedPaymentPlanShortId } from '../utils/generateCombinedPaymentPlanShortId.utils.js';
;
const OtherApplicableFlatFeesSchema = new Schema({
    flatFeeName: { type: String, required: true },
    flatFeeDesc: { type: String, required: true },
    flatFeeFaceValue: { type: Number, required: true, default: 0 }
});
;
const OtherApplicablePercentageFeesSchema = new Schema({
    percentageFeeName: { type: String, required: true },
    percentageFeeDesc: { type: String, required: true },
    percentageRate: { type: Number, required: true, default: 0 },
    percentageFaceValue: { type: Number }
});
;
const AmortizationScheduleSchema = new Schema({
    PaymentNoCount: { type: Number },
    PaymentDueDatePerFrequency: { type: Date },
    DuePaymentAmountPerFrequency: { type: Number },
    InterestFeesPayablePerFrequency: { type: Number },
    OtherFlatFeePayablePerFrequency: { type: Number },
    OtherPercentageFeePayablePerFrequency: { type: Number },
    TotalPayablePerFrequency: { type: Number },
    BalanceToBePaidPerFrequency: { type: Number }
});
;
const PaymentPlanForFractionalOwnershipSchema = new Schema({
    paymentPlanName: { type: String, required: true },
    paymentPlanDescription: { type: String, required: true },
    paymentType: { type: String, required: true },
    paymentFrequency: { type: String, required: true },
    fractionalUnitPropertyAmount: { type: Number, required: true, default: 0 },
    paymentDurationInMonths: { type: Number, required: true },
    interestRateIfRequired: { type: Number, required: true, default: 0 },
    interestFeeAccumulatedFaceValue: { type: Number, default: 0 },
    OtherApplicableFlatFees: [OtherApplicableFlatFeesSchema],
    OtherApplicablePercentageFees: [OtherApplicablePercentageFeesSchema],
    AmortizationSchedule: [{
            PaymentNoCount: { type: Number },
            PaymentDueDatePerFrequency: { type: Date },
            DuePaymentAmountPerFrequency: { type: Number },
            InterestFeesPayablePerFrequency: { type: Number },
            OtherFlatFeePayablePerFrequency: { type: Number },
            OtherPercentageFeePayablePerFrequency: { type: Number },
            TotalPayablePerFrequency: { type: Number },
            BalanceToBePaidPerFrequency: { type: Number }
        }],
    paymentPlanId: { type: String, unique: true, default: generateCombinedPaymentPlanShortId },
    createdOn: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
PaymentPlanForFractionalOwnershipSchema.pre('save', function (next) {
    if (this.paymentPlanId === null || this.paymentPlanId === undefined) {
        this.paymentPlanId = generateCombinedPaymentPlanShortId();
    }
    next();
});
PaymentPlanForFractionalOwnershipSchema.pre('save', function (next) {
    if (this.interestRateIfRequired > 0) {
        this.interestFeeAccumulatedFaceValue = this.fractionalUnitPropertyAmount * (this.interestRateIfRequired / 100) * (this.paymentDurationInMonths / 12);
    }
    next();
});
PaymentPlanForFractionalOwnershipSchema.pre('save', function (next) {
    if (this.OtherApplicablePercentageFees) {
        this.OtherApplicablePercentageFees.forEach((fee) => {
            fee.percentageFaceValue = (this.fractionalUnitPropertyAmount * (fee.percentageRate / 100) / 10);
        });
    }
    next();
});
PaymentPlanForFractionalOwnershipSchema.pre('save', function (next) {
    if (!this.fractionalUnitPropertyAmount) {
        return next(new Error("Total Amount To Be Amortized is Required"));
    }
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
    let balanceLeftToBePaid = aggregatedPaymentToBeAmortized;
    for (let i = 1; i <= amortizationDuration; i++) {
        const totalPayablePerFrequency = dueAmountPerFrequency + interestPayablePerFrequency + otherFlatFeePayablePerFrequency + otherPercentageFeePayablePerFrequency;
        balanceLeftToBePaid -= totalPayablePerFrequency;
        this.AmortizationSchedule.push(new (mongoose.model('AmortizationSchedule'))({
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
const PaymentPlanForFractionalOwnership = model('PaymentPlanForFractionalOwnership', PaymentPlanForFractionalOwnershipSchema);
const AmortizationSchedule = model('AmortizationSchedule', AmortizationScheduleSchema);
export { PaymentPlanForFractionalOwnership, AmortizationSchedule };
