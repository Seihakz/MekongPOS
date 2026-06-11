import React from 'react';

// This component is rendered to HTML string for printing.
// It is designed to fit an 80mm thermal printer.
export default function Receipt({ sale }) {
  if (!sale) return null;

  return (
    <div style={{
      width: '300px', // Roughly 80mm
      padding: '10px',
      margin: '0 auto',
      fontFamily: 'monospace, sans-serif',
      fontSize: '12px',
      color: '#000',
      background: '#fff',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>MekongPOS</h2>
        <p style={{ margin: '0' }}>123 Main Street, Phnom Penh</p>
        <p style={{ margin: '0' }}>Tel: +855 12 345 678</p>
      </div>

      <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px', paddingBottom: '10px' }}>
        <p style={{ margin: '2px 0' }}>Invoice: #{sale.invoice_no || sale.id}</p>
        <p style={{ margin: '2px 0' }}>Date: {new Date(sale.created_at).toLocaleString()}</p>
        <p style={{ margin: '2px 0' }}>Cashier: {sale.user_id}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '4px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items?.map((item, idx) => (
            <tr key={idx}>
              <td style={{ padding: '4px 0' }}>
                <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product_name}
                </div>
                <div style={{ fontSize: '10px', color: '#555' }}>${parseFloat(item.unit_price).toFixed(2)}</div>
              </td>
              <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '4px 0' }}>${parseFloat(item.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Subtotal:</span>
          <span>${parseFloat(sale.total_amount).toFixed(2)}</span>
        </div>
        {parseFloat(sale.discount_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Discount:</span>
            <span>-${parseFloat(sale.discount_amount).toFixed(2)}</span>
          </div>
        )}
        {parseFloat(sale.tax_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Tax:</span>
            <span>${parseFloat(sale.tax_amount).toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', margin: '8px 0' }}>
          <span>Total USD:</span>
          <span>${parseFloat(sale.final_total).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
          <span>Total KHR:</span>
          <span>៛{(parseFloat(sale.final_total) * 4100).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Paid ({sale.payment_method}):</span>
          <span>${parseFloat(sale.amount_received || sale.final_total).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Change:</span>
          <span>${parseFloat(sale.change_amount || 0).toFixed(2)}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ margin: '0' }}>Thank you for shopping with us!</p>
        <p style={{ margin: '0', fontSize: '10px' }}>Powered by MekongPOS</p>
      </div>
    </div>
  );
}
