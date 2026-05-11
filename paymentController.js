const db = require('../config/db');
const OrderModel = require('../models/orderModel');

const PaymentController = {
  // US-06: Cashier confirms payment
  confirmPayment: async (req, res) => {
    try {
      const { method, amount_paid, processed_by } = req.body;
      const orderId = req.params.id;

      const order = await OrderModel.getById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      if (order.paid) return res.status(400).json({ success: false, message: 'Order already paid.' });

      const change = Math.max(amount_paid - order.total_amount, 0);
      await db.query(
        'INSERT INTO payments (order_id, method, amount_paid, change_given, processed_by) VALUES (?,?,?,?,?)',
        [orderId, method, amount_paid, change, processed_by || 'Cashier']);
      await db.query("UPDATE orders SET paid=TRUE, status='Out for Delivery' WHERE id=?", [orderId]);

      res.json({ success: true, message: 'Payment confirmed!', change_given: change });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // US-07: Issue receipt
  getReceipt: async (req, res) => {
    try {
      const orderId = req.params.id;
      const [[payment]] = await db.query('SELECT * FROM payments WHERE order_id=?', [orderId]);
      if (!payment) return res.status(404).json({ success: false, message: 'Receipt not found. Order may not be paid yet.' });

      const order = await OrderModel.getById(orderId);
      res.json({
        success: true,
        data: {
          order_id:       order.id,
          customer_name:  order.customer_name,
          delivery_address: order.delivery_address,
          items:          order.items,
          total_amount:   order.total_amount,
          payment_method: payment.method,
          amount_paid:    payment.amount_paid,
          change_given:   payment.change_given,
          processed_by:   payment.processed_by,
          processed_at:   payment.processed_at,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // US-08: Admin daily report
  getDailyReport: async (req, res) => {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];

      const [[{ total_orders }]] = await db.query(
        'SELECT COUNT(*) as total_orders FROM orders WHERE DATE(created_at)=?', [date]);
      const [[{ total_revenue }]] = await db.query(
        'SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM orders WHERE DATE(created_at)=? AND paid=TRUE', [date]);
      const [byStatus] = await db.query(
        'SELECT status, COUNT(*) as count FROM orders WHERE DATE(created_at)=? GROUP BY status', [date]);
      const [topPizzas] = await db.query(
        `SELECT p.name, SUM(oi.quantity) as qty_sold, SUM(oi.subtotal) as revenue
         FROM order_items oi
         JOIN pizzas p ON p.id=oi.pizza_id
         JOIN orders o ON o.id=oi.order_id
         WHERE DATE(o.created_at)=?
         GROUP BY p.name ORDER BY qty_sold DESC LIMIT 6`, [date]);

      res.json({
        success: true,
        data: { date, total_orders, total_revenue, by_status: byStatus, top_pizzas: topPizzas }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = PaymentController;
