import mongoose, {Schema, Document, model, Types} from 'mongoose';

const selectedProject214FractionalUnitsSchema = new Schema({
    projectShortId: {type:String, required:true},
    fractionalUnitID: {type:String, required:true, unique:true},
    subscribeP214OrderId: {type:String, required:true},
});

//Register the schema as a model
const SelectedProject214FractionalUnits = model('SelectedProject214FractionalUnit', selectedProject214FractionalUnitsSchema);
export default SelectedProject214FractionalUnits;