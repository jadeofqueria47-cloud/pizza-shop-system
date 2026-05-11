const db = require('../config/db');
const crypto = require('crypto');

const hash = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

const CustomerModel = {
  getById: (id) =>
    db.query('SELECT id, name, email, phone, address, created_at FROM customers WHERE id = ?', [id]),

  getByEmail: (email) =>
    db.query('SELECT * FROM customers WHERE email = ?', [email]),

  create: ({ name, email, password, phone, address }) =>
    db.query('INSERT INTO customers (name, email, password, phone, address) VALUES (?,?,?,?,?)',
      [name, email, hash(password), phone || null, address || null]),

  verify: async (email, password) => {
    const [rows] = await db.query('SELECT * FROM customers WHERE email = ? AND password = ?',
      [email, hash(password)]);
    return rows[0] || null;
  },

  getOrders: (customerId) =>
    db.query(`SELECT o.*, COUNT(oi.id) as item_count
              FROM orders o
              LEFT JOIN order_items oi ON oi.order_id = o.id
              WHERE o.customer_id = ?
              GROUP BY o.id
              ORDER BY o.created_at DESC`, [customerId]),
};

module.exports = CustomerModel;
