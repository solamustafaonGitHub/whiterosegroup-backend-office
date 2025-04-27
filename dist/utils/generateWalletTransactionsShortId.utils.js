function generateWalletTransactionsShortId() {
    const min = 10002218990000;
    const max = 10009999999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(14, '0');
}
;
console.log('Wallet(NGN | USD | Br.Pounds) Transactions ID:', generateWalletTransactionsShortId());
export default generateWalletTransactionsShortId;
