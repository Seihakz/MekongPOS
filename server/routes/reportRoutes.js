const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getDashboardStats,
  getDailySales,
  getMonthlySales,
  getTopProducts,
  getSalesByDateRange,
  getSalesByPaymentMethod,
  getSalesByCashier
} = require('../controllers/reportController');

// All report routes require admin
router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/daily', getDailySales);
router.get('/monthly', getMonthlySales);
router.get('/top-products', getTopProducts);
router.get('/date-range', getSalesByDateRange);
router.get('/by-payment-method', getSalesByPaymentMethod);
router.get('/by-cashier', getSalesByCashier);

module.exports = router;
