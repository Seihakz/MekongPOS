import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { productAPI, categoryAPI } from '../../services/api';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiBox,
  FiAlertTriangle, FiRefreshCw, FiUpload, FiImage
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Products() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const emptyForm = {
    name: '', barcode: '', category_id: '', description: '',
    cost_price: '', sell_price: '', stock_qty: '0', min_stock: '5', unit: 'pcs',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    categoryAPI.getAll().then((r) => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [search, categoryFilter, showLowStock, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;
      const res = showLowStock
        ? await productAPI.getLowStock()
        : await productAPI.getAll(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      name: p.name || '', barcode: p.barcode || '',
      category_id: p.category_id || '', description: p.description || '',
      cost_price: p.cost_price || '', sell_price: p.sell_price || '',
      stock_qty: p.stock_qty ?? '0', min_stock: p.min_stock ?? '5', unit: p.unit || 'pcs',
    });
    setImageFile(null);
    setImagePreview(p.image_url || '');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('imageTooLarge'));
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error(t('imageInvalidType'));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sell_price) return;
    setSaving(true);
    try {
      let payload = form;
      if (imageFile) {
        const fd = new FormData();
        Object.keys(form).forEach((key) => fd.append(key, form[key]));
        fd.append('image', imageFile);
        payload = fd;
      }

      if (editItem) {
        await productAPI.update(editItem.id, payload);
        toast.success(t('productUpdated'));
      } else {
        await productAPI.create(payload);
        toast.success(t('productCreated'));
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await productAPI.remove(deleteItem.id);
      toast.success(t('productDeleted'));
      setDeleteItem(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting product');
    }
  };

  const generateBarcode = () => {
    const code = '200' + Date.now().toString().slice(-9);
    setForm({ ...form, barcode: code });
  };

  const formatUSD = (v) => `$${parseFloat(v || 0).toFixed(2)}`;

  const getStockBadge = (p) => {
    const qty = p.stock_qty ?? 0;
    const min = p.min_stock ?? 5;
    if (qty <= 0) return <span className="badge badge-danger">{t('outOfStock')}</span>;
    if (qty <= min) return <span className="badge badge-warning">{t('lowStock')}</span>;
    return <span className="badge badge-success">{t('inStock')}</span>;
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('products')}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> <span className={language === 'km' ? 'km' : ''}>{t('addProduct')}</span>
          </button>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <FiSearch />
            <input
              type="text"
              className="input-field"
              placeholder={t('searchProducts')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input-field"
            style={{ width: 180 }}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            className={`btn ${showLowStock ? 'btn-danger' : 'btn-secondary'} btn-sm`}
            onClick={() => { setShowLowStock(!showLowStock); setPage(1); }}
          >
            <FiAlertTriangle />
            {t('lowStock')}
          </button>
        </div>

        {loading ? (
          <div className="table-container">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 48, margin: '8px 16px' }}></div>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('image')}</th>
                  <th>{t('barcode')}</th>
                  <th>{t('productName')}</th>
                  <th>{t('category')}</th>
                  <th>{t('costPrice')}</th>
                  <th>{t('sellPrice')}</th>
                  <th>{t('stockQty')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--bg-input)',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FiBox size={16} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                    </td>
                    <td className="fs-sm text-muted">{p.barcode || '-'}</td>
                    <td className="fw-600">{p.name}</td>
                    <td>{p.category_name || '-'}</td>
                    <td>{formatUSD(p.cost_price)}</td>
                    <td className="fw-600">{formatUSD(p.sell_price)}</td>
                    <td>{p.stock_qty ?? 0}</td>
                    <td>{getStockBadge(p)}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => openEdit(p)} title={t('edit')}>
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" onClick={() => setDeleteItem(p)} title={t('delete')}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <FiBox className="empty-state-icon" />
                        <p className="empty-state-title">{t('noProducts')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3), page + 2
            ).map((p) => (
              <button
                key={p}
                className={`pagination-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button className="pagination-btn" disabled={page >= pagination.total_pages} onClick={() => setPage(page + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3 className={`modal-title ${language === 'km' ? 'km' : ''}`}>
                {editItem ? t('editProduct') : t('addProduct')}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="input-group">
                    <label className="input-label">{t('productName')} *</label>
                    <input type="text" className="input-field" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('barcode')}</label>
                    <div className="flex gap-8">
                      <input type="text" className="input-field" style={{ flex: 1 }} value={form.barcode}
                        onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                      <button type="button" className="btn btn-secondary btn-sm" onClick={generateBarcode}>
                        <FiRefreshCw /> {t('generateBarcode')}
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('category')}</label>
                    <select className="input-field" value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">-- {t('category')} --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('unit')}</label>
                    <input type="text" className="input-field" value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('costPrice')} ($)</label>
                    <input type="number" step="0.01" min="0" className="input-field" value={form.cost_price}
                      onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('sellPrice')} ($) *</label>
                    <input type="number" step="0.01" min="0" className="input-field" value={form.sell_price}
                      onChange={(e) => setForm({ ...form, sell_price: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('stockQty')}</label>
                    <input type="number" min="0" className="input-field" value={form.stock_qty}
                      onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('minStock')}</label>
                    <input type="number" min="0" className="input-field" value={form.min_stock}
                      onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
                  </div>
                  <div className="input-group form-full">
                    <label className="input-label">{t('description')}</label>
                    <textarea className="input-field" rows={2} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="input-group form-full">
                    <label className="input-label">{t('productImage')}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '10px',
                        border: '2px dashed var(--border)', background: 'var(--bg-input)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FiImage size={28} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FiUpload size={14} /> {t('uploadImage')}
                          </button>
                          {imagePreview && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={handleRemoveImage}
                            >
                              <FiTrash2 size={14} /> {t('removeImage')}
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                          JPEG, PNG, GIF, or WEBP. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <div className="spinner"></div>} {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteItem && (
        <div className="modal-overlay" onClick={() => setDeleteItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-dialog-icon danger"><FiTrash2 /></div>
              <h3 className="confirm-dialog-title">{t('deleteConfirmTitle')}</h3>
              <p className="confirm-dialog-text">{t('deleteConfirmText')}</p>
              <div className="confirm-dialog-actions">
                <button className="btn btn-secondary" onClick={() => setDeleteItem(null)}>{t('cancel')}</button>
                <button className="btn btn-danger" onClick={handleDelete}>{t('delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
