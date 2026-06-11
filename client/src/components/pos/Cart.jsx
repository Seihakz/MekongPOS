import React from 'react';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Cart() {
  const { t } = useLanguage();
  const { items, updateQty, removeItem, clearCart, subtotal, discountAmount, taxAmount, total, totalKHR, exchangeRate } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', flex: 1 }}>
        <FiShoppingCart size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
        <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>{t('emptyCart')}</p>
        <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>{t('emptyCartMsg')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiShoppingCart /> {t('currentSale')}
        </h2>
        <button className="btn-icon" onClick={clearCart} style={{ color: 'var(--danger)' }} title={t('clearCart')}>
          <FiTrash2 />
        </button>
      </div>

      {/* Cart Items List */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => (
          <div key={item.id} className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', paddingRight: '12px' }}>{item.name}</span>
              <button className="btn-icon" onClick={() => removeItem(item.id)} style={{ padding: '4px', color: 'var(--text-muted)' }}>
                <FiX size={16} />
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="gradient-text" style={{ fontWeight: 700 }}>${item.sell_price.toFixed(2)}</span>
              
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <button 
                  className="btn-icon" 
                  style={{ padding: '6px', borderRight: '1px solid var(--border)', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
                  onClick={() => updateQty(item.id, item.qty - 1)}
                >
                  <FiMinus size={14} />
                </button>
                <input 
                  type="number" 
                  value={item.qty}
                  onChange={(e) => updateQty(item.id, e.target.value)}
                  style={{ width: '40px', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <button 
                  className="btn-icon" 
                  style={{ padding: '6px', borderLeft: '1px solid var(--border)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
                  onClick={() => updateQty(item.id, item.qty + 1)}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <span>{t('subtotal')}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.875rem' }}>
              <span>{t('discount')}</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span>{t('tax')}</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{t('total')}</span>
            <div style={{ textAlign: 'right' }}>
              <div className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
                ${total.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                ៛{totalKHR.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
