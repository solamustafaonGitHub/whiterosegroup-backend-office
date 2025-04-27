function generateUOMShortId() {
    const min = 1010;
    const max = 9999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(4, '0');
}
;
console.log('UOM ID:', generateUOMShortId());
export { generateUOMShortId };
