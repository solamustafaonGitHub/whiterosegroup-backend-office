function generateHouseShortId() {
    const min = 2001;
    const max = 2999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
;
console.log('Combined FOREA-House ID:', generateHouseShortId());
export { generateHouseShortId };
