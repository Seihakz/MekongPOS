const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  create,
  getAll,
  getById,
  getToday,
  validateSale
} = require('../controllers/saleController');

// All sale routes require authentication
router.use(verifyToken);

router.post('/', validateSale, create);
router.get('/', getAll);
router.get('/today', getToday);
router.get('/:id', getById);

module.exports = router;
