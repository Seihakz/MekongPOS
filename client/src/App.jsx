import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CashierLayout from './layouts/CashierLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import StockManagement from './pages/admin/StockManagement';
import SalesReport from './pages/admin/SalesReport';
import Users from './pages/admin/Users';
import Customers from './pages/admin/Customers';
import Settings from './pages/admin/Settings';
import POS from './pages/cashier/POS';
import SalesHistory from './pages/cashier/SalesHistory';

function App() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/cashier/pos'} replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="stock" element={<StockManagement />} />
        <Route path="sales" element={<SalesReport />} />
        <Route path="users" element={<Users />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Cashier Routes */}
      <Route path="/cashier" element={
        <ProtectedRoute allowedRoles={['admin', 'cashier']}>
          <CashierLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="pos" replace />} />
        <Route path="pos" element={<POS />} />
        <Route path="history" element={<SalesHistory />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
