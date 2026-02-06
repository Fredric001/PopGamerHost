const app = require('./app');
const { SITES_DIR } = require('./services/storage');
const fs = require('fs-extra');

const PORT = process.env.PORT || 3000;

// Create sites directory if not exists
fs.ensureDirSync(SITES_DIR);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Upload page: http://localhost:${PORT}`);
    console.log(`Deployed sites: http://localhost:${PORT}/sites/site-ID`);
});
