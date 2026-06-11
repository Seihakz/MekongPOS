const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAll,
  getById,
  getByBarcode,
  create,
  update,
  remove,
  getLowStock,
  validateProduct
} = require('../controllers/productController');

// Public GET routes (for POS)
router.get('/', getAll);
router.get('/low-stock', getLowStock);
router.get('/barcode/:barcode', getByBarcode);
router.get('/:id', getById);

// Admin-only mutations
router.post('/', verifyToken, requireRole('admin'), upload.single('image'), validateProduct, create);
router.put('/:id', verifyToken, requireRole('admin'), upload.single('image'), update);
router.delete('/:id', verifyToken, requireRole('admin'), remove);

module.exports = router;
