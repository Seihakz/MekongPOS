const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE is_active = TRUE';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM customers ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [customers] = await pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.json({ success: true, data: customers[0] });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, address } = req.body;

    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone || null, email || null, address || null]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: newCustomer[0]
    });
  } catch (error) {
    console.error('Create customer error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Phone or email already exists.' });
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
    const { name, phone, email, address } = req.body;

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ? AND is_active = TRUE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [
        name || existing[0].name,
        phone !== undefined ? phone : existing[0].phone,
        email !== undefined ? email : existing[0].email,
        address !== undefined ? address : existing[0].address,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Customer updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Phone or email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ? AND is_active = TRUE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query('UPDATE customers SET is_active = FALSE WHERE id = ?', [id]);

    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const validateCustomer = [
  body('name').trim().notEmpty().withMessage('Customer name is required.')
];

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  validateCustomer
};
