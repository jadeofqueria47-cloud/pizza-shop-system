const db = require('../config/db');

const MenuModel = {
  getAll: () => db.query('SELECT * FROM pizzas WHERE available = TRUE'),

  getById: (id) => db.query('SELECT * FROM pizzas WHERE id = ?', [id]),

  create: ({ name, description, base_price, image_url }) =>
    db.query('INSERT INTO pizzas (name, description, base_price, image_url) VALUES (?,?,?,?)',
      [name, description, base_price, image_url || null]),

  update: (id, { name, description, base_price, image_url, available }) =>
    db.query('UPDATE pizzas SET name=?, description=?, base_price=?, image_url=?, available=? WHERE id=?',
      [name, description, base_price, image_url, available, id]),

  delete: (id) => db.query('UPDATE pizzas SET available = FALSE WHERE id = ?', [id]),
};

module.exports = MenuModel;
