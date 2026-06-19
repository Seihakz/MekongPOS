import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { customerAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function Customers() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    points: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({ search });
      setCustomers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer = null) => {
    setCurrentCustomer(customer);
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        points: customer.points || 0,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        points: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        await customerAPI.update(currentCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer added successfully');
      }
      closeModal();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.remove(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="stat-card-icon indigo">
            <FiUser />
          </div>
          <h1 className="page-title">{t('customers')}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus /> {t('addCustomer')}
          </button>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <FiSearch />
            <input
              type="text"
              placeholder={t('searchCustomers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="table-container glass-card">
          <table className="table">
            <thead>
              <tr>
                <th>{t('customerName')}</th>
                <th>{t('phone')}</th>
                <th>{t('email')}</th>
                <th>{t('address')}</th>
                <th>{t('points')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>{t('loading')}</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>{t('noCustomers')}</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td>
                      <span className="badge badge-primary">{c.points}</span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => openModal(c)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(c.id)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{currentCustomer ? t('editCustomer') : t('addCustomer')}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">{t('customerName')} *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('phone')} *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('email')}</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('address')}</label>
                  <textarea
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('points')}</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
