import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { stockAPI, productAPI } from '../../services/api';
import {
  FiPlus, FiMinus, FiSearch, FiPackage, FiArrowDownCircle,
  FiArrowUpCircle, FiRefreshCw, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StockManagement() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('in');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ qty: '', reference: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [movFilter, setMovFilter] = useState({ type: '', product_id: '' });

  useEffect(() => {
    productAPI.getAll({ limit: 200 }).then((r) => setProducts(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchMovements();
  }, [activeTab, movFilter]);

  const fetchMovements = async () => {
    try {
      setLoadingMov(true);
      const params = { page: 1, limit: 50 };
      if (movFilter.type) params.type = movFilter.type;
      if (movFilter.product_id) params.product_id = movFilter.product_id;
      const res = await stockAPI.getMovements(params);
      setMovements(res.data.data || []);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoadingMov(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.barcode && p.barcode.includes(productSearch))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !form.qty) return;
    setSaving(true);
    try {
      const payload = {
        product_id: selectedProduct.id,
        qty: parseInt(form.qty, 10),
        reference: form.reference,
        note: form.note,
      };
      if (activeTab === 'in') {
        await stockAPI.stockIn(payload);
      } else {
        await stockAPI.stockOut(payload);
      }
      toast.success(t('stockUpdated'));
      setForm({ qty: '', reference: '', note: '' });
      setSelectedProduct(null);
      setProductSearch('');
      productAPI.getAll({ limit: 200 }).then((r) => setProducts(r.data.data || [])).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stock update failed');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'in', label: t('stockIn'), icon: <FiArrowDownCircle /> },
    { key: 'out', label: t('stockOut'), icon: <FiArrowUpCircle /> },
    { key: 'history', label: t('movementHistory'), icon: <FiClock /> },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('stockManagement')}</h1>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''} ${language === 'km' ? 'km' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span style={{ marginLeft: 6 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {(activeTab === 'in' || activeTab === 'out') && (
          <div className="settings-section" style={{ maxWidth: 640 }}>
            <h3 className={`settings-section-title ${language === 'km' ? 'km' : ''}`}>
              {activeTab === 'in' ? <FiArrowDownCircle /> : <FiArrowUpCircle />}
              {activeTab === 'in' ? t('stockIn') : t('stockOut')}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label className="input-label">{t('selectProduct')} *</label>
                <div className="search-input-wrapper" style={{ maxWidth: 'none' }}>
                  <FiSearch />
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('searchProducts')}
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                  />
                </div>
                {productSearch && !selectedProduct && (
                  <div className="glass-card" style={{ maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
                    {filteredProducts.slice(0, 10).map((p) => (
                      <div
                        key={p.id}
                        style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                        className="cart-item"
                        onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="fw-600 fs-sm">{p.name}</div>
                          <div className="fs-xs text-muted">{t('currentStock')}: {p.stock_qty ?? 0}</div>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div style={{ padding: 16 }} className="text-muted text-center fs-sm">{t('noProducts')}</div>
                    )}
                  </div>
                )}
                {selectedProduct && (
                  <div className="badge badge-primary" style={{ marginTop: 8 }}>
                    {selectedProduct.name} — {t('currentStock')}: {selectedProduct.stock_qty ?? 0}
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">{t('quantity')} *</label>
                  <input type="number" min="1" className="input-field" value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('reference')}</label>
                  <input type="text" className="input-field" value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                </div>
                <div className="input-group form-full">
                  <label className="input-label">{t('note')}</label>
                  <textarea className="input-field" rows={2} value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>

              <button
                type="submit"
                className={`btn ${activeTab === 'in' ? 'btn-success' : 'btn-danger'}`}
                style={{ marginTop: 20 }}
                disabled={saving || !selectedProduct || !form.qty}
              >
                {saving && <div className="spinner"></div>}
                {activeTab === 'in' ? <FiPlus /> : <FiMinus />}
                {activeTab === 'in' ? t('stockIn') : t('stockOut')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <>
            <div className="filter-bar">
              <select
                className="input-field"
                style={{ width: 160 }}
                value={movFilter.type}
                onChange={(e) => setMovFilter({ ...movFilter, type: e.target.value })}
              >
                <option value="">{t('all')} {t('type')}</option>
                <option value="in">{t('stockIn')}</option>
                <option value="out">{t('stockOut')}</option>
              </select>
              <select
                className="input-field"
                style={{ width: 220 }}
                value={movFilter.product_id}
                onChange={(e) => setMovFilter({ ...movFilter, product_id: e.target.value })}
              >
                <option value="">{t('all')} {t('products')}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={fetchMovements}><FiRefreshCw /></button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('date')}</th>
                    <th>{t('productName')}</th>
                    <th>{t('type')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('reference')}</th>
                    <th>{t('note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMov ? (
                    [1,2,3].map((i) => (
                      <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }}></div></td></tr>
                    ))
                  ) : movements.length > 0 ? movements.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="fs-sm">{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                      <td className="fw-600">{m.product_name || '-'}</td>
                      <td>
                        <span className={`badge ${m.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                          {m.type === 'in' ? t('stockIn') : t('stockOut')}
                        </span>
                      </td>
                      <td className="fw-600">{m.type === 'in' ? '+' : '-'}{m.qty}</td>
                      <td className="text-muted">{m.reference || '-'}</td>
                      <td className="text-muted fs-sm">{m.note || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <FiPackage className="empty-state-icon" />
                          <p className="empty-state-title">{t('noData')}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
