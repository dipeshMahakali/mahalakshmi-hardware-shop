/**
 * Formats a numeric or string value as Indian Rupee (INR) currency.
 * @param {number|string} amount
 * @param {boolean} showDecimals
 * @returns {string} e.g. "₹2,450" or "₹2,450.00"
 */
export function formatINR(amount, showDecimals = false) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  }).format(num);
}

/**
 * Compact Indian number formatting (e.g., 25.5K, 1.2L, 3Cr)
 * @param {number|string} amount 
 * @returns {string}
 */
export function formatCompactINR(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return formatINR(num);
}

