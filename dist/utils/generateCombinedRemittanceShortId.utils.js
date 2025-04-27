function generateCombinedRemittanceShortId() {
    const min = 101000001101000;
    const max = 101009999910000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(15, '0');
}
;
console.log('Combined Remittance ID:', generateCombinedRemittanceShortId());
export { generateCombinedRemittanceShortId };
