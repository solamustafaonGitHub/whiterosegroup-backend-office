
import mongoose, {model,Schema,Types} from 'mongoose';

// Function to generate a 4-digit short ID starting from 1001
function generateECommerceProfilingShortId(): string {
    const min: number = 1;
    const max: number = 999; // Maximum value for the 3-digit number starting from 1001
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(3,'0'); // Ensure the ID is 3 digits long
}

//define the interface for the eCommerceProfile model which is an array of objects
interface IECommerceProfileItem {
    itemAvailability: {type:String, enum:['IN-STOCK/AVAILABLE','OUT-OF-STOCK', 'BACKORDER', 'DISCONTINUED', 'OTHERS'], required:true};
    itemPricingValue: {type:String, enum:['BUDGET/VALUE', 'MID-RANGE', 'HIGH-END', 'OTHERS'], required:true};
    itemProductLifeCycle: {type:String, enum:['BEST SELLERS','CLEARANCE/SALE', 'SEASONAL', 'OTHERS'], required:true};
    itemCustomization: {type:String, enum:['STANDARD','PERSONALIZED', 'MADE-TO-ORDER', 'OTHERS'], required:true};
    itemSustainability: {type:String, enum:['ECO-FRIENDLY/SUSTAINABLE', 'ORGANIC', 'FAIR-TRADE', 'OTHERS'], required:true};
    itemAttributes: {type:String, enum:['COLOR', 'SIZE', 'STYLE', 'MATERIAL', 'OTHERS'], required:true};
    itemOtherAttrbutes: {type:String, enum:['STANDARD','EXCLUSIVE', 'LIMITED EDITION', 'REFURBISHED', 'OPEN-BOX','OTHERS'], required:true};
};

interface IECommerceProfile {
    eCommerceProfileId: String;
    eCommerceProfileName: {type:String, required:true};
    itemProfiling: IECommerceProfileItem;
    createdAt: {type:Date, default:Date};
    lastUpdatedAt: {type:Date, default:Date};
};

const eCommerceProfileSchema = new Schema<IECommerceProfile>({
    eCommerceProfileId: {type:String, default:generateECommerceProfilingShortId},
    eCommerceProfileName: {type:String, required:true},
    itemProfiling: {
        itemAvailability: {type:String, enum:['IN-STOCK/AVAILABLE','OUT-OF-STOCK', 'BACKORDER', 'DISCONTINUED', 'OTHERS'], required:true},
        itemPricingValue: {type:String, enum:['BUDGET/VALUE', 'MID-RANGE', 'HIGH-END', 'OTHERS'], required:true},
        itemProductLifeCycle: {type:String, enum:['BEST SELLERS','CLEARANCE/SALE', 'SEASONAL', 'OTHERS'], required:true},
        itemCustomization: {type:String, enum:['STANDARD','PERSONALIZED', 'MADE-TO-ORDER', 'OTHERS'], required:true},
        itemSustainability: {type:String, enum:['ECO-FRIENDLY/SUSTAINABLE', 'ORGANIC', 'FAIR-TRADE', 'OTHERS'], required:true},
        itemAttributes: {type:String, enum:['COLOR', 'SIZE', 'STYLE', 'MATERIAL', 'OTHERS'], required:true},
        itemOtherAttrbutes: {type:String, enum:['STANDARD','EXCLUSIVE', 'LIMITED EDITION', 'REFURBISHED', 'OPEN-BOX','OTHERS'], required:true},
    },
    createdAt: {type:Date, default:Date},
    lastUpdatedAt: {type:Date, default:Date},
});

//Pre-Save Hook to ensure eCommerceProfileId is generated before saving
eCommerceProfileSchema.pre<IECommerceProfile>('save', function(next) {
    if (!this.eCommerceProfileId) {
        this.eCommerceProfileId = generateECommerceProfilingShortId(); // Ensure eCommerceProfileId is generated if missing
    }
    next();
});

//create the model for the eCommerceProfile
const ECommerceProfile = model<IECommerceProfile>('ECommerceProfile', eCommerceProfileSchema);
export {ECommerceProfile, IECommerceProfile, IECommerceProfileItem};