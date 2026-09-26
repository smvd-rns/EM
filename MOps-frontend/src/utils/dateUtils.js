/**
 * Centralized utility for formatting dates across the application.
 */

/**
 * Formats a given date object or string into strictly DD/MM/YYYY format.
 * Defaults to current date if parsing fails.
 *
 * @param {Date|string|number} dateInput - The date to format
 * @returns {string} Formatted date string (e.g., 23/10/2026)
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'N/A';
    }
};
