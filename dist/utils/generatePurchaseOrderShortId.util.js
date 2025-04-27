function generatePOrderShortId() {
    const min = 1000200010;
    const max = 9999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10, '0');
}
;
console.log(generatePOrderShortId());
export default generatePOrderShortId;
