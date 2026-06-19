import React, { useState, useEffect } from 'react';
import { FiSettings, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    tax_rate: 0,
    exchange_rate: 0,
    currency_primary: 'USD',
    currency_secondary: 'KHR',
    receipt_footer: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.getAll();
      const settingsMap = res.data.data || {};
      setFormData({
        shop_name: settingsMap.shop_name || '',
        shop_address: settingsMap.shop_address || '',
        shop_phone: settingsMap.shop_phone || '',
        tax_rate: parseFloat(settingsMap.tax_rate) || 0,
        exchange_rate: parseFloat(settingsMap.exchange_rate) || 0,
        currency_primary: settingsMap.currency_primary || 'USD',
        currency_secondary: settingsMap.currency_secondary || 'KHR',
        receipt_footer: settingsMap.receipt_footer || '',
      });
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsAPI.update({ settings: formData });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <div className="stat-card-icon indigo">
            <FiSettings />
          </div>
          <h1 className="page-title">{t('settings')}</h1>
        </div>
      </div>

      <div className="page-content animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{t('shopInfo')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">{t('shopName')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('shopPhone')}</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.shop_phone}
                  onChange={(e) => setFormData({ ...formData, shop_phone: e.target.value })}
                />
              </div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">{t('shopAddress')}</label>
                <textarea
                  className="input-field"
                  value={formData.shop_address}
                  onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{t('taxAndCurrency')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">{t('taxRate')} (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('exchangeRate')} (USD to KHR)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('primaryCurrency')}</label>
                <select
                  className="input-field"
                  value={formData.currency_primary}
                  onChange={(e) => setFormData({ ...formData, currency_primary: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">{t('secondaryCurrency')}</label>
                <select
                  className="input-field"
                  value={formData.currency_secondary}
                  onChange={(e) => setFormData({ ...formData, currency_secondary: e.target.value })}
                >
                  <option value="KHR">KHR (៛)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{t('receiptSettings')}</h2>
            <div className="input-group">
              <label className="input-label">{t('receiptFooter')}</label>
              <textarea
                className="input-field"
                value={formData.receipt_footer}
                onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                placeholder="Thank you for your business!"
              />
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <FiSave /> {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
