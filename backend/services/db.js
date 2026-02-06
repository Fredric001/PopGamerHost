const fs = require('fs-extra');
const path = require('path');

const { DATA_DIR } = require('./storage');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure stats structure
const INITIAL_DB = {
    uploads: [], // { id, timestamp, status, url, duration, type (html/css/js counts) }
    logs: [], // { timestamp, level, message, details }
    stats: {
        totalUploads: 0,
        successfulDeployments: 0,
        failedDeployments: 0,
        totalStorageUsed: 0 // bytes
    },
    settings: {
        maintenanceMode: false,
        uploadsEnabled: true
    }
};

class DBService {
    constructor() {
        this.ensureDb();
    }

    async ensureDb() {
        try {
            await fs.ensureFile(DB_PATH);
            const exists = await fs.pathExists(DB_PATH);
            if (!exists) {
                await fs.writeJson(DB_PATH, INITIAL_DB, { spaces: 2 });
            } else {
                // Check if empty
                const content = await fs.readFile(DB_PATH, 'utf8');
                if (!content.trim()) {
                    await fs.writeJson(DB_PATH, INITIAL_DB, { spaces: 2 });
                }
            }
        } catch (err) {
            console.error('Database initialization failed:', err);
        }
    }

    async read() {
        try {
            return await fs.readJson(DB_PATH);
        } catch (err) {
            // If file doesn't exist or is corrupt, return initial state
            return { ...INITIAL_DB };
        }
    }

    async write(data) {
        await fs.writeJson(DB_PATH, data, { spaces: 2 });
    }

    async addUpload(uploadData) {
        const db = await this.read();
        const upload = {
            id: uploadData.id,
            timestamp: new Date().toISOString(),
            status: uploadData.status || 'pending',
            url: uploadData.url,
            duration: uploadData.duration || 0,
            fileStats: uploadData.fileStats || {},
            clientInfo: uploadData.clientInfo || {}
        };
        
        db.uploads.unshift(upload); // Add to beginning
        // Keep only last 1000 uploads
        if (db.uploads.length > 1000) db.uploads = db.uploads.slice(0, 1000);

        // Update stats
        db.stats.totalUploads++;
        if (upload.status === 'success') db.stats.successfulDeployments++;
        else db.stats.failedDeployments++;

        if (uploadData.size) db.stats.totalStorageUsed += uploadData.size;

        await this.write(db);
        return upload;
    }

    async addLog(logData) {
        const db = await this.read();
        const log = {
            timestamp: new Date().toISOString(),
            level: logData.level || 'info', // info, warn, error
            message: logData.message,
            details: logData.details || null
        };

        db.logs.unshift(log);
        if (db.logs.length > 2000) db.logs = db.logs.slice(0, 2000);

        await this.write(db);
    }

    async getStats() {
        const db = await this.read();
        
        // Calculate daily stats on the fly or improved later
        const today = new Date().toISOString().split('T')[0];
        const todayUploads = db.uploads.filter(u => u.timestamp.startsWith(today)).length;

        return {
            ...db.stats,
            deploymentsToday: todayUploads
        };
    }

    async getUploads(limit = 50, offset = 0) {
        const db = await this.read();
        return {
            total: db.uploads.length,
            items: db.uploads.slice(offset, offset + limit)
        };
    }

    async getLogs(limit = 100) {
        const db = await this.read();
        return db.logs.slice(0, limit);
    }

    async updateSettings(newSettings) {
        const db = await this.read();
        db.settings = { ...db.settings, ...newSettings };
        await this.write(db);
        return db.settings;
    }

     async getSettings() {
        const db = await this.read();
        return db.settings || { ...INITIAL_DB.settings };
    }
}

module.exports = new DBService();
