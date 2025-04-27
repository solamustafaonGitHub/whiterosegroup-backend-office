import {SchemeInformation} from '../models/schemeInformationProfile.model.js';

const testScheme = new SchemeInformation({
    schemeID: 'testID123',
    schemeName: 'Test Scheme',
});
await testScheme.save();
console.log('Test Scheme saved:', testScheme);
