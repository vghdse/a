const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bugs.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ premiumUsers: [] }, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    addPremium: (userId) => {
        const db = readDB();
        if (!db.premiumUsers.includes(userId)) {
            db.premiumUsers.push(userId);
            writeDB(db);
            return true;
        }
        return false;
    },

    removePremium: (userId) => {
        const db = readDB();
        const index = db.premiumUsers.indexOf(userId);
        if (index !== -1) {
            db.premiumUsers.splice(index, 1);
            writeDB(db);
            return true;
        }
        return false;
    },

    isPremium: (userId) => {
        const db = readDB();
        return db.premiumUsers.includes(userId);
    },

    listPremium: () => {
        const db = readDB();
        return db.premiumUsers;
    }
};
