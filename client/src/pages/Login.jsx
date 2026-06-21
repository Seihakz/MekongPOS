import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { FiUser, FiLock, FiAlertCircle, FiLogIn, FiGlobe } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/cashier/pos', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.shop_name || 'Logo'}
              style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', display: 'block', margin: '0 auto 12px auto' }}
            />
          ) : (
            <div className="login-logo-icon">M</div>
          )}
          <h1 className="login-title gradient-text">{settings.shop_name || 'MekongPOS'}</h1>
          <p className={`login-subtitle ${language === 'km' ? 'km' : ''}`}>{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="login-error">
            <FiAlertCircle />
            <span className={language === 'km' ? 'km' : ''}>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className={`input-label ${language === 'km' ? 'km' : ''}`}>{t('username')}</label>
            <div className="search-input-wrapper" style={{ maxWidth: 'none' }}>
              <FiUser />
              <input
                type="text"
                className="input-field"
                placeholder={t('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label className={`input-label ${language === 'km' ? 'km' : ''}`}>{t('password')}</label>
            <div className="search-input-wrapper" style={{ maxWidth: 'none' }}>
              <FiLock />
              <input
                type="password"
                className="input-field"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`login-btn ${language === 'km' ? 'km' : ''}`}
            disabled={loading || !username || !password}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {t('loggingIn')}
              </>
            ) : (
              <>
                <FiLogIn />
                {t('loginButton')}
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="lang-toggle" onClick={toggleLanguage}>
            <FiGlobe />
            {language === 'en' ? 'ខ្មែរ' : 'English'}
          </button>
        </div>
      </div>
    </div>
  );
}
