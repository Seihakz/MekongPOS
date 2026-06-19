import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { categoryAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Categories() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getAll();
      setCategories(res.data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editItem) {
        await categoryAPI.update(editItem.id, form);
        toast.success(t('categoryUpdated'));
      } else {
        await categoryAPI.create(form);
        toast.success(t('categoryCreated'));
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await categoryAPI.remove(deleteItem.id);
      toast.success(t('categoryDeleted'));
      setDeleteItem(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('categories')}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> <span className={language === 'km' ? 'km' : ''}>{t('addCategory')}</span>
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
              placeholder={t('search') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="table-container">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 48, margin: '8px 16px' }}></div>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('categoryName')}</th>
                  <th>{t('description')}</th>
                  <th>{t('productsCount')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((cat, i) => (
                  <tr key={cat.id}>
                    <td>{i + 1}</td>
                    <td className="fw-600">{cat.name}</td>
                    <td className="text-muted">{cat.description || '-'}</td>
                    <td>
                      <span className="badge badge-primary">{cat.product_count ?? 0}</span>
                    </td>
                    <td>
                      <span className={`badge ${cat.is_active !== false ? 'badge-success' : 'badge-muted'}`}>
                        {cat.is_active !== false ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => openEdit(cat)} title={t('edit')}>
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" onClick={() => setDeleteItem(cat)} title={t('delete')}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <FiTag className="empty-state-icon" />
                        <p className="empty-state-title">{t('noCategories')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className={`modal-title ${language === 'km' ? 'km' : ''}`}>
                {editItem ? t('editCategory') : t('addCategory')}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="input-group" style={{ marginBottom: 16 }}>
                  <label className={`input-label ${language === 'km' ? 'km' : ''}`}>{t('categoryName')} *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                    required
                  />
                </div>
                <div className="input-group">
                  <label className={`input-label ${language === 'km' ? 'km' : ''}`}>{t('description')}</label>
                  <textarea
                    className="input-field"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="spinner"></div> : null}
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <div className="modal-overlay" onClick={() => setDeleteItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog">
              <div className="confirm-dialog-icon danger">
                <FiTrash2 />
              </div>
              <h3 className={`confirm-dialog-title ${language === 'km' ? 'km' : ''}`}>{t('deleteConfirmTitle')}</h3>
              <p className={`confirm-dialog-text ${language === 'km' ? 'km' : ''}`}>{t('deleteConfirmText')}</p>
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
