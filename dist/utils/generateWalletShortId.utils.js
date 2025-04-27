function generateWalletShortId() {
    const min = 2218990000;
    const max = 2218999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(10, '0');
}
;
console.log('Wallet ID:', generateWalletShortId());
export default generateWalletShortId;
