function formatDateTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString() + '\n' + date.toLocaleTimeString();
}
;
export default formatDateTime;
