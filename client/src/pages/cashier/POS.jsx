import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI } from '../../services/api';
import ProductGrid from '../../components/pos/ProductGrid';
import Cart from '../../components/pos/Cart';
import PaymentModal from '../../components/pos/PaymentModal';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function POS() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchInputRef = useRef(null);
  const { clearCart, items, addItem } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, categories]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        clearCart();
        toast.success('New sale started');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (items.length > 0) {
          setIsPaymentModalOpen(true);
        } else {
          toast.error('Cart is empty');
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearCart, items]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      const sortedData = (res.data.data || []).sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
      const uniqueCats = Array.from(
        sortedData.reduce((map, item) => {
          if (!map.has(item.name)) map.set(item.name, item);
          return map;
        }, new Map()).values()
      );
      setCategories(uniqueCats);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== 'All') {
        const cat = categories.find(c => c.name === selectedCategory);
        if (cat) params.category_id = cat.id;
      }
      const res = await productAPI.getAll(params);
      setProducts(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!search) return;
    try {
      const res = await productAPI.getByBarcode(search);
      if (res.data && res.data.data) {
        addItem(res.data.data);
        setSearch('');
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Not a barcode — fall back to normal search
        fetchProducts();
      } else {
        toast.error('Failed to look up product');
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Left Panel: Products */}
      <div style={{ flex: '60%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <form
            onSubmit={handleBarcodeSubmit}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-input)',
              padding: '0 14px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${isSearchFocused ? 'var(--accent-primary)' : 'var(--border)'}`,
              boxShadow: isSearchFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
              height: '48px',
              transition: 'all 0.2s ease',
            }}
          >
            <FiSearch color={isSearchFocused ? 'var(--accent-primary)' : 'var(--text-muted)'} size={20} style={{ flexShrink: 0, transition: 'color 0.2s ease' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('scanBarcode')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1rem',
                height: '100%',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </form>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              className={`badge ${selectedCategory === 'All' ? 'badge-primary' : 'badge-muted'}`}
              style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.875rem' }}
              onClick={() => setSelectedCategory('All')}
            >
              {t('all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`badge ${selectedCategory === cat.name ? 'badge-primary' : 'badge-muted'}`}
                style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.875rem' }}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>{t('loading')}</div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>

      {/* Right Panel: Cart */}
      <div style={{ flex: '40%', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', height: '100%', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Cart />
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1.25rem', padding: '16px' }}
            disabled={items.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            <FiCreditCard size={24} /> {t('payNow')}
          </button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
