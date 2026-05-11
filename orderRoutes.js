const express = require('express');
const router  = express.Router();
const OrderController   = require('../controllers/orderController');
const PaymentController = require('../controllers/paymentController');

router.post('/',                   OrderController.placeOrder);    // US-03
router.get('/',                    OrderController.getOrders);     // US-04 (cook) ?status=Pending
router.get('/:id',                 OrderController.getOrder);      // Get single order
router.patch('/:id/status',        OrderController.updateStatus);  // US-05 (cook updates)
router.post('/:id/pay',            PaymentController.confirmPayment); // US-06
router.get('/:id/receipt',         PaymentController.getReceipt);    // US-07
router.get('/admin/daily-report',  PaymentController.getDailyReport);// US-08

module.exports = router;
