const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'bugs.json');

class PremiumDB {
    constructor() {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, '{"premiumUsers":{}}');
        }
        this.db = JSON.parse(fs.readFileSync(DB_PATH));
    }

    #save() {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2));
    }

    add(userId, hours = 0) {
        this.db.premiumUsers[userId] = {
            added: Date.now(),
            expiry: hours ? Date.now() + (hours * 60 * 60 * 1000) : null,
            permanent: !hours
        };
        this.#save();
        return true;
    }

    remove(userId) {
        if (!this.db.premiumUsers[userId]) return false;
        delete this.db.premiumUsers[userId];
        this.#save();
        return true;
    }

    has(userId) {
        const user = this.db.premiumUsers[userId];
        if (!user) return false;
        
        if (user.expiry && user.expiry < Date.now()) {
            this.remove(userId);
            return false;
        }
        return true;
    }

    list() {
        // Clean expired users first
        Object.keys(this.db.premiumUsers).forEach(userId => this.has(userId));
        return this.db.premiumUsers;
    }
}

module.exports = new PremiumDB();
