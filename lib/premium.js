const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bugs.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ premiumUsers: {} }, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getExpiryTime(hours) {
    return Date.now() + (hours * 60 * 60 * 1000);
}

function isExpired(expiry) {
    return expiry && expiry < Date.now();
}

module.exports = {
    addPremium: (userId, hours = 0) => {
        const db = readDB();
        const expiry = hours > 0 ? getExpiryTime(hours) : null;
        
        db.premiumUsers[userId] = {
            added: Date.now(),
            expiry: expiry,
            permanent: hours === 0
        };
        
        writeDB(db);
        return true;
    },

    removePremium: (userId) => {
        const db = readDB();
        if (db.premiumUsers[userId]) {
            delete db.premiumUsers[userId];
            writeDB(db);
            return true;
        }
        return false;
    },

    isPremium: (userId) => {
        const db = readDB();
        const user = db.premiumUsers[userId];
        
        if (!user) return false;
        if (user.expiry && isExpired(user.expiry)) {
            delete db.premiumUsers[userId];
            writeDB(db);
            return false;
        }
        return true;
    },

    listPremium: () => {
        const db = readDB();
        const validUsers = {};
        
        Object.entries(db.premiumUsers).forEach(([userId, data]) => {
            if (!data.expiry || !isExpired(data.expiry)) {
                validUsers[userId] = data;
            } else {
                delete db.premiumUsers[userId];
            }
        });
        
        if (Object.keys(db.premiumUsers).length !== Object.keys(validUsers).length) {
            writeDB(db);
        }
        
        return validUsers;
    },

    getPremiumInfo: (userId) => {
        const db = readDB();
        return db.premiumUsers[userId];
    }
};
