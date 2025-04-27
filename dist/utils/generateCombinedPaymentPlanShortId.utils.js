function generateCombinedPaymentPlanShortId() {
    const min = 1018001;
    const max = 1100999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
;
console.log('Combined Payment Plan ID:', generateCombinedPaymentPlanShortId());
export { generateCombinedPaymentPlanShortId };
