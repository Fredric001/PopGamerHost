const express = require('express');
const router = express.Router();
const db = require('../services/db');
const logger = require('../services/logger');

// Middleware to ensure admin access (if we added auth later)
// For now, it's public as per requirements ("read-only by default", "no login for guests")
// Ideally we would add basic auth or IP restriction here.

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json(stats);
    } catch (err) {
        logger.error('Failed to get stats', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/uploads
router.get('/uploads', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const data = await db.getUploads(limit, offset);
        res.json(data);
    } catch (err) {
        logger.error('Failed to get uploads', err);
        res.status(500).json({ error: 'Failed to fetch uploads' });
    }
});

// GET /api/admin/logs
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await db.getLogs(limit);
        res.json(logs);
    } catch (err) {
        logger.error('Failed to get logs', err);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// POST /api/admin/settings
router.post('/settings', async (req, res) => {
    try {
        const settings = req.body;
        const updated = await db.updateSettings(settings);
        logger.info('Admin settings updated', JSON.stringify(settings));
        res.json(updated);
    } catch (err) {
        logger.error('Failed to update settings', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await db.getSettings();
        res.json(settings);
    } catch (err) {
        logger.error('Failed to get settings', err);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

module.exports = router;
