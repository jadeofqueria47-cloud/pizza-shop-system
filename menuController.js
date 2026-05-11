const MenuModel = require('../models/menuModel');

const MenuController = {
  // US-02: Browse menu
  getMenu: async (req, res) => {
    try {
      const [rows] = await MenuModel.getAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getPizza: async (req, res) => {
    try {
      const [rows] = await MenuModel.getById(req.params.id);
      if (!rows.length) return res.status(404).json({ success: false, message: 'Pizza not found.' });
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  addPizza: async (req, res) => {
    try {
      const [result] = await MenuModel.create(req.body);
      res.status(201).json({ success: true, message: 'Pizza added.', id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updatePizza: async (req, res) => {
    try {
      await MenuModel.update(req.params.id, req.body);
      res.json({ success: true, message: 'Pizza updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deletePizza: async (req, res) => {
    try {
      await MenuModel.delete(req.params.id);
      res.json({ success: true, message: 'Pizza removed from menu.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = MenuController;
