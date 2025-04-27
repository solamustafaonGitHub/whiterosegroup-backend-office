import mongoose, { Schema } from 'mongoose';
;
const UnitOfMeasureSchema = new Schema({
    unitMeaseureName: { type: String, required: true, require: true },
    unitMeasureShortDesc: String,
    createdAt: { type: Date, default: Date.now, required: true },
    lastUpdatedAt: { type: Date, default: Date.now, required: true }
});
const UOM = mongoose.model('UOM', UnitOfMeasureSchema);
export { UOM };
