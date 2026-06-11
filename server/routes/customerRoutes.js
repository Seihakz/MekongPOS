const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  remove,
  validateCustomer
} = require('../controllers/customerController');

// All customer routes require authentication
router.use(verifyToken);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', validateCustomer, create);
router.put('/:id', validateCustomer, update);
router.delete('/:id', remove);

module.exports = router;
