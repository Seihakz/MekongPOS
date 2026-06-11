const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  remove,
  validateCategory
} = require('../controllers/categoryController');

// Public GET routes (for POS)
router.get('/', getAll);
router.get('/:id', getById);

// Admin-only mutations
router.post('/', verifyToken, requireRole('admin'), validateCategory, create);
router.put('/:id', verifyToken, requireRole('admin'), validateCategory, update);
router.delete('/:id', verifyToken, requireRole('admin'), remove);

module.exports = router;
