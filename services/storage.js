const fs = require('fs-extra');
const path = require('path');

const SITES_DIR = path.join(__dirname, '../sites');

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

module.exports = { storeSite, SITES_DIR };
