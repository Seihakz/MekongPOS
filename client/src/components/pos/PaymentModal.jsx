import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheckCircle, FiCreditCard, FiSmartphone, FiX, FiPrinter, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { saleAPI } from '../../services/api';
import { printReceiptHtml } from '../../utils/printReceipt';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { total, totalKHR, exchangeRate, items, subtotal, discountType, discountValue, discountAmount, taxAmount, clearCart, setDiscount } = useCart();
  const [localDiscountType, setLocalDiscountType] = useState('percentage');
  const [localDiscountValue, setLocalDiscountValue] = useState('');
  const [receivedAmountUSD, setReceivedAmountUSD] = useState('');
  const [receivedAmountKHR, setReceivedAmountKHR] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('checkout'); // 'checkout' or 'receipt'
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setReceivedAmountUSD('');
      setReceivedAmountKHR('');
      setPaymentMethod('cash');
      setView('checkout');
      setCompletedSale(null);
      setLocalDiscountType(discountType || 'percentage');
      setLocalDiscountValue(discountValue ? discountValue.toString() : '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const usdPaid = parseFloat(receivedAmountUSD) || 0;
  const khrPaid = parseFloat(receivedAmountKHR) || 0;
  const totalReceivedInUSD = usdPaid + (khrPaid / exchangeRate);
  const changeUSD = Math.max(0, totalReceivedInUSD - total);
  const changeKHR = Math.round(changeUSD * exchangeRate);
  const remainingDue = Math.max(0, total - totalReceivedInUSD);
  const remainingKHR = Math.round(remainingDue * exchangeRate);
  const isEnough = totalReceivedInUSD >= total - 0.01;
  const isCash = paymentMethod === 'cash';

  const handleQuickUSD = (amt) => {
    setReceivedAmountUSD(prev => {
      const current = parseFloat(prev) || 0;
      return (current + amt).toString();
    });
  };

  const handleQuickKHR = (amt) => {
    setReceivedAmountKHR(prev => {
      const current = parseFloat(prev) || 0;
      return (current + amt).toString();
    });
  };

  const handlePayment = async () => {
    if (isCash && !isEnough) {
      toast.error(t('insufficientAmount'));
      return;
    }
    setLoading(true);
    try {
      // Map UI payment methods to backend-valid values
      const methodMap = { cash: 'cash', card: 'card', aba: 'qr', wing: 'other' };
      const saleData = {
        customer_id: null,
        discount_type: discountType === 'percentage' ? 'percentage' : 'fixed',
        discount_value: discountValue || 0,
        payment_method: methodMap[paymentMethod] || 'cash',
        amount_paid: isCash ? totalReceivedInUSD : total,
        items: items.map(item => ({
          product_id: item.id,
          qty: item.qty,
          unit_price: item.sell_price,
        }))
      };
      const res = await saleAPI.create(saleData);
      const sale = res.data.data;
      setCompletedSale(sale);
      setView('receipt');
      clearCart();
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!completedSale) return;
    const receiptHtml = buildReceiptHtml(completedSale);
    printReceiptHtml(receiptHtml);
  };

  const handleNewSale = () => {
    onClose();
  };

  const buildReceiptHtml = (sale) => {
    const itemsHtml = (sale.items || []).map(item => `
      <tr>
        <td style="padding:3px 0;text-align:left;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.product_name}</td>
        <td style="padding:3px 0;text-align:center">${item.qty}</td>
        <td style="padding:3px 0;text-align:right">$${parseFloat(item.unit_price).toFixed(2)}</td>
        <td style="padding:3px 0;text-align:right">$${parseFloat(item.total).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="width:300px;padding:10px;margin:0 auto;font-family:'Courier New',monospace;font-size:12px;color:#000;background:#fff">
        <div style="text-align:center;margin-bottom:12px">
          <h2 style="margin:0;font-size:18px;letter-spacing:2px">MEKONGPOS</h2>
          <p style="margin:4px 0;font-size:11px">Phnom Penh, Cambodia</p>
          <p style="margin:4px 0;font-size:11px">Tel: +855 12 345 678</p>
        </div>
        <div style="text-align:center;border-top:1px dashed #000;border-bottom:1px dashed #000;padding:8px 0;margin-bottom:8px">
          <strong>សន្និកវិក្កយបត្រ / RECEIPT</strong>
        </div>
        <div style="margin-bottom:8px;font-size:11px">
          <div style="display:flex;justify-content:space-between"><span>Invoice No:</span><span>${sale.invoice_number || 'INV-' + sale.id}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Date/Time:</span><span>${new Date(sale.created_at).toLocaleString()}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Cashier:</span><span>${user?.full_name || 'Cashier'}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Pay Method:</span><span>${(sale.payment_method || 'CASH').toUpperCase()}</span></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 0">
          <thead><tr style="border-bottom:1px dashed #000">
            <th style="text-align:left;padding:4px 0">Item</th>
            <th style="text-align:center;padding:4px 0">Qty</th>
            <th style="text-align:right;padding:4px 0">Price</th>
            <th style="text-align:right;padding:4px 0">Amount</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top:1px dashed #000;padding-top:8px;margin-top:4px;font-size:11px">
          <div style="display:flex;justify-content:space-between"><span>Subtotal:</span><span>$${parseFloat(sale.total_amount).toFixed(2)}</span></div>
          ${parseFloat(sale.discount_amount) > 0 ? `<div style="display:flex;justify-content:space-between"><span>Discount:</span><span>-$${parseFloat(sale.discount_amount).toFixed(2)}</span></div>` : ''}
          ${parseFloat(sale.tax_amount) > 0 ? `<div style="display:flex;justify-content:space-between"><span>Tax:</span><span>$${parseFloat(sale.tax_amount).toFixed(2)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:bold;margin:6px 0"><span>Total USD:</span><span>$${parseFloat(sale.total_amount).toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:bold"><span>Total KHR:</span><span>៛${Math.round(parseFloat(sale.total_amount) * exchangeRate).toLocaleString()}</span></div>
        </div>
        <div style="border-top:1px dashed #000;padding-top:8px;margin-top:8px;font-size:11px">
          <div style="display:flex;justify-content:space-between"><span>Paid:</span><span>$${parseFloat(sale.amount_paid || sale.total_amount).toFixed(2)}</span></div>
          <div style="display:flex;justify-content:space-between"><span>Change:</span><span>$${parseFloat(sale.change_amount || 0).toFixed(2)}</span></div>
        </div>
        <div style="text-align:center;margin-top:16px;border-top:1px dashed #000;padding-top:8px">
          <p style="margin:0;font-size:11px">Thank you for your purchase!</p>
          <p style="margin:2px 0;font-size:11px">សូមអរគុណសម្រាប់ការទិញ!</p>
          <p style="margin:4px 0;font-size:10px;color:#888">Powered by MekongPOS</p>
        </div>
      </div>
    `;
  };

  // ─── RECEIPT VIEW ───
  if (view === 'receipt' && completedSale) {
    const sale = completedSale;
    return (
      <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)' }}>
        <div className="modal" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
          {/* Success Header */}
          <div style={{ textAlign: 'center', padding: '32px 24px 16px', background: 'var(--bg-secondary)' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <FiPrinter size={28} color="#fff" />
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700 }}>
              Transaction Finalized!
            </h2>
            <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Invoice #{sale.invoice_number || `INV-${sale.id}`}
            </p>
          </div>

          {/* Receipt Preview */}
          <div style={{ padding: '16px 24px', maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{
              background: '#fff', color: '#000', borderRadius: '8px',
              padding: '20px 16px', fontFamily: "'Courier New', monospace", fontSize: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb'
            }}>
              {/* Shop Header */}
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', letterSpacing: '2px', fontWeight: 800 }}>MEKONGPOS</h3>
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>Phnom Penh, Cambodia</p>
                <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>Tel: +855 12 345 678</p>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', textAlign: 'center', padding: '6px 0', margin: '8px 0', fontWeight: 700, fontSize: '11px' }}>
                សន្និកវិក្កយបត្រ / RECEIPT
              </div>

              {/* Invoice Details */}
              <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Invoice No:</span><span style={{ fontWeight: 600 }}>{sale.invoice_number || `INV-${sale.id}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Date/Time:</span><span>{new Date(sale.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Cashier:</span><span>{user?.full_name || 'Cashier'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Pay Method:</span><span>{(sale.payment_method || 'CASH').toUpperCase()}</span>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderTop: '1px dashed #ccc' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #ccc' }}>
                    <th style={{ textAlign: 'left', padding: '5px 0', fontWeight: 700 }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '5px 0', fontWeight: 700 }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '5px 0', fontWeight: 700 }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '5px 0', fontWeight: 700 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '4px 0', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</td>
                      <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty || item.qty}</td>
                      <td style={{ textAlign: 'right', padding: '4px 0' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '4px 0' }}>${parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', marginTop: '4px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Subtotal:</span><span>${parseFloat(sale.total_amount).toFixed(2)}</span>
                </div>
                {parseFloat(sale.discount_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Discount:</span><span>-${parseFloat(sale.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(sale.tax_amount) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Tax:</span><span>${parseFloat(sale.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '13px', margin: '6px 0 2px' }}>
                  <span>Total:</span><span>${parseFloat(sale.total_amount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '12px', color: '#555' }}>
                  <span>KHR:</span><span>៛{Math.round(parseFloat(sale.total_amount) * exchangeRate).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ borderTop: '1px dashed #ccc', paddingTop: '6px', marginTop: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Paid:</span><span>${parseFloat(sale.amount_paid || sale.total_amount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: 700 }}>
                  <span>Change:</span><span>${parseFloat(sale.change_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: '12px', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                <p style={{ margin: '0', fontSize: '10px' }}>Thank you for your purchase!</p>
                <p style={{ margin: '2px 0', fontSize: '10px' }}>សូមអរគុណសម្រាប់ការទិញ!</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px', padding: '14px' }}
              onClick={handlePrintReceipt}
            >
              <FiPrinter size={18} />
              {t('printReceipt')}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px', padding: '14px' }}
              onClick={handleNewSale}
            >
              <FiRefreshCw size={18} />
              {t('newSale')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CHECKOUT VIEW ───
  const paymentMethods = [
    { id: 'cash', label: language === 'km' ? 'លុយសុទ្ធ' : 'Cash', icon: <FiDollarSign size={16} /> },
    { id: 'card', label: language === 'km' ? 'កាតទូទាត់' : 'Card Payment', icon: <FiCreditCard size={16} /> },
  ];

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)' }}>
      <div className="modal" style={{ maxWidth: '820px', width: '95vw', borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiDollarSign style={{ color: 'var(--primary)' }} />
            {language === 'km' ? 'ម៉ាស៊ីនទូទាត់ប្រាក់' : 'Transaction Checkout'}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.875rem',
              color: 'var(--text-primary)', fontWeight: 500
            }}
          >
            {t('cancel')}
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0', minHeight: '420px' }}>
          {/* ─── LEFT COLUMN ─── */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid var(--border)' }}>
            {/* Total Payable */}
            <div style={{
              padding: '20px', borderRadius: '12px', border: '1px solid var(--border)',
              background: 'var(--bg-input)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>
                {language === 'km' ? 'ទឹកប្រាក់សរុបទូទាត់' : 'TOTAL PAYABLE AMOUNT'}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                ${total.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                ៛{totalKHR.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {language === 'km' ? 'អត្រាប្តូរប្រាក់' : 'Exchange Rate'}: $1 = ៛{exchangeRate.toLocaleString()} KHR
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'PAYMENT METHOD'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {paymentMethods.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: paymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: paymentMethod === pm.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                      color: paymentMethod === pm.id ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {pm.icon} {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Section */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {t('discount')}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                  onClick={() => { setLocalDiscountType('percentage'); setDiscount('percentage', parseFloat(localDiscountValue) || 0); }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    border: localDiscountType === 'percentage' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: localDiscountType === 'percentage' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                    color: localDiscountType === 'percentage' ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  % {t('percentage')}
                </button>
                <button
                  onClick={() => { setLocalDiscountType('fixed'); setDiscount('fixed', parseFloat(localDiscountValue) || 0); }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    border: localDiscountType === 'fixed' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: localDiscountType === 'fixed' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                    color: localDiscountType === 'fixed' ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  $ {t('fixedAmount')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="input-field"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
                  placeholder={localDiscountType === 'percentage' ? 'e.g. 10' : 'e.g. 2.00'}
                  value={localDiscountValue}
                  onChange={(e) => {
                    setLocalDiscountValue(e.target.value);
                    setDiscount(localDiscountType, parseFloat(e.target.value) || 0);
                  }}
                  min="0"
                />
                {discountAmount > 0 && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', whiteSpace: 'nowrap' }}>
                    -${discountAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isCash ? (
              <>
                {/* Cash Received USD */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {language === 'km' ? 'ទទួលប្រាក់ដោយដំណើរការបង់ប្រាក់' : 'CASH REGISTER INPUT'}
                  </div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{language === 'km' ? 'ទទួលប្រាក់ដុល្លារ ($):' : 'Cash Received in USD ($):'}</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ fontSize: '1.25rem', padding: '12px 16px', marginTop: '4px', borderRadius: '10px' }}
                    value={receivedAmountUSD}
                    onChange={(e) => setReceivedAmountUSD(e.target.value)}
                    placeholder="e.g. 10"
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[1, 5, 10, 20, 50, 100].map(amt => (
                      <button
                        key={amt}
                        onClick={() => handleQuickUSD(amt)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                          border: '1px solid var(--border)', background: 'var(--bg-card)',
                          cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Received KHR */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{language === 'km' ? 'ទទួលប្រាក់រៀល (៛):' : 'Cash Received in Riel (៛):'}</label>
                  <input
                    type="number"
                    className="input-field"
                    style={{ fontSize: '1.25rem', padding: '12px 16px', marginTop: '4px', borderRadius: '10px' }}
                    value={receivedAmountKHR}
                    onChange={(e) => setReceivedAmountKHR(e.target.value)}
                    placeholder="e.g. 40000"
                  />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[5000, 10000, 20000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => handleQuickKHR(amt)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                          border: '1px solid var(--border)', background: 'var(--bg-card)',
                          cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                      >
                        ៛{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change Summary */}
                <div style={{
                  padding: '16px', borderRadius: '12px', marginTop: 'auto',
                  border: `1px solid ${isEnough ? 'var(--primary)' : 'var(--border)'}`,
                  background: isEnough ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-input)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>{language === 'km' ? 'សរុបបង់ជាដុល្លារ:' : 'Total Paid USD equivalent:'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${totalReceivedInUSD.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{language === 'km' ? 'លុយអាប់ជូនអតិថិជន:' : 'Change Due:'}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isEnough ? 'var(--success)' : 'var(--text-muted)' }}>
                        ${changeUSD.toFixed(2)}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>៛{changeKHR.toLocaleString()} Riel</div>
                    </div>
                  </div>
                  {!isEnough && (
                    <div style={{
                      marginTop: '8px', padding: '6px 12px', borderRadius: '20px',
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                      textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)'
                    }}>
                      {language === 'km' ? 'នៅខ្វះ' : 'Remaining Due'}: ${remainingDue.toFixed(2)} USD (៛{remainingKHR.toLocaleString()} KHR)
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Non-cash payment methods */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {paymentMethod === 'card' ? <FiCreditCard size={36} color="#fff" /> : <FiSmartphone size={36} color="#fff" />}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>
                  {paymentMethod === 'aba' && 'Scan ABA KHQR Code'}
                  {paymentMethod === 'wing' && 'Process Wing Pay'}
                  {paymentMethod === 'card' && 'Swipe or Insert Card'}
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Total: <strong>${total.toFixed(2)}</strong> (៛{totalKHR.toLocaleString()})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '12px',
          padding: '16px 28px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)'
        }}>
          <button
            className="btn btn-ghost btn-lg"
            style={{ borderRadius: '10px', padding: '12px 24px' }}
            onClick={onClose}
            disabled={loading}
          >
            {t('close')}
          </button>
          <button
            className="btn btn-primary btn-lg"
            style={{
              minWidth: '260px', borderRadius: '10px', padding: '12px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontSize: '1rem', fontWeight: 700
            }}
            disabled={(isCash && !isEnough) || loading}
            onClick={handlePayment}
          >
            {loading ? (
              <><div className="spinner"></div> {t('processing')}</>
            ) : (
              <><FiCheckCircle size={20} /> {language === 'km' ? 'បញ្ចប់ការទូទាត់' : 'Complete Payment'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
