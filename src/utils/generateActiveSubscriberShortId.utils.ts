//Function to generate a 7-digit short ID starting from 4101000
function generateActiveSubscriberShortId(): string {
    const min: number = 4101000;
    const max: number = 7999998; // Maximum value for a 7-digit number starting from 4101000
    const randomId: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(7, '0'); // Ensure the ID is 7 digits long
};

console.log('Active Subscriber ID:', generateActiveSubscriberShortId());
export default generateActiveSubscriberShortId;