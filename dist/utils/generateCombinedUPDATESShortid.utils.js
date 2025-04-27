function generateUpdateItemPriceShortId() {
    const min = 70000300;
    const max = 99999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(8, '0');
}
;
console.log('Combined UPDATES ShortID:', generateUpdateItemPriceShortId());
export { generateUpdateItemPriceShortId };
