const CustomerModel = require('../models/customerModel');

const CustomerController = {
  // US-01: Register
  register: async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

      const [existing] = await CustomerModel.getByEmail(email);
      if (existing.length)
        return res.status(400).json({ success: false, message: 'Email already registered.' });

      const [result] = await CustomerModel.create({ name, email, password, phone, address });
      res.status(201).json({ success: true, message: 'Account created!', id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // US-01: Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const customer = await CustomerModel.verify(email, password);
      if (!customer)
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });

      const { password: _, ...safe } = customer;
      res.json({ success: true, message: 'Login successful.', data: safe });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // US-01: View profile
  getProfile: async (req, res) => {
    try {
      const [rows] = await CustomerModel.getById(req.params.id);
      if (!rows.length) return res.status(404).json({ success: false, message: 'Customer not found.' });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // US-01: Order history
  getOrders: async (req, res) => {
    try {
      const [rows] = await CustomerModel.getOrders(req.params.id);
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = CustomerController;
