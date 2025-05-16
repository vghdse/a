/*
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'botdata.db');
const fs = require('fs');

// Ensure database file exists
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '');

const db = new sqlite3.Database(dbPath);

// Default config values
const defaults = {
    BOT_IMAGE: 'https://i.postimg.cc/XNTmcqZ3/subzero-menu.png',
    OWNER_NAME: 'Mr Frank',
    BOT_NAME: 'SUBZERO-MD',
    PREFIX: '.'
};

// Create table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)`);

    const insert = db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
    for (const [key, value] of Object.entries(defaults)) {
        insert.run([key, value]);
    }
    insert.finalize();
});

// Get a config value (sync style using cache or defaults)
function getConfigSync(key) {
    try {
        const row = db.prepare(`SELECT value FROM config WHERE key = ?`).get(key);
        return row?.value || defaults[key] || null;
    } catch (e) {
        return defaults[key] || null;
    }
}

// Async if needed elsewhere
function getConfig(key) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT value FROM config WHERE key = ?`, [key], (err, row) => {
            if (err) return reject(err);
            resolve(row?.value || defaults[key] || null);
        });
    });
}

// Set/update config
function setConfig(key, value) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`, [key, value], function (err) {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

module.exports = { getConfig, getConfigSync, setConfig };
*/

const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'configdb.json');

// Load config from file
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// Get value
function getConfigSync(key) {
  const config = loadConfig();
  return config[key] || null;
}

// Set value
function setConfig(key, value) {
  return new Promise((resolve, reject) => {
    try {
      const config = loadConfig();
      config[key] = value;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { getConfigSync, setConfig };
