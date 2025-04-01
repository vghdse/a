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
