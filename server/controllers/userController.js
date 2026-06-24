const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password, full_name, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role || 'cashier']
    );

    const [newUser] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
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
    const { username, full_name, role, password } = req.body;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let updateQuery = 'UPDATE users SET username = ?, full_name = ?, role = ?';
    const params = [
      username || existing[0].username,
      full_name || existing[0].full_name,
      role || existing[0].role
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await pool.query(updateQuery, params);

    const [updated] = await pool.query(
      'SELECT id, username, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username already exists.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, username, is_active FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating self
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    }

    const newStatus = !existing[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      data: { id: existing[0].id, is_active: newStatus }
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { new_password } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const validateCreateUser = [
  body('username').trim().notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('full_name').trim().notEmpty().withMessage('Full name is required.'),
  body('role').optional().isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier.')
];

const validateUpdateUser = [
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
  body('role').optional().isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier.'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

const validateResetPassword = [
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
];

module.exports = {
  getAll,
  getById,
  create,
  update,
  toggleActive,
  deleteUser,
  resetPassword,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword
};
