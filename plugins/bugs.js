const { cmd } = require("../command");
const config = require("../config");
const fs = require('fs');
const path = require('path');

// Database Setup
const DB_PATH = path.join(__dirname, '../lib/bugs.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ premiumUsers: {} }, null, 2));
}

// Premium Manager Functions
const premium = {
    add: (userId, hours = 0) => {
        const db = JSON.parse(fs.readFileSync(DB_PATH));
        const expiry = hours > 0 ? Date.now() + (hours * 60 * 60 * 1000) : null;
        
        db.premiumUsers[userId] = {
            added: Date.now(),
            expiry: expiry,
            permanent: hours === 0
        };
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
        return true;
    },

    remove: (userId) => {
        const db = JSON.parse(fs.readFileSync(DB_PATH));
        if (db.premiumUsers[userId]) {
            delete db.premiumUsers[userId];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            return true;
        }
        return false;
    },

    check: (userId) => {
        const db = JSON.parse(fs.readFileSync(DB_PATH));
        const user = db.premiumUsers[userId];
        
        if (!user) return false;
        if (user.expiry && user.expiry < Date.now()) {
            delete db.premiumUsers[userId];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            return false;
        }
        return true;
    },

    list: () => {
        const db = JSON.parse(fs.readFileSync(DB_PATH));
        return db.premiumUsers;
    }
};

// Helper Functions
function getMentionedUser(m) {
    return m.mentions?.[0] || m.quoted?.sender;
}

function formatTime(ms) {
    const hours = Math.ceil(ms / (1000 * 60 * 60));
    return `${hours} hour(s)`;
}

// ==================== COMMAND HANDLERS ====================

// [NEW] Delete Premium Command
cmd({
    pattern: "delpremium",
    alias: ["removebug"],
    desc: "Remove premium access",
    category: "owner",
    fromMe: true,
    filename: __filename
}, async (m, { reply }) => {
    const user = getMentionedUser(m);
    if (!user) return reply("❌ Mention or quote a user to remove");
    
    if (premium.remove(user)) {
        await reply(`🗑️ Removed @${user.split('@')[0]} from premium`, { mentions: [user] });
    } else {
        await reply(`❌ @${user.split('@')[0]} wasn't premium user`, { mentions: [user] });
    }
});

// Add Premium Command
cmd({
    pattern: "addpremium",
    alias: ["addbug"],
    desc: "Add premium access\n.addpremium @user 24",
    category: "owner",
    fromMe: true,
    filename: __filename
}, async (m, { reply, args }) => {
    const user = getMentionedUser(m);
    if (!user) return reply("❌ Mention or quote a user");
    
    const hours = parseInt(args[1]) || 0;
    premium.add(user, hours);
    
    let msg = `✅ @${user.split('@')[0]} got premium access`;
    if (hours > 0) msg += ` for ${hours} hours`;
    await reply(msg, { mentions: [user] });
});

// Premium Status Command
cmd({
    pattern: "bugaccess",
    alias: ["mypremium"],
    desc: "Check your premium status",
    category: "general",
    filename: __filename
}, async (m, { reply, sender }) => {
    if (!premium.check(sender)) return reply("❌ You don't have premium access");
    
    const user = premium.list()[sender];
    let msg = `🌟 *Your Premium Status*\n\n`;
    msg += `• Added: ${new Date(user.added).toLocaleString()}\n`;
    
    if (user.permanent) {
        msg += `• Type: Permanent access\n`;
    } else {
        msg += `• Expires: ${new Date(user.expiry).toLocaleString()}\n`;
        msg += `• Remaining: ${formatTime(user.expiry - Date.now())}\n`;
    }
    
    await reply(msg);
});

// List Premium Users Command
cmd({
    pattern: "listpremium",
    alias: ["listbug"],
    desc: "List all premium users",
    category: "owner",
    fromMe: true,
    filename: __filename
}, async (m, { reply }) => {
    const users = premium.list();
    if (Object.keys(users).length === 0) return reply("🔍 No premium users found");
    
    let msg = "📜 *Premium Users List*\n\n";
    Object.entries(users).forEach(([userId, data], index) => {
        const status = data.permanent ? "Permanent" : `Expires in ${formatTime(data.expiry - Date.now())}`;
        msg += `${index + 1}. @${userId.split('@')[0]} - ${status}\n`;
    });
    
    await reply(msg, { mentions: Object.keys(users).map(u => u) });
});

// ==================== BUG COMMANDS ====================
const premiumBugHandler = async (m, { reply, command, sender }) => {
    if (!premium.check(sender)) {
        await reply(`🔒 *Premium Locked*\n\n${command} requires premium access!\n\nContact ${config.OWNER_NAME} for upgrade`);
        return m.conn.sendMessage(m.from, { 
            audio: { url: 'https://files.catbox.moe/qda847.m4a' },
            ptt: true
        }, { quoted: m });
    }
    
    // Actual bug command functionality here
    await reply(`🛠️ *Premium Bug Activated*\nCommand: ${command}`);
};

cmd({
    pattern: "zui",
    alias: ["zerocrash", "zerofreeze"],
    desc: "Premium bug tool",
    category: "bug",
    react: "💥",
    filename: __filename
}, premiumBugHandler);

cmd({
    pattern: "zkill",
    alias: ["killbug"],
    desc: "Advanced bug tool",
    category: "bug",
    react: "⚠️",
    filename: __filename
}, premiumBugHandler);
