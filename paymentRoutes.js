const express = require('express');
const router  = express.Router();
const PaymentController = require('../controllers/paymentController');

// US-08: Admin daily report (also accessible via /api/orders/admin/daily-report)
router.get('/daily-report', PaymentController.getDailyReport);

module.exports = router;
