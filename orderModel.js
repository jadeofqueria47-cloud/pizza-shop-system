const db = require('../config/db');

const SIZE_MULT  = { Small: 1.0, Medium: 1.25, Large: 1.5 };
const TOPPING_PRICE = 20;

const OrderModel = {
  getAll: (status) => {
    const sql = status
      ? `SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.status=? ORDER BY o.created_at DESC`
      : `SELECT o.*, c.name as customer_name FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC`;
    return db.query(sql, status ? [status] : []);
  },

  getById: async (id) => {
    const [[order]] = await db.query(
      `SELECT o.*, c.name as customer_name, c.email as customer_email
       FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=?`, [id]);
    if (!order) return null;

    const [items] = await db.query(
      `SELECT oi.*, p.name as pizza_name, p.description
       FROM order_items oi JOIN pizzas p ON p.id=oi.pizza_id WHERE oi.order_id=?`, [id]);

    order.items = items.map(i => ({ ...i, toppings: JSON.parse(i.toppings || '[]') }));
    return order;
  },

  create: async (customerId, deliveryAddress, items, notes) => {
    const conn = await (require('../config/db')).getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO orders (customer_id, delivery_address, notes) VALUES (?,?,?)',
        [customerId, deliveryAddress, notes || null]);
      const orderId = result.insertId;

      let total = 0;
      for (const item of items) {
        const [[pizza]] = await conn.query('SELECT * FROM pizzas WHERE id=?', [item.pizza_id]);
        if (!pizza) throw new Error(`Pizza id ${item.pizza_id} not found`);
        const toppings = item.toppings || [];
        const unit = Math.round(pizza.base_price * SIZE_MULT[item.size] + toppings.length * TOPPING_PRICE);
        const subtotal = unit * item.quantity;
        await conn.query(
          'INSERT INTO order_items (order_id, pizza_id, size, quantity, toppings, unit_price, subtotal) VALUES (?,?,?,?,?,?,?)',
          [orderId, item.pizza_id, item.size, item.quantity, JSON.stringify(toppings), unit, subtotal]);
        total += subtotal;
      }

      await conn.query('UPDATE orders SET total_amount=? WHERE id=?', [total, orderId]);
      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  updateStatus: (id, status) =>
    db.query('UPDATE orders SET status=? WHERE id=?', [status, id]),

  // Admin daily report
  getDailyReport: async () => {
    const [[revenue]] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE DATE(created_at) = CURDATE()`
    );

    const [[counts]] = await db.query(
      `SELECT
         COUNT(*) AS total_orders,
         SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS paid,
         SUM(CASE WHEN status NOT IN ('Delivered', 'Out for Delivery') THEN 1 ELSE 0 END) AS pending
       FROM orders
       WHERE DATE(created_at) = CURDATE()`
    );

    return {
      revenue: revenue.revenue,
      orders: counts.total_orders,
      paid: counts.paid,
      pending: counts.pending,
    };
  },
};

module.exports = OrderModel;