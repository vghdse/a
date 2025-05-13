const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "botdata.db");
const db = new Database(dbPath);

// Create config table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )
`).run();

function setConfig(key, value) {
    db.prepare(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`).run(key, value);
}

function getConfig(key) {
    const row = db.prepare(`SELECT value FROM config WHERE key = ?`).get(key);
    return row?.value || null;
}

function getAllConfig() {
    const rows = db.prepare(`SELECT * FROM config`).all();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

module.exports = { setConfig, getConfig, getAllConfig };
