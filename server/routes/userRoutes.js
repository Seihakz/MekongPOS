const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
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
} = require('../controllers/userController');

// All user routes require admin
router.use(verifyToken, requireRole('admin'));

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validateCreateUser, create);
router.put('/:id', validateUpdateUser, update);
router.patch('/:id/toggle-active', toggleActive);
router.delete('/:id', deleteUser);
router.put('/:id/reset-password', validateResetPassword, resetPassword);

module.exports = router;
