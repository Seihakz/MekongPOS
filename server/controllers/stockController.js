const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

const stockIn = async (req, res) => {
  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { product_id, qty, reference, note } = req.body;
    const quantity = parseInt(qty, 10);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',
      [product_id]
    );

    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await connection.query(
      'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
      [quantity, product_id]
    );

    await connection.query(
      `INSERT INTO stock_movements (product_id, type, qty, reference, note, user_id)
       VALUES (?, 'in', ?, ?, ?, ?)`,
      [product_id, quantity, reference || null, note || null, req.user.id]
    );

    await connection.commit();

    const [updated] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ?',
      [product_id]
    );

    connection.release();

    res.json({
      success: true,
      message: `Stock increased by ${quantity} for "${products[0].name}".`,
      data: updated[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
      connection.release();
    }
    console.error('Stock in error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const stockOut = async (req, res) => {
  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { product_id, qty, reference, note } = req.body;
    const quantity = parseInt(qty, 10);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',
      [product_id]
    );

    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (products[0].stock_qty < quantity) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${products[0].stock_qty}, Requested: ${quantity}`
      });
    }

    await connection.query(
      'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
      [quantity, product_id]
    );

    await connection.query(
      `INSERT INTO stock_movements (product_id, type, qty, reference, note, user_id)
       VALUES (?, 'out', ?, ?, ?, ?)`,
      [product_id, quantity, reference || null, note || null, req.user.id]
    );

    await connection.commit();

    const [updated] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ?',
      [product_id]
    );

    connection.release();

    res.json({
      success: true,
      message: `Stock decreased by ${quantity} for "${products[0].name}".`,
      data: updated[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
      connection.release();
    }
    console.error('Stock out error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const adjustment = async (req, res) => {
  let connection;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { product_id, qty, reference, note } = req.body;
    const newQty = parseInt(qty, 10);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',
      [product_id]
    );

    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const oldQty = products[0].stock_qty;
    const difference = newQty - oldQty;

    await connection.query(
      'UPDATE products SET stock_qty = ? WHERE id = ?',
      [newQty, product_id]
    );

    await connection.query(
      `INSERT INTO stock_movements (product_id, type, qty, reference, note, user_id)
       VALUES (?, 'adjustment', ?, ?, ?, ?)`,
      [
        product_id,
        difference,
        reference || null,
        note || `Stock adjusted from ${oldQty} to ${newQty}`,
        req.user.id
      ]
    );

    await connection.commit();

    const [updated] = await connection.query(
      'SELECT id, name, stock_qty FROM products WHERE id = ?',
      [product_id]
    );

    connection.release();

    res.json({
      success: true,
      message: `Stock adjusted to ${newQty} for "${products[0].name}" (was ${oldQty}).`,
      data: updated[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
      connection.release();
    }
    console.error('Stock adjustment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getMovements = async (req, res) => {
  try {
    const {
      product_id,
      type,
      start_date,
      end_date,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (product_id) {
      whereClause += ' AND sm.product_id = ?';
      params.push(parseInt(product_id, 10));
    }

    if (type) {
      whereClause += ' AND sm.type = ?';
      params.push(type);
    }

    if (start_date) {
      whereClause += ' AND DATE(sm.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(sm.created_at) <= ?';
      params.push(end_date);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM stock_movements sm ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [movements] = await pool.query(
      `SELECT sm.*, p.name AS product_name, p.barcode, u.full_name AS user_name
       FROM stock_movements sm
       LEFT JOIN products p ON sm.product_id = p.id
       LEFT JOIN users u ON sm.user_id = u.id
       ${whereClause}
       ORDER BY sm.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: movements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getLowStock = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE AND p.stock_qty <= p.min_stock
       ORDER BY p.stock_qty ASC`
    );

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const validateStockMovement = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required.'),
  body('qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1.')
];

const validateStockAdjustment = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required.'),
  body('qty').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater.')
];

module.exports = {
  stockIn,
  stockOut,
  adjustment,
  getMovements,
  getLowStock,
  validateStockMovement,
  validateStockAdjustment
};
