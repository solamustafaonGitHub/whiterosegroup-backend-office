  //Helper Function to Format Date & Time
  function formatDateTime(date:any): string {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString() + '\n' + date.toLocaleTimeString();
};

export default formatDateTime;