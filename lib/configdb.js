const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'botdata.db');
const db = new sqlite3.Database(dbPath);

const defaults = {
    BOT_IMAGE: 'https://i.postimg.cc/XNTmcqZ3/subzero-menu.png',
    OWNER_NAME: 'Mr Frank',
    BOT_NAME: 'SUBZERO-MD',
    PREFIX: '.'
};

// Initialize DB only after setup is guaranteed
function initDB(callback) {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)`, [], (err) => {
            if (err) return console.error('Table creation error:', err);

            const insert = db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
            for (const [key, value] of Object.entries(defaults)) {
                insert.run(key, value);
            }
            insert.finalize();

            if (callback) callback();
        });
    });
}

function getConfig(key) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT value FROM config WHERE key = ?`, [key], (err, row) => {
            if (err) return reject(err);
            resolve(row?.value || defaults[key] || null);
        });
    });
}

function setConfig(key, value) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, [key, value], function (err) {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

// Call this at app start
initDB(() => {
    console.log('Database initialized.');
});

module.exports = { getConfig, setConfig };
