const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAll,
  getByKey,
  update,
  uploadLogo
} = require('../controllers/settingsController');

// GET requires authentication
router.get('/', verifyToken, getAll);
router.get('/:key', verifyToken, getByKey);

// PUT requires admin
router.put('/', verifyToken, requireRole('admin'), update);

// Logo upload requires admin
router.post('/logo', verifyToken, requireRole('admin'), upload.single('logo'), uploadLogo);

module.exports = router;
