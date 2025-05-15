/*const Database = require("better-sqlite3");
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
*/

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'botdata.db');
const db = new sqlite3.Database(dbPath);

// Create config table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )
`);

/**
 * Set or update a configuration key-value pair.
 */
function setConfig(key, value) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`,
            [key, value],
            function (err) {
                if (err) return reject(err);
                resolve(true);
            }
        );
    });
}

/**
 * Get a configuration value by key.
 */
function getConfig(key) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT value FROM config WHERE key = ?`,
            [key],
            (err, row) => {
                if (err) return reject(err);
                resolve(row ? row.value : null);
            }
        );
    });
}

/**
 * Get all configuration key-value pairs.
 */
function getAllConfig() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM config`, [], (err, rows) => {
            if (err) return reject(err);
            const result = {};
            for (const row of rows) {
                result[row.key] = row.value;
            }
            resolve(result);
        });
    });
}

module.exports = { setConfig, getConfig, getAllConfig };
