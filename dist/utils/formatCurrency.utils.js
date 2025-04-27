const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const formattedValue = formatter.format(Math.abs(value));
    return value < 0 ? `(${formattedValue})` : formattedValue;
};
export default formatCurrency;
