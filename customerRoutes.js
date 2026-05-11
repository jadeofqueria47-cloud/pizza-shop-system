const express = require('express');
const router  = express.Router();
const CustomerController = require('../controllers/customerController');

router.post('/register',          CustomerController.register);   // US-01
router.post('/login',             CustomerController.login);      // US-01
router.get('/:id',                CustomerController.getProfile); // US-01
router.get('/:id/orders',         CustomerController.getOrders);  // US-01 order history

module.exports = router;
