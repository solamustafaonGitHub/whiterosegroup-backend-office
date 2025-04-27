function generateCombinedShortId() {
    const min = 10002000100;
    const max = 99999100000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(11, '0');
}
;
console.log(generateCombinedShortId());
export default generateCombinedShortId;
