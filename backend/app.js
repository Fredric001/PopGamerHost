const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const deployRoutes = require('./routes/deploy');
const adminRoutes = require('./routes/admin');
const { SITES_DIR } = require('./services/storage');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static files from the frontend directory at the root
// Since app.js is in backend/, we go up one level to find frontend/
const publicPath = path.join(__dirname, '../frontend');
app.use(express.static(publicPath));

// Deployment API
app.use('/deploy', deployRoutes);

// Admin API
app.use('/api/admin', adminRoutes);

// Dashboard Static Files
app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

// Serving generated sites
// URL format: /sites/site-12345
app.use('/sites', express.static(SITES_DIR));

module.exports = app;
