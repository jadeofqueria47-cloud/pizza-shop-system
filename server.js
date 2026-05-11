const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../files')));

// API Routes
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const customerRoutes = require('./customerRoutes');
const paymentRoutes = require('./paymentRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

// Fallback — serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../files', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🍕 Pizza Shop server running at http://localhost:${PORT}`);
});