const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  login,
  getMe,
  changePassword,
  validateLogin,
  validateChangePassword
} = require('../controllers/authController');

// Public
router.post('/login', validateLogin, login);

// Protected
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, validateChangePassword, changePassword);

module.exports = router;
