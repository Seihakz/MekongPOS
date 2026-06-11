const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getAll,
  getByKey,
  update
} = require('../controllers/settingsController');

// GET requires authentication
router.get('/', verifyToken, getAll);
router.get('/:key', verifyToken, getByKey);

// PUT requires admin
router.put('/', verifyToken, requireRole('admin'), update);

module.exports = router;
