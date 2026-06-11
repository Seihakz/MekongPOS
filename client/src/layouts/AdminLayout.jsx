import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FiGrid, FiBox, FiTag, FiLayers, FiBarChart2,
  FiUsers, FiUserCheck, FiSettings, FiLogOut, FiGlobe,
  FiShoppingCart
} from 'react-icons/fi';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();

  const navItems = [
    { section: t('mainMenu') },
    { to: '/admin/dashboard', icon: <FiGrid />, label: t('dashboard') },
    { to: '/cashier/pos', icon: <FiShoppingCart />, label: t('pos') },
    { section: t('management') },
    { to: '/admin/products', icon: <FiBox />, label: t('products') },
    { to: '/admin/categories', icon: <FiTag />, label: t('categories') },
    { to: '/admin/stock', icon: <FiLayers />, label: t('stockManagement') },
    { to: '/admin/sales', icon: <FiBarChart2 />, label: t('reports') },
    { to: '/admin/users', icon: <FiUsers />, label: t('users') },
    { to: '/admin/customers', icon: <FiUserCheck />, label: t('customers') },
    { to: '/admin/settings', icon: <FiSettings />, label: t('settings') },
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">M</div>
            <span className="sidebar-logo-text gradient-text">MekongPOS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="sidebar-section-title">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`
                }
              >
                {item.icon}
                <span className={language === 'km' ? 'km' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.full_name || 'Admin'}</div>
              <div className="sidebar-user-role">
                <span className="badge badge-primary" style={{ padding: '1px 8px', fontSize: '0.6875rem' }}>
                  {t('admin')}
                </span>
              </div>
            </div>
          </div>
          <div className="sidebar-actions">
            <button
              className="sidebar-action-btn"
              onClick={toggleLanguage}
              title={language === 'en' ? 'ខ្មែរ' : 'English'}
            >
              <FiGlobe />
              {language === 'en' ? 'KM' : 'EN'}
            </button>
            <button className="sidebar-action-btn logout" onClick={logout}>
              <FiLogOut />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
