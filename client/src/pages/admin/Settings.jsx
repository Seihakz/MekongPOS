import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

export default function Settings() {
  const { t } = useLanguage();
  const { settings: contextSettings, refresh } = useSettings();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef(null);
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
    setFormData({
      shop_name: contextSettings.shop_name || '',
      shop_address: contextSettings.shop_address || '',
      shop_phone: contextSettings.shop_phone || '',
      tax_rate: contextSettings.tax_rate || 0,
      exchange_rate: contextSettings.exchange_rate || 0,
      currency_primary: contextSettings.currency_primary || 'USD',
      currency_secondary: contextSettings.currency_secondary || 'KHR',
      receipt_footer: contextSettings.receipt_footer || '',
    });
    setLogoUrl(contextSettings.logo_url || '');
  }, [contextSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsAPI.update({ settings: formData });
      await refresh();
      toast.success(t('settingsSaved'));
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, or WEBP images allowed');
      return;
    }

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await settingsAPI.uploadLogo(fd);
      const newLogoUrl = res.data.data.logo_url;
      setLogoUrl(newLogoUrl);
      await refresh();
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

          {/* Shop Logo */}
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>{t('shopLogo')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '12px',
                border: '2px dashed var(--border)', background: 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Shop Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <FiImage size={32} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FiUpload size={16} />
                  {uploadingLogo ? t('loading') : t('uploadLogo')}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  JPEG, PNG, GIF, or WEBP. Max 5MB.
                </p>
              </div>
            </div>
          </section>

          {/* Shop Information */}
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

          {/* Tax & Currency */}
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

          {/* Receipt Settings */}
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
