const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// Root Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;
