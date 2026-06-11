/**
 * Generate HTML receipt for 80mm thermal printer
 * @param {Object} sale - Sale record
 * @param {Array} items - Sale items array
 * @param {Object} settings - Settings key-value object
 * @returns {string} HTML string
 */
const generateReceipt = (sale, items, settings) => {
  const escapeHtml = (str) => {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const shopName = escapeHtml(settings.shop_name || 'MekongPOS');
  const shopAddress = escapeHtml(settings.shop_address || '');
  const shopPhone = escapeHtml(settings.shop_phone || '');
  const footerMsg = escapeHtml(settings.receipt_footer || 'Thank you for shopping with us!');
  const exchangeRate = parseFloat(settings.exchange_rate) || 4100;

  const formatUSD = (amount) => `$${parseFloat(amount).toFixed(2)}`;
  const formatKHR = (amount) => `${Math.round(parseFloat(amount) * exchangeRate).toLocaleString()} ៛`;

  const saleDate = new Date(sale.created_at);
  const dateStr = saleDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const timeStr = saleDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const separator = '<tr><td colspan="4" style="border-bottom: 1px dashed #000; padding: 4px 0;"></td></tr>';

  let itemsHtml = '';
  items.forEach((item) => {
    itemsHtml += `
      <tr>
        <td colspan="4" style="padding: 2px 0 0 0; font-size: 12px;">${escapeHtml(item.product_name)}</td>
      </tr>
      <tr>
        <td style="padding: 0 0 2px 8px; font-size: 11px; color: #555;">${item.qty} x ${formatUSD(item.unit_price)}</td>
        <td></td>
        <td></td>
        <td style="text-align: right; padding: 0 0 2px 0; font-size: 12px;">${formatUSD(item.total)}</td>
      </tr>`;
  });

  const discountHtml = parseFloat(sale.discount_amount) > 0
    ? `<tr>
         <td colspan="3" style="padding: 2px 0; font-size: 12px;">Discount${sale.discount_type === 'percentage' ? ` (${sale.discount_value}%)` : ''}:</td>
         <td style="text-align: right; font-size: 12px;">-${formatUSD(sale.discount_amount)}</td>
       </tr>`
    : '';

  const taxHtml = parseFloat(sale.tax_amount) > 0
    ? `<tr>
         <td colspan="3" style="padding: 2px 0; font-size: 12px;">Tax (${sale.tax_rate}%):</td>
         <td style="text-align: right; font-size: 12px;">${formatUSD(sale.tax_amount)}</td>
       </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${escapeHtml(sale.invoice_number)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      font-family: 'Courier New', monospace;
      width: 302px;
      margin: 0 auto;
      padding: 8px;
      font-size: 12px;
      color: #000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .shop-name {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin: 4px 0;
    }
    .shop-info {
      text-align: center;
      font-size: 11px;
      color: #333;
      margin: 2px 0;
    }
    .total-row td {
      font-size: 16px;
      font-weight: bold;
      padding: 6px 0;
    }
    .khr-row td {
      font-size: 13px;
      color: #333;
      padding: 2px 0;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      margin-top: 10px;
      color: #555;
    }
    @media print {
      body { width: 302px; }
    }
  </style>
</head>
<body>
  <div class="shop-name">${shopName}</div>
  <div class="shop-info">${shopAddress}</div>
  <div class="shop-info">Tel: ${shopPhone}</div>

  <table>
    ${separator}
    <tr>
      <td colspan="2" style="padding: 3px 0; font-size: 11px;">Invoice: ${escapeHtml(sale.invoice_number)}</td>
      <td colspan="2" style="text-align: right; padding: 3px 0; font-size: 11px;">${dateStr}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 0 0 3px 0; font-size: 11px;">Cashier: ${escapeHtml(sale.cashier_name || 'N/A')}</td>
      <td colspan="2" style="text-align: right; padding: 0 0 3px 0; font-size: 11px;">${timeStr}</td>
    </tr>
    ${sale.customer_name ? `<tr><td colspan="4" style="padding: 0 0 3px 0; font-size: 11px;">Customer: ${escapeHtml(sale.customer_name)}</td></tr>` : ''}
    ${separator}

    <tr style="font-weight: bold; font-size: 12px;">
      <td style="padding: 4px 0;">Item</td>
      <td></td>
      <td></td>
      <td style="text-align: right; padding: 4px 0;">Amount</td>
    </tr>
    ${separator}

    ${itemsHtml}

    ${separator}

    <tr>
      <td colspan="3" style="padding: 2px 0; font-size: 12px;">Subtotal:</td>
      <td style="text-align: right; font-size: 12px;">${formatUSD(sale.subtotal)}</td>
    </tr>
    ${discountHtml}
    ${taxHtml}

    ${separator}

    <tr class="total-row">
      <td colspan="3">TOTAL:</td>
      <td style="text-align: right;">${formatUSD(sale.total_amount)}</td>
    </tr>
    <tr class="khr-row">
      <td colspan="3"></td>
      <td style="text-align: right;">${formatKHR(sale.total_amount)}</td>
    </tr>

    ${separator}

    <tr>
      <td colspan="3" style="padding: 2px 0; font-size: 12px;">Paid (${sale.payment_method}):</td>
      <td style="text-align: right; font-size: 12px;">${formatUSD(sale.amount_paid)}</td>
    </tr>
    <tr>
      <td colspan="3" style="padding: 2px 0; font-size: 12px;">Change:</td>
      <td style="text-align: right; font-size: 12px;">${formatUSD(sale.change_amount)}</td>
    </tr>
    <tr class="khr-row">
      <td colspan="3">Change (KHR):</td>
      <td style="text-align: right;">${formatKHR(sale.change_amount)}</td>
    </tr>

    ${separator}
  </table>

  <div class="footer">
    <p>${footerMsg}</p>
    <p style="font-size: 10px; margin-top: 4px;">Exchange Rate: 1 USD = ${exchangeRate.toLocaleString()} KHR</p>
  </div>
</body>
</html>`;

  return html;
};

module.exports = { generateReceipt };
