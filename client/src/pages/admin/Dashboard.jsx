import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI, saleAPI, settingsAPI } from '../../services/api';
import {
  FiShoppingBag, FiDollarSign, FiPackage, FiAlertTriangle,
  FiTrendingUp, FiClock
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(4100);

  useEffect(() => {
    fetchData();
    settingsAPI.getAll().then((res) => {
      const s = res.data.data || {};
      if (s.exchange_rate) setExchangeRate(parseFloat(s.exchange_rate) || 4100);
    }).catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, monthlyRes, salesRes, topRes] = await Promise.allSettled([
        reportAPI.getDashboard(),
        reportAPI.getMonthly({ month: new Date().toISOString().slice(0, 7) }),
        saleAPI.getAll({ page: 1, limit: 10 }),
        reportAPI.getTopProducts({ period: 30, limit: 5 }),
      ]);

      if (dashRes.status === 'fulfilled') {
        setStats(dashRes.value.data.data);
      }
      if (monthlyRes.status === 'fulfilled') {
        setMonthlySales(monthlyRes.value.data.data?.daily_breakdown || []);
      }
      if (salesRes.status === 'fulfilled') {
        setRecentSales(salesRes.value.data.data || []);
      }
      if (topRes.status === 'fulfilled') {
        setTopProducts(topRes.value.data.data || []);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (val) => `$${parseFloat(val || 0).toFixed(2)}`;
  const formatKHR = (val) => `៛${Math.round(parseFloat(val || 0) * exchangeRate).toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">{formatUSD(payload[0].value)}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div className="page-header-left">
            <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('dashboard')}</h1>
          </div>
        </div>
        <div className="page-content">
          <div className="stat-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-card" style={{ height: 120 }}></div>
            ))}
          </div>
          <div className="skeleton" style={{ height: 320, marginBottom: 24 }}></div>
        </div>
      </>
    );
  }

  const statCards = [
    {
      icon: <FiShoppingBag />,
      label: t('todaySales'),
      value: stats?.today_sales || 0,
      color: 'indigo',
    },
    {
      icon: <FiDollarSign />,
      label: t('todayRevenue'),
      value: formatUSD(stats?.today_revenue),
      color: 'green',
    },
    {
      icon: <FiPackage />,
      label: t('totalProducts'),
      value: stats?.total_products || 0,
      color: 'amber',
    },
    {
      icon: <FiAlertTriangle />,
      label: t('lowStockAlerts'),
      value: stats?.low_stock_count || 0,
      color: 'rose',
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('dashboard')}</h1>
          <span className="page-subtitle">{t('welcome')}, {stats?.user_name || 'Admin'}!</span>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        {/* Stat Cards */}
        <div className="stat-grid">
          {statCards.map((card, i) => (
            <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`stat-card-icon ${card.color}`}>{card.icon}</div>
              <div className="stat-card-info">
                <div className="stat-card-value">{card.value}</div>
                <div className={`stat-card-label ${language === 'km' ? 'km' : ''}`}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sales Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className={`chart-title ${language === 'km' ? 'km' : ''}`}>
              <FiTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {t('monthlySales')}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySales.length ? monthlySales : generateDemoChart()}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dual-column">
          {/* Recent Sales */}
          <div className="data-section">
            <div className="data-section-header">
              <h3 className={`data-section-title ${language === 'km' ? 'km' : ''}`}>
                <FiClock style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {t('recentSales')}
              </h3>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('date')}</th>
                    <th>{t('total')}</th>
                    <th>{t('paymentMethod')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length > 0 ? (
                    recentSales.map((sale, i) => (
                      <tr key={sale.id || i}>
                        <td>{sale.id || i + 1}</td>
                        <td>{sale.created_at ? new Date(sale.created_at).toLocaleDateString() : '-'}</td>
                        <td className="fw-600">{formatUSD(sale.total_amount)}</td>
                        <td>
                          <span className={`badge ${sale.payment_method === 'cash' ? 'badge-success' : 'badge-info'}`}>
                            {sale.payment_method || 'cash'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted" style={{ padding: 32 }}>
                        {t('noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="data-section">
            <div className="data-section-header">
              <h3 className={`data-section-title ${language === 'km' ? 'km' : ''}`}>
                <FiTrendingUp style={{ marginRight: 8, verticalAlign: 'middle' }} />
                {t('topSellingProducts')}
              </h3>
            </div>
            {topProducts.length > 0 ? (
              <div style={{ padding: 20 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={12}
                      width={100}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total_qty" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <p className="text-muted">{t('noData')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function generateDemoChart() {
  const data = [];
  const now = new Date();
  for (let i = 1; i <= 28; i++) {
    data.push({
      date: `${now.getMonth() + 1}/${i}`,
      revenue: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
}
