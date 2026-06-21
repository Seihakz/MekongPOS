const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAll,
  getByKey,
  update,
  uploadLogo,
  deleteLogo
} = require('../controllers/settingsController');

// Public endpoint – no auth required (used by login page, favicon, etc.)
router.get('/public', getAll);

// GET requires authentication
router.get('/', verifyToken, getAll);
router.get('/:key', verifyToken, getByKey);

// PUT requires admin
router.put('/', verifyToken, requireRole('admin'), update);

// Logo upload / remove requires admin
router.post('/logo', verifyToken, requireRole('admin'), upload.single('logo'), uploadLogo);
router.delete('/logo', verifyToken, requireRole('admin'), deleteLogo);

module.exports = router;
