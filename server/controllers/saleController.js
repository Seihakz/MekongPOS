const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

/**
 * Generate next invoice number: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = async (connection) => {
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  const prefix = `INV-${dateStr}-`;

  const [rows] = await connection.query(
    `SELECT invoice_number FROM sales
     WHERE invoice_number LIKE ?
     ORDER BY invoice_number DESC
     LIMIT 1
     FOR UPDATE`,
    [`${prefix}%`]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const lastNum = rows[0].invoice_number;
    const lastSeq = parseInt(lastNum.split('-')[2], 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};

const create = async (req, res) => {
  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      items,
      customer_id,
      discount_type = 'fixed',
      discount_value = 0,
      tax_rate,
      payment_method = 'cash',
      amount_paid,
      note
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must have at least one item.' });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Get tax rate from settings if not provided
    let effectiveTaxRate = tax_rate;
    if (effectiveTaxRate === undefined || effectiveTaxRate === null) {
      const [settings] = await connection.query(
        "SELECT setting_value FROM settings WHERE setting_key = 'tax_rate'"
      );
      effectiveTaxRate = settings.length > 0 ? parseFloat(settings[0].setting_value) : 10;
    }

    // Validate and calculate items
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, barcode, name, sell_price, stock_qty FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product_id} not found.`
        });
      }

      const product = products[0];
      const qty = parseInt(item.qty, 10);
      const unitPrice = item.unit_price !== undefined ? parseFloat(item.unit_price) : parseFloat(product.sell_price);
      const itemDiscount = item.discount ? parseFloat(item.discount) : 0;

      if (isNaN(unitPrice) || unitPrice < 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Invalid unit price for product "${product.name}".`
        });
      }

      if (isNaN(itemDiscount) || itemDiscount < 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Invalid discount for product "${product.name}".`
        });
      }

      if (qty <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`
        });
      }

      if (product.stock_qty < qty) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, Requested: ${qty}`
        });
      }

      const itemTotal = (unitPrice * qty) - itemDiscount;
      subtotal += itemTotal;

      saleItems.push({
        product_id: product.id,
        product_name: product.name,
        barcode: product.barcode,
        qty,
        unit_price: unitPrice,
        discount: itemDiscount,
        total: itemTotal
      });
    }

    // Calculate discount
    let discountAmount = 0;
    const parsedDiscountValue = parseFloat(discount_value) || 0;

    if (parsedDiscountValue < 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Discount value cannot be negative.' });
    }

    if (discount_type === 'percentage') {
      if (parsedDiscountValue > 100) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100.' });
      }
      discountAmount = subtotal * (parsedDiscountValue / 100);
    } else {
      discountAmount = parsedDiscountValue;
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (parseFloat(effectiveTaxRate) / 100);
    const totalAmount = afterDiscount + taxAmount;

    const paidAmount = parseFloat(amount_paid);
    if (isNaN(paidAmount) || paidAmount < totalAmount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Total: $${totalAmount.toFixed(2)}, Paid: $${isNaN(paidAmount) ? '0.00' : paidAmount.toFixed(2)}`
      });
    }

    const changeAmount = paidAmount - totalAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(connection);

    // Insert sale
    const [saleResult] = await connection.query(
      `INSERT INTO sales (invoice_number, user_id, customer_id, subtotal, discount_type, discount_value, discount_amount, tax_rate, tax_amount, total_amount, amount_paid, change_amount, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        req.user.id,
        customer_id || null,
        subtotal,
        discount_type,
        discount_value,
        discountAmount,
        effectiveTaxRate,
        taxAmount,
        totalAmount,
        paidAmount,
        changeAmount,
        payment_method,
        note || null
      ]
    );

    const saleId = saleResult.insertId;

    // Insert sale items, deduct stock, record stock movements
    for (const item of saleItems) {
      await connection.query(
        `INSERT INTO sale_items (sale_id, product_id, product_name, barcode, qty, unit_price, discount, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [saleId, item.product_id, item.product_name, item.barcode, item.qty, item.unit_price, item.discount, item.total]
      );

      await connection.query(
        'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
        [item.qty, item.product_id]
      );

      await connection.query(
        `INSERT INTO stock_movements (product_id, type, qty, reference, note, user_id)
         VALUES (?, 'sale', ?, ?, ?, ?)`,
        [item.product_id, item.qty, invoiceNumber, `Sale: ${item.product_name} x${item.qty}`, req.user.id]
      );
    }

    await connection.commit();

    // Fetch the complete sale data
    const [sale] = await connection.query(
      `SELECT s.*, u.full_name AS cashier_name, cu.name AS customer_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN customers cu ON s.customer_id = cu.id
       WHERE s.id = ?`,
      [saleId]
    );

    const [saleItemsResult] = await connection.query(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [saleId]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Sale completed successfully.',
      data: {
        ...sale[0],
        items: saleItemsResult
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
      connection.release();
    }
    console.error('Create sale error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      start_date,
      end_date,
      payment_method,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Cashier can only see their own sales
    if (req.user.role === 'cashier') {
      whereClause += ' AND s.user_id = ?';
      params.push(req.user.id);
    }

    if (start_date) {
      whereClause += ' AND DATE(s.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(s.created_at) <= ?';
      params.push(end_date);
    }

    if (payment_method) {
      whereClause += ' AND s.payment_method = ?';
      params.push(payment_method);
    }

    if (search) {
      whereClause += ' AND (s.invoice_number LIKE ? OR cu.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM sales s LEFT JOIN customers cu ON s.customer_id = cu.id ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [sales] = await pool.query(
      `SELECT s.*, u.full_name AS cashier_name, cu.name AS customer_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN customers cu ON s.customer_id = cu.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: sales,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = `SELECT s.*, u.full_name AS cashier_name, cu.name AS customer_name
                 FROM sales s
                 LEFT JOIN users u ON s.user_id = u.id
                 LEFT JOIN customers cu ON s.customer_id = cu.id
                 WHERE s.id = ?`;
    const params = [id];

    // Cashier can only see their own sales
    if (req.user.role === 'cashier') {
      query += ' AND s.user_id = ?';
      params.push(req.user.id);
    }

    const [sales] = await pool.query(query, params);

    if (sales.length === 0) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    const [items] = await pool.query('SELECT * FROM sale_items WHERE sale_id = ?', [id]);

    res.json({
      success: true,
      data: {
        ...sales[0],
        items
      }
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getToday = async (req, res) => {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, u.full_name AS cashier_name, cu.name AS customer_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN customers cu ON s.customer_id = cu.id
       WHERE DATE(s.created_at) = CURDATE() AND s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    const [summary] = await pool.query(
      `SELECT
         COUNT(*) AS total_sales,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(SUM(discount_amount), 0) AS total_discount,
         COALESCE(SUM(tax_amount), 0) AS total_tax
       FROM sales
       WHERE DATE(created_at) = CURDATE() AND user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        sales,
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Get today sales error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const validateSale = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required.'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('amount_paid').isFloat({ min: 0 }).withMessage('Amount paid must be a positive number.'),
  body('payment_method').optional().isIn(['cash', 'card', 'qr', 'other']).withMessage('Invalid payment method.')
];

module.exports = {
  create,
  getAll,
  getById,
  getToday,
  validateSale
};
