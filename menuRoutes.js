const express = require('express');
const router  = express.Router();
const MenuController = require('../controllers/menuController');

router.get('/',         MenuController.getMenu);     // Browse all pizzas (US-02)
router.get('/:id',      MenuController.getPizza);    // Get single pizza
router.post('/',        MenuController.addPizza);    // Admin: add pizza
router.put('/:id',      MenuController.updatePizza); // Admin: edit pizza
router.delete('/:id',   MenuController.deletePizza); // Admin: remove pizza

module.exports = router;
