import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { FiLogOut, FiGlobe, FiClock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function CashierLayout() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { settings } = useSettings();
  const [clock, setClock] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-col" style={{ height: '100vh' }}>
      <header className="cashier-header">
        <div className="cashier-header-left">
          <div className="cashier-logo">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <div className="cashier-logo-icon">{(settings.shop_name || 'M')[0]}</div>
            )}
            <span className="cashier-logo-text gradient-text">{settings.shop_name || 'MekongPOS'}</span>
          </div>
          {user?.role === 'admin' && (
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ marginLeft: '16px' }}
              onClick={() => navigate('/admin/dashboard')}
            >
              <FiArrowLeft /> {t('dashboard') || 'Back to Admin'}
            </button>
          )}
        </div>

        <div className="cashier-header-right">
          <div className="cashier-clock">
            <FiClock style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {clock}
          </div>
          <div className="cashier-user">
            <FiUser />
            <span>{user?.full_name || 'Cashier'}</span>
          </div>
          <button className="lang-toggle" onClick={toggleLanguage}>
            <FiGlobe />
            {language === 'en' ? 'KM' : 'EN'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            <FiLogOut />
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}
