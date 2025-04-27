import { Schema, model } from 'mongoose';
const selectedProject214FractionalUnitsSchema = new Schema({
    projectShortId: { type: String, required: true },
    fractionalUnitID: { type: String, required: true, unique: true },
    subscribeP214OrderId: { type: String, required: true },
});
const SelectedProject214FractionalUnits = model('SelectedProject214FractionalUnit', selectedProject214FractionalUnitsSchema);
export default SelectedProject214FractionalUnits;
