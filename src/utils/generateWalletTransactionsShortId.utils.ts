import mongoose, {Schema, model, Document, Model, Types} from 'mongoose';

// Function to generate a 4-digit short ID
function generateWalletTransactionsShortId(): string {
    const min = 10002218990000;
    const max = 10009999999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(14,'0');
};

//Exporting the function
console.log('Wallet(NGN | USD | Br.Pounds) Transactions ID:', generateWalletTransactionsShortId());
export default generateWalletTransactionsShortId;