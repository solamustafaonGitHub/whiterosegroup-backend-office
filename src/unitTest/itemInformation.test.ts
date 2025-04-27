const ItemInformation = require('./path/to/ItemInformation.model');

// Example document creation
const item = new ItemInformation({
  itemInformationID: '12345',
  itemInformationCode: 'ITEM001',
  itemInformationName: 'Test Item',
  itemInformationCategory: '644e71dbdd8e4b06f4e9b7c4',
  itemInformationBrand: '644e71dbdd8e4b06f4e9b7c5',
  itemInformationType: '644e71dbdd8e4b06f4e9b7c6',
  itemInformationSubType: '644e71dbdd8e4b06f4e9b7c7',
  itemInformationDescription: 'This is a test item.',
  itemInformationECommerceProfile: '644e71dbdd8e4b06f4e9b7c8',
  itemInformationECommerceProfileName: 'Test E-Commerce',
  itemInformationCurrentMktPrice: 12500.75,
  itemInformationClassification: 'STANDARD',
});

console.log(item.itemInformationMktStartPrice); // Expected Output: ₦12,500.75
