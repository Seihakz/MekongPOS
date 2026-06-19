const { pool } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [todaySales] = await pool.query(
      `SELECT
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM sales
       WHERE DATE(created_at) = CURDATE()`
    );

    const [productCount] = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE is_active = TRUE'
    );

    const [lowStockCount] = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE is_active = TRUE AND stock_qty <= min_stock'
    );

    const [customerCount] = await pool.query(
      'SELECT COUNT(*) AS total FROM customers WHERE is_active = TRUE'
    );

    const [todayItemsSold] = await pool.query(
      `SELECT COALESCE(SUM(si.qty), 0) AS total_items
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) = CURDATE()`
    );

    res.json({
      success: true,
      data: {
        today_sales: todaySales[0].total_sales,
        today_revenue: parseFloat(todaySales[0].total_revenue),
        total_products: productCount[0].total,
        low_stock_count: lowStockCount[0].total,
        total_customers: customerCount[0].total,
        today_items_sold: todayItemsSold[0].total_items
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const [summary] = await pool.query(
      `SELECT
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(discount_amount), 0) AS total_discount,
         COALESCE(SUM(tax_amount), 0) AS total_tax
       FROM sales
       WHERE DATE(created_at) = ?`,
      [targetDate]
    );

    const [itemsSold] = await pool.query(
      `SELECT COALESCE(SUM(si.qty), 0) AS total_items
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) = ?`,
      [targetDate]
    );

    const [topProducts] = await pool.query(
      `SELECT si.product_name, SUM(si.qty) AS total_qty, SUM(si.total) AS total_revenue
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) = ?
       GROUP BY si.product_id, si.product_name
       ORDER BY total_qty DESC
       LIMIT 10`,
      [targetDate]
    );

    const [salesByHour] = await pool.query(
      `SELECT HOUR(created_at) AS hour, COUNT(*) AS sales_count, SUM(total_amount) AS revenue
       FROM sales
       WHERE DATE(created_at) = ?
       GROUP BY HOUR(created_at)
       ORDER BY hour`,
      [targetDate]
    );

    res.json({
      success: true,
      data: {
        date: targetDate,
        summary: {
          ...summary[0],
          total_revenue: parseFloat(summary[0].total_revenue),
          total_discount: parseFloat(summary[0].total_discount),
          total_tax: parseFloat(summary[0].total_tax),
          total_items: itemsSold[0].total_items
        },
        top_products: topProducts,
        sales_by_hour: salesByHour
      }
    });
  } catch (error) {
    console.error('Daily sales error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;
    let targetYear = year || new Date().getFullYear();
    let targetMonth = month || (new Date().getMonth() + 1);

    // Handle YYYY-MM format (e.g. "2026-06") from HTML <input type="month">
    if (month && typeof month === 'string' && month.includes('-')) {
      const parts = month.split('-');
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10);
    }

    const [dailyData] = await pool.query(
      `SELECT
         DATE(created_at) AS date,
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(discount_amount), 0) AS total_discount
       FROM sales
       WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [targetYear, targetMonth]
    );

    const [monthlySummary] = await pool.query(
      `SELECT
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(discount_amount), 0) AS total_discount,
         COALESCE(SUM(tax_amount), 0) AS total_tax,
         COALESCE(AVG(total_amount), 0) AS avg_sale_amount
       FROM sales
       WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
      [targetYear, targetMonth]
    );

    res.json({
      success: true,
      data: {
        year: parseInt(targetYear, 10),
        month: parseInt(targetMonth, 10),
        summary: {
          ...monthlySummary[0],
          total_revenue: parseFloat(monthlySummary[0].total_revenue),
          total_discount: parseFloat(monthlySummary[0].total_discount),
          total_tax: parseFloat(monthlySummary[0].total_tax),
          avg_sale_amount: parseFloat(monthlySummary[0].avg_sale_amount)
        },
        daily_breakdown: dailyData
      }
    });
  } catch (error) {
    console.error('Monthly sales error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const { period = '30', limit = '10', sort_by = 'revenue' } = req.query;
    let days = parseInt(period, 10);
    if (isNaN(days)) {
      if (period === 'month') days = 30;
      else if (period === 'week') days = 7;
      else if (period === 'year') days = 365;
      else days = 30;
    }
    const resultLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const orderField = sort_by === 'revenue' ? 'total_revenue' : 'total_qty';

    const [products] = await pool.query(
      `SELECT
         si.product_id,
         si.product_name,
         SUM(si.qty) AS total_qty,
         SUM(si.total) AS total_revenue,
         COUNT(DISTINCT si.sale_id) AS times_sold
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY si.product_id, si.product_name
       ORDER BY ${orderField} DESC
       LIMIT ?`,
      [days, resultLimit]
    );

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getSalesByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date and end_date are required.'
      });
    }

    const [summary] = await pool.query(
      `SELECT
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(subtotal), 0) AS total_subtotal,
         COALESCE(SUM(discount_amount), 0) AS total_discount,
         COALESCE(SUM(tax_amount), 0) AS total_tax,
         COALESCE(AVG(total_amount), 0) AS avg_sale_amount,
         COALESCE(MAX(total_amount), 0) AS max_sale,
         COALESCE(MIN(total_amount), 0) AS min_sale
       FROM sales
       WHERE DATE(created_at) BETWEEN ? AND ?`,
      [start_date, end_date]
    );

    const [dailyBreakdown] = await pool.query(
      `SELECT
         DATE(created_at) AS date,
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM sales
       WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [start_date, end_date]
    );

    res.json({
      success: true,
      data: {
        start_date,
        end_date,
        summary: {
          ...summary[0],
          total_revenue: parseFloat(summary[0].total_revenue),
          total_subtotal: parseFloat(summary[0].total_subtotal),
          total_discount: parseFloat(summary[0].total_discount),
          total_tax: parseFloat(summary[0].total_tax),
          avg_sale_amount: parseFloat(summary[0].avg_sale_amount),
          max_sale: parseFloat(summary[0].max_sale),
          min_sale: parseFloat(summary[0].min_sale)
        },
        daily_breakdown: dailyBreakdown
      }
    });
  } catch (error) {
    console.error('Sales by date range error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getSalesByPaymentMethod = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    const [data] = await pool.query(
      `SELECT
         payment_method,
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM sales
       ${whereClause}
       GROUP BY payment_method
       ORDER BY total_revenue DESC`,
      params
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error('Sales by payment method error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getSalesByCashier = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(s.created_at) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(s.created_at) <= ?';
      params.push(end_date);
    }

    const [data] = await pool.query(
      `SELECT
         s.user_id,
         u.full_name AS cashier_name,
         COUNT(*) AS total_sales,
         COALESCE(SUM(s.total_amount), 0) AS total_revenue,
         COALESCE(AVG(s.total_amount), 0) AS avg_sale_amount
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       GROUP BY s.user_id, u.full_name
       ORDER BY total_revenue DESC`,
      params
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error('Sales by cashier error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getDashboardStats,
  getDailySales,
  getMonthlySales,
  getTopProducts,
  getSalesByDateRange,
  getSalesByPaymentMethod,
  getSalesByCashier
};
