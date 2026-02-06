const fs = require('fs-extra');
const path = require('path');

// Storage is now in storage/ directory at root
const STORAGE_BASE = path.join(__dirname, '../../storage');
const SITES_DIR = path.join(STORAGE_BASE, 'sites');
const UPLOADS_DIR = path.join(STORAGE_BASE, 'uploads');
const DATA_DIR = path.join(STORAGE_BASE, 'data');

/**
 * Stores the combined HTML file in a unique directory.
 * @param {string} siteId - Unique ID for the site
 * @param {string} htmlContent - The complete HTML content
 * @returns {Promise<string>} - The absolute path to the stored file
 */
async function storeSite(siteId, htmlContent) {
    const siteDir = path.join(SITES_DIR, siteId);
    await fs.ensureDir(siteDir);
    
    const filePath = path.join(siteDir, 'index.html');
    await fs.writeFile(filePath, htmlContent, 'utf8');
    
    return filePath;
}

module.exports = { storeSite, SITES_DIR, UPLOADS_DIR, DATA_DIR };
