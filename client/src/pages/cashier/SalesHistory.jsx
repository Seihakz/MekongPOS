import React, { useState, useEffect } from 'react';
import { FiClock, FiEye, FiPrinter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { saleAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { printReceiptHtml } from '../../utils/printReceipt';
import Receipt from '../../components/pos/Receipt';
import { createRoot } from 'react-dom/client';

export default function SalesHistory() {
  const { t } = useLanguage();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await saleAPI.getToday(); // Cashier usually views today's sales
      setSales(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch sales history');
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = async (sale) => {
    try {
      const res = await saleAPI.getById(sale.id);
      const fullSaleData = res.data.data;
      
      const printContainer = document.createElement('div');
      const root = createRoot(printContainer);
      root.render(<Receipt sale={fullSaleData} />);
      
      setTimeout(() => {
        printReceiptHtml(printContainer.innerHTML);
        root.unmount();
      }, 500);
    } catch (error) {
      toast.error('Failed to prepare receipt for printing');
    }
  };

  const handleView = async (sale) => {
    try {
      const res = await saleAPI.getById(sale.id);
      setSelectedSale(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch sale details');
    }
  };

  return (
    <div className="main-content">
      <header className="page-header">
        <div className="page-header-left">
          <div className="stat-card-icon indigo">
            <FiClock />
          </div>
          <h1 className="page-title">{t('Sales History') || 'Today\'s Sales'}</h1>
        </div>
      </header>

      <div className="page-content" style={{ padding: '24px' }}>
        <div className="table-container glass-card">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Time</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No sales found for today.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>#{sale.invoice_number || sale.id}</div>
                    </td>
                    <td>{new Date(sale.created_at).toLocaleTimeString()}</td>
                    <td>{sale.items?.length || sale.item_count || '-'}</td>
                    <td>
                      <span className="badge badge-success">${parseFloat(sale.total_amount).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{sale.payment_method}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => handleView(sale)} title="View Details">
                        <FiEye />
                      </button>
                      <button className="btn-icon" onClick={() => handleReprint(sale)} title="Reprint Receipt" style={{ color: 'var(--info)' }}>
                        <FiPrinter />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Sale Details #{selectedSale.invoice_number || selectedSale.id}</h2>
              <button className="modal-close" onClick={() => setSelectedSale(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p className="input-label">Date</p>
                  <p>{new Date(selectedSale.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="input-label">Payment Method</p>
                  <p>{selectedSale.payment_method}</p>
                </div>
                <div>
                  <p className="input-label">Cashier</p>
                  <p>{selectedSale.cashier_name || selectedSale.user_id}</p>
                </div>
              </div>
              
              <table className="table" style={{ marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.qty}</td>
                      <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>${parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Subtotal:</span>
                    <span>${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Discount:</span>
                    <span>${parseFloat(selectedSale.discount_amount).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Tax:</span>
                    <span>${parseFloat(selectedSale.tax_amount).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.125rem', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    <span>Total:</span>
                    <span className="gradient-text">${parseFloat(selectedSale.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => handleReprint(selectedSale)}>
                <FiPrinter /> Reprint
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setSelectedSale(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
