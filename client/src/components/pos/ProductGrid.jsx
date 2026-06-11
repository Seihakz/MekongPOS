import React from 'react';
import { FiImage, FiBox } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';

export default function ProductGrid({ products }) {
  const { addItem } = useCart();

  if (!products || products.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <FiBox size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', padding: '16px' }}>
      {products.map((product) => {
        const isOutOfStock = product.stock_qty <= 0;
        return (
          <div
            key={product.id}
            className="glass-card"
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              opacity: isOutOfStock ? 0.5 : 1,
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '180px',
            }}
            onClick={() => !isOutOfStock && addItem(product)}
            onMouseEnter={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isOutOfStock) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{
              height: '80px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              overflow: 'hidden'
            }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiImage size={32} color="var(--text-muted)" />
              )}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {product.name}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                <span className="gradient-text" style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                  ${parseFloat(product.sell_price).toFixed(2)}
                </span>
                <span style={{ fontSize: '0.75rem', color: isOutOfStock ? 'var(--danger)' : 'var(--text-muted)', marginTop: '2px' }}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock_qty} in stock`}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
