import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUsers, FiToggleLeft, FiToggleRight, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Users() {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', password: '', role: 'cashier' });
  const [resetPwModal, setResetPwModal] = useState(null);
  const [newPw, setNewPw] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ full_name: '', username: '', password: '', role: 'cashier' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditItem(u);
    setForm({ full_name: u.full_name, username: u.username, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.username) return;
    if (!editItem && !form.password) return;
    setSaving(true);
    try {
      const data = { ...form };
      if (editItem && !data.password) delete data.password;
      if (editItem) {
        await userAPI.update(editItem.id, data);
        toast.success(t('userUpdated'));
      } else {
        await userAPI.create(data);
        toast.success(t('userCreated'));
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await userAPI.toggleActive(deleteItem.id);
      toast.success(t('userDeleted'));
      setDeleteItem(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const toggleActive = async (u) => {
    try {
      await userAPI.toggleActive(u.id);
      toast.success('Status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPwModal || !newPw) return;
    try {
      await userAPI.resetPassword(resetPwModal.id, { new_password: newPw });
      toast.success('Password reset successfully');
      setResetPwModal(null);
      setNewPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('users')}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> {t('addUser')}
          </button>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <FiSearch />
            <input type="text" className="input-field" placeholder={t('search') + '...'} value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="table-container">
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 48, margin: '8px 16px' }}></div>)}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('fullName')}</th>
                  <th>{t('username')}</th>
                  <th>{t('role')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-600">{u.full_name}</td>
                    <td className="text-muted">{u.username}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>{u.role}</span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                        {u.is_active !== false ? (
                          <><FiToggleRight className="text-success" /> <span className="text-success fs-sm">{t('active')}</span></>
                        ) : (
                          <><FiToggleLeft className="text-muted" /> <span className="text-muted fs-sm">{t('inactive')}</span></>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => openEdit(u)} title={t('edit')}><FiEdit2 /></button>
                        <button className="action-btn" onClick={() => { setResetPwModal(u); setNewPw(''); }} title={t('resetPassword')}><FiKey /></button>
                        <button className="action-btn delete" onClick={() => setDeleteItem(u)} title={t('delete')}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>
                    <div className="empty-state"><FiUsers className="empty-state-icon" /><p className="empty-state-title">{t('noData')}</p></div>
                  </td></tr>
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
              <h3 className="modal-title">{editItem ? t('editUser') : t('addUser')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="flex-col gap-16">
                  <div className="input-group">
                    <label className="input-label">{t('fullName')} *</label>
                    <input type="text" className="input-field" value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })} required autoFocus />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('username')} *</label>
                    <input type="text" className="input-field" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('password')} {editItem ? `(${t('optional')})` : '*'}</label>
                    <input type="password" className="input-field" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} {...(!editItem ? { required: true } : {})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('role')}</label>
                    <select className="input-field" value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="cashier">{t('cashier')}</option>
                      <option value="admin">{t('admin')}</option>
                    </select>
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

      {/* Reset Password Modal */}
      {resetPwModal && (
        <div className="modal-overlay" onClick={() => setResetPwModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('resetPassword')} — {resetPwModal.full_name}</h3>
              <button className="modal-close" onClick={() => setResetPwModal(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">{t('newPassword')} *</label>
                <input type="password" className="input-field" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResetPwModal(null)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={handleResetPassword} disabled={!newPw}>{t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
