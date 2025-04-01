const { cmd } = require("../command");
const config = require("../config");
const premium = require("../lib/bugs");

// Helper function
const getTarget = m => m.mentions?.[0] || m.quoted?.sender;

// Premium Management Commands
cmd({
    pattern: "addpremium",
    alias: ["addbug"],
    desc: "Add premium access",
    category: "owner",
    fromMe: true,
    usage: ".addpremium @user [hours]"
}, async (m, { args }) => {
    const user = getTarget(m);
    if (!user) return m.reply("❌ Mention or quote a user");
    
    const hours = parseInt(args[1]) || 0;
    premium.add(user, hours);
    
    m.reply(`✅ @${user.split('@')[0]} ${hours ? `got ${hours}h premium` : "is now permanent premium"}`,
        { mentions: [user] }
    );
});

cmd({
    pattern: "delpremium",
    alias: ["removebug"],
    desc: "Remove premium access",
    category: "owner",
    fromMe: true
}, async (m) => {
    const user = getTarget(m);
    if (!user) return m.reply("❌ Mention or quote a user");
    
    premium.remove(user) 
        ? m.reply(`🗑️ Removed @${user.split('@')[0]} from premium`, { mentions: [user] })
        : m.reply(`❌ @${user.split('@')[0]} wasn't premium`, { mentions: [user] });
});

cmd({
    pattern: "listpremium",
    alias: ["listbug"],
    desc: "List premium users",
    category: "owner",
    fromMe: true
}, async (m) => {
    const users = premium.list();
    if (!Object.keys(users).length) return m.reply("🔍 No premium users found");
    
    let text = "📜 *Premium Users*\n\n";
    for (const [userId, data] of Object.entries(users)) {
        const status = data.permanent ? "Permanent" : 
                     `Expires in ${Math.ceil((data.expiry - Date.now())/3.6e6)}h`;
        text += `• @${userId.split('@')[0]} (${status})\n`;
    }
    
    m.reply(text, { mentions: Object.keys(users) });
});

// Bug Commands
const checkPremium = async (m, { command }) => {
    if (!premium.has(m.sender)) {
        await m.reply(`🔒 Premium required for *${command}*\nContact ${config.OWNER_NAME} to upgrade`);
        return m.conn.sendMessage(m.from, {
            audio: { url: 'https://files.catbox.moe/qda847.m4a' },
            ptt: true
        }, { quoted: m });
    }
    m.reply(`🛠️ *${command}* activated`);
};

cmd({
    pattern: "zui",
    alias: ["zerocrash"],
    desc: "Premium bug tool",
    category: "bug",
    react: "💥"
}, checkPremium);

cmd({
    pattern: "zkill",
    desc: "Advanced bug tool",
    category: "bug",
    react: "⚠️"
}, checkPremium);
