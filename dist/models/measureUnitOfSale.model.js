import mongoose, { Schema } from 'mongoose';
;
const UnitOfMeasureSchema = new Schema({
    unitMeaseureName: { type: String, required: true },
    unitMeasureShortDesc: String,
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
const UnitOfMeasure = mongoose.model('UnitOfMeasure', UnitOfMeasureSchema);
export { UnitOfMeasure };
