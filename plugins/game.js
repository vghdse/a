/*const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

const DB_PATH = path.resolve(__dirname, "../lib/empire.json");

// Database functions
function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getUser(db, id) {
    if (!db.users[id]) {
        db.users[id] = { 
            id, 
            coins: 100,  // Starting coins
            gems: 0, 
            level: 1, 
            lastMine: 0, 
            lastClaim: 0, 
            inventory: [], 
            isPro: false, 
            robbed: 0, 
            robbedBy: 0 
        };
    }
    return db.users[id];
}

// Game commands
cmd({ 
    pattern: "mine", 
    desc: "Mine for coins and gems", 
    category: "game", 
    react: "⛏️", 
    filename: __filename 
}, async (conn, mek, m, { sender, reply }) => {
    try {
        const db = loadDB();
        const user = getUser(db, sender);
        const now = Date.now();
        
        // Cooldown based on Pro status (10 min for Pro, 30 min for regular)
        const cooldown = user.isPro ? 10 * 60 * 1000 : 30 * 60 * 1000;
        
        if (now - user.lastMine < cooldown) {
            const wait = ((cooldown - (now - user.lastMine)) / 60000).toFixed(1);
            return reply(`⏳ Wait ${wait} minutes before mining again.`);
        }
        
        // Calculate earnings
        const coins = Math.floor(Math.random() * 200) + 50;
        const gems = Math.random() < 0.3 ? 1 : 0;
        
        // Update user
        user.coins += coins;
        user.gems += gems;
        user.lastMine = now;
        
        // Save and reply
        saveDB(db);
        reply(`⛏️ You mined ${coins} coins${gems ? " and 1 gem" : ""}!`);
    } catch (error) {
        console.error("Mine error:", error);
        reply("❌ An error occurred while mining. Please try again.");
    }
});

cmd({ 
    pattern: "claim", 
    desc: "Claim daily rewards", 
    category: "game", 
    react: "🎁", 
    filename: __filename 
}, async (conn, mek, m, { sender, reply }) => {
    try {
        const db = loadDB();
        const user = getUser(db, sender);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - user.lastClaim < oneDay) {
            return reply("⏳ You've already claimed today. Come back later!");
        }
        
        const bonus = 150 + Math.floor(Math.random() * 100);
        user.coins += bonus;
        user.lastClaim = now;
        
        saveDB(db);
        reply(`🎉 You claimed ${bonus} coins!`);
    } catch (error) {
        console.error("Claim error:", error);
        reply("❌ An error occurred while claiming. Please try again.");
    }
});

cmd({ 
    pattern: "wallet", 
    desc: "Check your balance", 
    category: "game", 
    react: "💼", 
    filename: __filename 
}, async (conn, mek, m, { sender, reply }) => {
    try {
        const db = loadDB();
        const user = getUser(db, sender);
        
        reply(`💼 *Wallet*\n\n` +
              `💰 Coins: ${user.coins}\n` +
              `💎 Gems: ${user.gems}\n` +
              `📈 Level: ${user.level}\n` +
              `✨ Pro: ${user.isPro ? "Yes" : "No"}`);
    } catch (error) {
        console.error("Wallet error:", error);
        reply("❌ Couldn't access your wallet. Please try again.");
    }
});

cmd({ 
    pattern: "rob", 
    desc: "Rob another user", 
    category: "game", 
    react: "🦹", 
    filename: __filename 
}, async (conn, mek, m, { sender, args, reply, mentionByTag }) => {
    try {
        const db = loadDB();
        const targetId = mentionByTag || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        
        if (!targetId || targetId === sender) {
            return reply("❌ Invalid target. Mention someone or provide their number.");
        }
        
        const user = getUser(db, sender);
        const target = getUser(db, targetId);
        
        if (target.coins < 100) {
            return reply("❌ Target doesn't have enough coins (minimum 100 required).");
        }
        
        const success = Math.random() < 0.5;
        
        if (success) {
            const amount = Math.min(Math.floor(target.coins * 0.2), 1000); // Cap at 1000 coins
            user.coins += amount;
            target.coins -= amount;
            user.robbed++;
            target.robbedBy++;
            
            saveDB(db);
            reply(`🦹 Success! You stole ${amount} coins from @${targetId.split("@")[0]}!`);
        } else {
            reply("❌ Rob failed. Better luck next time!");
        }
    } catch (error) {
        console.error("Rob error:", error);
        reply("❌ An error occurred during the robbery. Please try again.");
    }
});

cmd({ 
    pattern: "top", 
    desc: "Show leaderboard", 
    category: "game", 
    react: "🏆", 
    filename: __filename 
}, async (conn, mek, m, { reply }) => {
    try {
        const db = loadDB();
        const sorted = Object.values(db.users)
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 10);
        
        let msg = "🏆 *Top Miners Leaderboard*\n\n";
        sorted.forEach((u, i) => {
            msg += `${i + 1}. @${u.id.split("@")[0]} - ${u.coins} coins\n`;
        });
        
        reply(msg);
    } catch (error) {
        console.error("Top error:", error);
        reply("❌ Couldn't load the leaderboard. Please try again.");
    }
});

cmd({ 
    pattern: "promote", 
    desc: "Promote user to Pro", 
    category: "owner", 
    react: "🚀", 
    filename: __filename 
}, async (conn, mek, m, { isCreator, mentionByTag, args, reply }) => {
    try {
        if (!isCreator) return reply("❗ Owner only command.");
        
        const db = loadDB();
        const targetId = mentionByTag || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        
        if (!targetId) return reply("❌ No target specified. Mention someone or provide their number.");
        
        const user = getUser(db, targetId);
        user.isPro = true;
        
        saveDB(db);
        reply(`🚀 @${targetId.split("@")[0]} has been promoted to Pro!`);
    } catch (error) {
        console.error("Promote error:", error);
        reply("❌ Failed to promote user. Please try again.");
    }
});

cmd({ 
    pattern: "pro", 
    desc: "Check pro benefits", 
    category: "game", 
    react: "✨", 
    filename: __filename 
}, async (conn, mek, m, { sender, reply }) => {
    try {
        const db = loadDB();
        const user = getUser(db, sender);
        
        if (user.isPro) {
            reply(`✨ *Pro Benefits*\n\n` +
                  `• 3x faster mining cooldown\n` +
                  `• Rob protection\n` +
                  `• Higher mining yields\n` +
                  `• Exclusive features`);
        } else {
            reply(`🔓 *Pro Membership*\n\n` +
                  `Unlock Pro to enjoy:\n` +
                  `• Faster mining (10 min cooldown)\n` +
                  `• Rob protection\n` +
                  `• And more!\n\n` +
                  `Contact owner to upgrade!`);
        }
    } catch (error) {
        console.error("Pro error:", error);
        reply("❌ Couldn't check Pro status. Please try again.");
    }
});
*/
