const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const deployRoutes = require('./routes/deploy');
const { SITES_DIR } = require('./services/storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// Subdomain middleware mock for local development
// In production, this would be handled by Nginx/Vercel or explicit subdomain checking
app.use((req, res, next) => {
    // Check if request is for "sites" subdomain or path
    // For local MVP simplicity, we serve sites under /sites path
    // But we can also check host header if we configured /etc/hosts
    if (req.path.startsWith('/sites/')) {
        return next();
    }
    next();
});

// Deployment API
app.use('/deploy', deployRoutes);

// Admin API
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Dashboard Static Files
// Dashboard Static Files
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});


// Serving generated sites
// URL format: /sites/site-12345
app.use('/sites', express.static(SITES_DIR));

// Create sites directory if not exists
fs.ensureDirSync(SITES_DIR);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Upload page: http://localhost:${PORT}`);
    console.log(`Deployed sites: http://localhost:${PORT}/sites/site-ID`);
});
