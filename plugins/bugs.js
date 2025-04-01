

const { cmd } = require("../command");
const config = require("../config");
const premium = require("../lib/premium");
const { getMentionedOrQuoted } = require("../lib/bugfunctions");

// Premium User Management Commands
cmd({
    pattern: "addpremium",
    alias: ["addbug"],
    desc: "Add user to premium bug access",
    category: "owner",
    filename: __filename,
    fromMe: true // Only bot owner can use
}, async (conn, mek, m, { reply, participants }) => {
    const user = getMentionedOrQuoted(m);
    if (!user) return reply("❌ Please mention or quote a user");
    
    if (premium.addPremium(user)) {
        reply(`✅ Added @${user.split('@')[0]} to premium bug access`);
    } else {
        reply(`ℹ️ @${user.split('@')[0]} already has premium access`);
    }
});

cmd({
    pattern: "removepremium",
    alias: ["delbug"],
    desc: "Remove user from premium bug access",
    category: "owner",
    filename: __filename,
    fromMe: true
}, async (conn, mek, m, { reply }) => {
    const user = getMentionedOrQuoted(m);
    if (!user) return reply("❌ Please mention or quote a user");
    
    if (premium.removePremium(user)) {
        reply(`✅ Removed @${user.split('@')[0]} from premium bug access`);
    } else {
        reply(`ℹ️ @${user.split('@')[0]} didn't have premium access`);
    }
});

cmd({
    pattern: "listpremium",
    alias: ["listbug"],
    desc: "List all premium users",
    category: "owner",
    filename: __filename,
    fromMe: true
}, async (conn, mek, m, { reply }) => {
    const users = premium.listPremium();
    if (users.length === 0) return reply("❌ No premium users found");
    
    let msg = "🌟 *Premium Users List*\n\n";
    users.forEach((user, i) => {
        msg += `${i+1}. @${user.split('@')[0]}\n`;
    });
    
    await reply(msg, { mentions: users });
});

// Updated Bug Commands with Premium Check
const premiumBugHandler = async (conn, mek, m, { from, reply, command, sender }) => {
    if (!premium.isPremium(sender)) {
        await reply(`🚫 *Premium Required*\n\nThis bug feature (*${command}*) requires premium access!\n\n💎 Contact ${config.OWNER_NAME} (${config.OWNER_NUMBER}) to upgrade`);
        return conn.sendMessage(from, { 
            audio: { url: 'https://files.catbox.moe/qda847.m4a' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });
    }
    
    // Premium user logic here
    await reply(`🛠️ *Premium Bug Tool Activated*\n\nCommand: ${command}\n\n⚠️ Use responsibly!`);
    // Add your premium bug functionality here
};

// ZUI Command
cmd({
    pattern: "zui",
    alias: ["zerocrash", "zerofreeze", "zerolag", "zios", "zandroid", "zkill", "zspam", "zflood", "zeroexecution", "zheadshort"],
    react: '🔒',
    desc: "Premium bug feature",
    category: "bug",
    use: ".zui",
    filename: __filename
}, premiumBugHandler);

// ZKILL Command
cmd({
    pattern: "zkill",
    alias: ["zerocrash", "zui"],
    react: '⚠️',
    desc: "Premium bug feature",
    category: "bug",
    filename: __filename
}, premiumBugHandler);
/* const { cmd } = require("../command");
const config = require("../config");

// ZUI Command
cmd({
  pattern: "zui",
  alias: ["zerocrash", "zerofreeze", "zerolag", "zios", "zandroid", "zkill", "zspam", "zflood", "zeroexecution", "zheadshort"],
  react: '🔒',
  desc: "Premium bug feature - coming soon",
  category: "bug",
  use: ".zui",
  filename: __filename
}, async (conn, mek, m, { from, reply, command }) => {
  try {
    // Send text response with correct command name
    await reply(`🚫 *Access Denied!*\n\n✨ *Premium Feature Locked*\nThis bug tool (*${command}*) is only available for premium users!\n\n💎 Contact ${config.OWNER_NAME} (${config.OWNER_NUMBER}) to upgrade`);
    
    // Send audio after text
    await conn.sendMessage(from, { 
      audio: { url: 'https://files.catbox.moe/qda847.m4a' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });
    
  } catch (error) {
    console.error('Error in bug command:', error);
    reply('❌ Error processing command');
  }
});

// ZKILL Command
cmd({
  pattern: "zkill",
  alias: ["zerocrash", "zui"],
  react: '⚠️',
  desc: "Premium bug feature - coming soon",
  category: "bug",
  filename: __filename
}, async (conn, mek, m, { from, reply, command }) => {
  try {
    await reply(`🔐 *Premium Locked*\n\nBug command *${command}* requires subscription!\n\nType *${config.PREFIX}premium* for info`);
    
    await conn.sendMessage(from, { 
      audio: { url: 'https://files.catbox.moe/qda847.m4a' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });
    
  } catch (error) {
    console.error('Error in zkill command:', error);
    reply('❌ Error processing command');
  }
});

*/
