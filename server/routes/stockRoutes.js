const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  stockIn,
  stockOut,
  adjustment,
  getMovements,
  getLowStock,
  validateStockMovement,
  validateStockAdjustment
} = require('../controllers/stockController');

// All stock routes require admin
router.use(verifyToken, requireRole('admin'));

router.post('/in', validateStockMovement, stockIn);
router.post('/out', validateStockMovement, stockOut);
router.post('/adjustment', validateStockAdjustment, adjustment);
router.get('/movements', getMovements);
router.get('/low-stock', getLowStock);

module.exports = router;
