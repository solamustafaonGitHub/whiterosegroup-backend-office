function generatePropertyListingShortId() {
    const min = 600250;
    const max = 799999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
}
;
console.log('Combined Property Listing ID:', generatePropertyListingShortId());
export { generatePropertyListingShortId };
