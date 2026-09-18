/**
 * Generates a direct WhatsApp link with encoded message.
 * @param {string} phone
 * @param {string} message
 * @returns {string}
 */
export function buildWhatsAppLink(phone = '919526162225', message = '') {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || '919526162225';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds quotation message for a product
 */
export function formatProductQuoteMessage(product, quantity = 1, note = '') {
  return `Hello Shri Mahalakshmi Trader! 👋\n\nI would like to inquire about the following product:\n- Product: ${product.name}\n- SKU: ${product.sku || 'N/A'}\n- Quantity: ${quantity} ${product.unit || 'pcs'}\n${product.price ? `- Estimated Price: ₹${product.price}` : ''}\n${note ? `- Special Requirement: ${note}\n` : ''}\nPlease share availability and commercial quote.`;
}

/**
 * Builds visualizer combination message
 */
export function formatVisualizerQuoteMessage(doorType, laminate, handle) {
  return `Hello Shri Mahalakshmi Trader! 👋\n\nI am interested in this Door & Hardware Combination from your Visualizer:\n- Door Type: ${doorType}\n- Laminate Finish: ${laminate.name} (${laminate.texture})\n- Handle Style: ${handle.name} (${handle.style})\n\nPlease share price, stock availability, and installation details.`;
}

/**
 * Builds homeowner estimate summary for carpenters
 */
export function formatCarpenterEstimateMessage(project, items = []) {
  const itemsText = items.map(item => `- ${item.name}: ${item.quantity} ${item.unit || 'pcs'}`).join('\n');
  return `Hello ${project.homeowner_name || 'Sir'}! 👋\n\nHere is the material estimate summary for your project (${project.name}):\n${itemsText || '- Material list attached'}\n\nMaterials supplied by Shri Mahalakshmi Trader, Bagbahara.`;
}

