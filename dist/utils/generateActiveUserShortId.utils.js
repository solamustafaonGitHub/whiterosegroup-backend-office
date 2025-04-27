function generateActiveUserShortId() {
    const min = 4101000;
    const max = 7999998;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0');
}
console.log('Active Subscriber ID:', generateActiveUserShortId());
export default generateActiveUserShortId;
