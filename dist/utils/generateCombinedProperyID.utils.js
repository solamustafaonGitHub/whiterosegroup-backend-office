function generateCombinedPropertyID() {
    const min = 5388001;
    const max = 9999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
;
console.log(generateCombinedPropertyID());
export { generateCombinedPropertyID };
