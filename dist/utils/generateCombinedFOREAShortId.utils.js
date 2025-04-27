function generateCombinedFOREAShortId() {
    const min = 700500;
    const max = 999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(6, '0');
}
;
console.log('Combined FOREA-Project ID:', generateCombinedFOREAShortId());
export { generateCombinedFOREAShortId };
