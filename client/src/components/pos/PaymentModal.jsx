import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { saleAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ isOpen, onClose, onSuccess }) {
  const { t } = useLanguage();
  const { total, totalKHR, exchangeRate, items, discountType, discountValue, clearCart } = useCart();
  const [receivedAmountUSD, setReceivedAmountUSD] = useState('');
  const [receivedAmountKHR, setReceivedAmountKHR] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReceivedAmountUSD(total.toFixed(2));
      setReceivedAmountKHR('');
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const totalReceivedInUSD = (parseFloat(receivedAmountUSD) || 0) + ((parseFloat(receivedAmountKHR) || 0) / exchangeRate);
  const changeUSD = Math.max(0, totalReceivedInUSD - total);
  const changeKHR = changeUSD * exchangeRate;
  const isEnough = totalReceivedInUSD >= total - 0.01; // Allow 1 cent floating point difference

  const handleQuickAmount = (amount) => {
    setReceivedAmountUSD(amount.toString());
    setReceivedAmountKHR('');
  };

  const handlePayment = async () => {
    if (!isEnough) {
      toast.error(t('insufficientAmount'));
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customer_id: null,
        discount_type: discountType === 'percentage' ? 'percentage' : 'fixed',
        discount_value: discountValue || 0,
        payment_method: paymentMethod.toLowerCase(),
        amount_paid: totalReceivedInUSD,
        items: items.map(item => ({
          product_id: item.id,
          qty: item.qty,
          unit_price: item.sell_price,
        }))
      };

      const res = await saleAPI.create(saleData);
      toast.success(t('saleCompleted'));
      clearCart();
      onSuccess(res.data.data); // Pass back the completed sale data for printing
      onClose();
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiDollarSign /> {t('payment')}
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Column: Totals & Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-input)' }}>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('amountDue')}</div>
              <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
                ${total.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                ៛{totalKHR.toLocaleString()}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{t('paymentMethod')}</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={`btn ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ flex: 1 }}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <FiDollarSign /> {t('cash')}
                </button>
                <button 
                  className={`btn ${paymentMethod === 'Card' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ flex: 1 }}
                  onClick={() => setPaymentMethod('Card')}
                >
                  <FiCreditCard /> {t('card')}
                </button>
                <button 
                  className={`btn ${paymentMethod === 'QR' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ flex: 1 }}
                  onClick={() => setPaymentMethod('QR')}
                >
                  QR Code
                </button>
              </div>
            </div>

            {paymentMethod === 'Cash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">{t('amountPaid')} (USD)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ fontSize: '1.5rem', padding: '12px' }}
                    value={receivedAmountUSD}
                    onChange={(e) => setReceivedAmountUSD(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('amountPaid')} (KHR)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    style={{ fontSize: '1.5rem', padding: '12px' }}
                    value={receivedAmountKHR}
                    onChange={(e) => setReceivedAmountKHR(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Quick Amounts & Change */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {paymentMethod === 'Cash' && (
              <>
                <div className="input-group">
                  <label className="input-label">Quick Amounts (USD)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[total.toFixed(2), 5, 10, 20, 50, 100].map((amt, idx) => (
                      <button 
                        key={idx} 
                        className="btn btn-secondary" 
                        style={{ padding: '12px', fontSize: '1.125rem', fontWeight: 600 }}
                        onClick={() => handleQuickAmount(amt)}
                      >
                        ${amt}
                      </button>
                    ))}
                    <button className="btn btn-secondary" onClick={() => { setReceivedAmountUSD(''); setReceivedAmountKHR(''); }}>Clear</button>
                  </div>
                </div>
              </>
            )}

            <div className="glass-card" style={{ padding: '20px', marginTop: 'auto', border: `1px solid ${isEnough ? 'var(--success)' : 'var(--border)'}` }}>
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('change')}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: isEnough ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>
                ${changeUSD.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ៛{changeKHR.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer" style={{ padding: '24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-lg" onClick={onClose} disabled={loading}>{t('cancel')}</button>
          <button 
            className="btn btn-primary btn-lg" 
            style={{ minWidth: '200px' }}
            disabled={!isEnough || loading}
            onClick={handlePayment}
          >
            {loading ? t('processing') : <><FiCheckCircle /> {t('confirmPayment')}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
