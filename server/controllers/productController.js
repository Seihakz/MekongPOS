const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

const getAll = async (req, res) => {
  try {
    const {
      search = '',
      category_id,
      page = 1,
      limit = 20,
      sort = 'name',
      order = 'ASC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const allowedSorts = ['name', 'sell_price', 'stock_qty', 'created_at', 'barcode'];
    const sortField = allowedSorts.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category_id) {
      whereClause += ' AND p.category_id = ?';
      params.push(parseInt(category_id, 10));
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get products
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.barcode = ? AND p.is_active = TRUE`,
      [barcode]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { barcode, name, description, category_id, cost_price, sell_price, stock_qty, min_stock, unit } = req.body;

    let image_url = null;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO products (barcode, name, description, category_id, cost_price, sell_price, stock_qty, min_stock, unit, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        barcode || null,
        name,
        description || null,
        category_id || null,
        cost_price || 0,
        sell_price,
        stock_qty || 0,
        min_stock || 10,
        unit || 'pcs',
        image_url
      ]
    );

    const [newProduct] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Barcode already exists.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ? AND is_active = TRUE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { barcode, name, description, category_id, cost_price, sell_price, stock_qty, min_stock, unit } = req.body;

    let image_url = existing[0].image_url;
    if (req.file) {
      if (existing[0].image_url) {
        const oldPath = path.join(__dirname, '..', existing[0].image_url);
        fs.unlink(oldPath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Failed to delete old image:', err);
        });
      }
      image_url = `/uploads/products/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE products SET
        barcode = ?,
        name = ?,
        description = ?,
        category_id = ?,
        cost_price = ?,
        sell_price = ?,
        stock_qty = ?,
        min_stock = ?,
        unit = ?,
        image_url = ?
       WHERE id = ?`,
      [
        barcode !== undefined ? barcode : existing[0].barcode,
        name || existing[0].name,
        description !== undefined ? description : existing[0].description,
        category_id !== undefined ? category_id : existing[0].category_id,
        cost_price !== undefined ? cost_price : existing[0].cost_price,
        sell_price !== undefined ? sell_price : existing[0].sell_price,
        stock_qty !== undefined ? stock_qty : existing[0].stock_qty,
        min_stock !== undefined ? min_stock : existing[0].min_stock,
        unit !== undefined ? unit : existing[0].unit,
        image_url,
        id
      ]
    );

    const [updated] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Barcode already exists.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ? AND is_active = TRUE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
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

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('sell_price')
    .isFloat({ min: 0 })
    .withMessage('Sell price must be a positive number.')
];

module.exports = {
  getAll,
  getById,
  getByBarcode,
  create,
  update,
  remove,
  getLowStock,
  validateProduct
};
