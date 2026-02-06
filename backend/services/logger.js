const db = require('./db');

class Logger {
    info(message, details = null) {
        console.log(`[INFO] ${message}`, details || '');
        db.addLog({ level: 'info', message, details });
    }

    warn(message, details = null) {
        console.warn(`[WARN] ${message}`, details || '');
        db.addLog({ level: 'warn', message, details });
    }

    error(message, error = null) {
        console.error(`[ERROR] ${message}`, error);
        db.addLog({ 
            level: 'error', 
            message, 
            details: error ? (error.message || error.toString()) : null 
        });
    }
}

module.exports = new Logger();
