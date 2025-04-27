export function generateUserSchemeShortId() {
    const min = 40004000100;
    const max = 99999100000;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString().padStart(11, '0');
}
;
console.log(generateUserSchemeShortId());
export default generateUserSchemeShortId;
