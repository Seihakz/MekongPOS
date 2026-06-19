import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { reportAPI, saleAPI } from '../../services/api';
import {
  FiCalendar, FiDollarSign, FiShoppingBag, FiTrendingUp,
  FiDownload, FiBarChart2, FiEye, FiX
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';

export default function SalesReport() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewSale, setViewSale] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);

  useEffect(() => { fetchReport(); }, [activeTab, date, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (activeTab === 'daily') {
        const [rep, sal] = await Promise.allSettled([
          reportAPI.getDaily({ date }),
          saleAPI.getAll({ start_date: date, end_date: date, limit: 50 }),
        ]);
        if (rep.status === 'fulfilled') setDailyData(rep.value.data.data);
        if (sal.status === 'fulfilled') setSales(sal.value.data.data || []);
      } else if (activeTab === 'monthly') {
        const [rep, top] = await Promise.allSettled([
          reportAPI.getMonthly({ month }),
          reportAPI.getTopProducts({ period: 'month', limit: 10 }),
        ]);
        if (rep.status === 'fulfilled') setMonthlyData(rep.value.data.data);
        if (top.status === 'fulfilled') setTopProducts(top.value.data.data || []);
      }
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const openSaleDetail = async (sale) => {
    setViewSale(sale);
    try {
      const res = await saleAPI.getById(sale.id);
      setSaleDetail(res.data.data);
    } catch {
      setSaleDetail(sale);
    }
  };

  const formatUSD = (v) => `$${parseFloat(v || 0).toFixed(2)}`;

  const exportCSV = () => {
    if (!sales.length) return;
    const headers = ['ID', 'Date', 'Total', 'Payment', 'Items'];
    const escape = (val) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const rows = sales.map((s) => [
      s.id, s.created_at, s.total_amount, s.payment_method, s.item_count || ''
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${date || month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">{formatUSD(payload[0].value)}</p>
      </div>
    );
  };

  const tabs = [
    { key: 'daily', label: t('dailyReport'), icon: <FiCalendar /> },
    { key: 'monthly', label: t('monthlyReport'), icon: <FiBarChart2 /> },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className={`page-title ${language === 'km' ? 'km' : ''}`}>{t('reports')}</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
            <FiDownload /> {t('exportCSV')}
          </button>
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div className="tabs">
          {tabs.map((tab) => (
            <button key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.icon} <span style={{ marginLeft: 6 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="filter-bar">
          {activeTab === 'daily' && (
            <input type="date" className="input-field" style={{ width: 200 }}
              value={date} onChange={(e) => setDate(e.target.value)} />
          )}
          {activeTab === 'monthly' && (
            <input type="month" className="input-field" style={{ width: 200 }}
              value={month} onChange={(e) => setMonth(e.target.value)} />
          )}
        </div>

        {loading ? (
          <div className="stat-grid">
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 100 }}></div>)}
          </div>
        ) : (
          <>
            {activeTab === 'daily' && (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon indigo"><FiShoppingBag /></div>
                    <div className="stat-card-info">
                      <div className="stat-card-value">{dailyData?.summary?.total_sales ?? sales.length ?? 0}</div>
                      <div className="stat-card-label">{t('totalSales')}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon green"><FiDollarSign /></div>
                    <div className="stat-card-info">
                      <div className="stat-card-value">{formatUSD(dailyData?.summary?.total_revenue ?? sales.reduce((s,x) => s + parseFloat(x.total_amount || 0), 0))}</div>
                      <div className="stat-card-label">{t('totalRevenue')}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon amber"><FiTrendingUp /></div>
                    <div className="stat-card-info">
                      <div className="stat-card-value">{formatUSD(dailyData?.summary?.average_sale ?? (sales.length ? sales.reduce((s,x) => s + parseFloat(x.total_amount || 0), 0) / sales.length : 0))}</div>
                      <div className="stat-card-label">{t('averageSale')}</div>
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('time')}</th>
                        <th>{t('cashier')}</th>
                        <th>{t('items')}</th>
                        <th>{t('total')}</th>
                        <th>{t('paymentMethod')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length > 0 ? sales.map((s) => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td className="fs-sm">{s.created_at ? new Date(s.created_at).toLocaleTimeString() : '-'}</td>
                          <td>{s.cashier_name || '-'}</td>
                          <td>{s.item_count || '-'}</td>
                          <td className="fw-600">{formatUSD(s.total_amount)}</td>
                          <td>
                            <span className={`badge ${s.payment_method === 'cash' ? 'badge-success' : 'badge-info'}`}>
                              {s.payment_method || 'cash'}
                            </span>
                          </td>
                          <td>
                            <button className="action-btn edit" onClick={() => openSaleDetail(s)}><FiEye /></button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 40 }}>{t('noData')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'monthly' && (
              <>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon indigo"><FiShoppingBag /></div>
                    <div className="stat-card-info">
                      <div className="stat-card-value">{monthlyData?.summary?.total_sales || 0}</div>
                      <div className="stat-card-label">{t('totalSales')}</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon green"><FiDollarSign /></div>
                    <div className="stat-card-info">
                      <div className="stat-card-value">{formatUSD(monthlyData?.summary?.total_revenue)}</div>
                      <div className="stat-card-label">{t('totalRevenue')}</div>
                    </div>
                  </div>
                </div>

                {monthlyData?.daily_breakdown?.length > 0 && (
                  <div className="chart-container">
                    <div className="chart-header">
                      <h3 className="chart-title">{t('salesOverview')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData.daily_breakdown}>
                        <defs>
                          <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="total_revenue" stroke="#8b5cf6" fill="url(#rGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {topProducts.length > 0 && (
                  <div className="chart-container">
                    <div className="chart-header">
                      <h3 className="chart-title">{t('topProducts')}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topProducts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="product_name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total_revenue" fill="#ec4899" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Sale Detail Modal */}
      {viewSale && (
        <div className="modal-overlay" onClick={() => { setViewSale(null); setSaleDetail(null); }}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('sales')} #{viewSale.id}</h3>
              <button className="modal-close" onClick={() => { setViewSale(null); setSaleDetail(null); }}><FiX /></button>
            </div>
            <div className="modal-body">
              {saleDetail ? (
                <>
                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    <div><span className="text-muted fs-sm">{t('date')}:</span> <span className="fw-600">{new Date(saleDetail.created_at).toLocaleString()}</span></div>
                    <div><span className="text-muted fs-sm">{t('cashier')}:</span> <span className="fw-600">{saleDetail.cashier_name || '-'}</span></div>
                    <div><span className="text-muted fs-sm">{t('paymentMethod')}:</span> <span className="fw-600">{saleDetail.payment_method}</span></div>
                    <div><span className="text-muted fs-sm">{t('total')}:</span> <span className="fw-700">{formatUSD(saleDetail.total_amount)}</span></div>
                  </div>
                  {saleDetail.items && (
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>{t('productName')}</th>
                            <th>{t('qty')}</th>
                            <th>{t('price')}</th>
                            <th>{t('total')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {saleDetail.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.product_name || item.name}</td>
                              <td>{item.qty}</td>
                              <td>{formatUSD(item.unit_price)}</td>
                              <td className="fw-600">{formatUSD(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center" style={{ padding: 40 }}><div className="spinner spinner-lg"></div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
