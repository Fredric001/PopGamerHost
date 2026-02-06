const express = require('express');
const path = require('path');
const { combineFiles } = require('../services/combiner');
const { storeSite } = require('../services/storage');
const { backupToGitHub } = require('../services/github');
const db = require('../services/db');
const logger = require('../services/logger');

const router = express.Router();

// No anymore multer middleware needed for this route as we use JSON body


router.post('/', async (req, res) => {
    const start = Date.now();
    
    // Sanitize and generate slug
    const rawName = (req.body.studentName || 'guest').toString();
    const sanitized = rawName.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20) || 'guest';
    const uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
    const siteId = `${sanitized}-${uniqueId}`;
    
    // Initial tracking object
    const fileStats = {
        htmlBytes: req.body.html ? req.body.html.length : 0,
        cssBytes: req.body.css ? req.body.css.length : 0,
        jsBytes: req.body.js ? req.body.js.length : 0,
    };
    
    try {
        // Check maintenance mode
        const settings = await db.getSettings();
        if (settings.maintenanceMode || !settings.uploadsEnabled) {
            return res.status(503).json({ error: 'System is in maintenance mode' });
        }

        const { html, css, js } = req.body;

        if (!html) {
            // Log bad request
            await db.addLog({ level: 'warn', message: 'Deployment attempt without HTML', details: `SiteID: ${siteId}` });
            return res.status(400).json({ error: 'HTML content is required' });
        }

        // Combine contents (now strings)
        const combinedHtml = combineFiles(html, css, js);

        // Store locally
        await storeSite(siteId, combinedHtml);

        // Backup to GitHub (async, don't block response)
        backupToGitHub(siteId, combinedHtml)
            .then(url => {
                if (url) logger.info(`Backed up ${siteId} to GitHub: ${url}`);
            })
            .catch(err => {
                logger.error(`GitHub backup failed for ${siteId}`, err);
            });

        // Return URL
        const protocol = req.protocol;
        const host = req.get('host');
        const deployUrl = `${protocol}://${host}/sites/${siteId}`;
        const duration = Date.now() - start;

        // Log success
        await db.addUpload({
            id: siteId,
            status: 'success',
            url: deployUrl,
            duration: duration,
            size: fileStats.htmlBytes + fileStats.cssBytes + fileStats.jsBytes,
            fileStats,
            clientInfo: {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        });
        
        logger.info(`Deployment successful: ${siteId}`, `Duration: ${duration}ms`);

        res.json({ 
            success: true, 
            siteId, 
            url: deployUrl 
        });

    } catch (error) {
        const duration = Date.now() - start;
        logger.error('Deployment error:', error);
        
        // Log failure
        await db.addUpload({
            id: siteId,
            status: 'failed',
            url: null,
            duration: duration,
            size: 0,
            fileStats,
            clientInfo: {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        res.status(500).json({ error: 'Deployment failed' });
    }
});

module.exports = router;
