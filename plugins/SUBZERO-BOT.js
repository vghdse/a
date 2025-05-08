/*const { cmd } = require('../command');
const fs = require('fs');
const config = require('../config');

cmd({
    pattern: "setprefix",
    alias: ["prefixx"],
    react: "🔧",
    desc: "Change the bot's command prefix",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const newPrefix = args[0];
    if (!newPrefix) return reply("❌ Please provide a new prefix. Example: `.setprefix !`");
    if (newPrefix.length > 2) return reply("❌ Prefix should be 1-2 characters maximum");

    try {
        // 1. Update in-memory config
        config.PREFIX = newPrefix;
        
        // 2. Update config file
        const configContent = `const PREFIX = '${newPrefix}';\n\nmodule.exports = {\n  PREFIX\n};`;
        fs.writeFileSync('./config.js', configContent);
        
        // 3. Update process.env if needed
        process.env.PREFIX = newPrefix;

        return reply(`✅ Prefix successfully changed to *${newPrefix}*`);
    } catch (error) {
        console.error("Error updating prefix:", error);
        return reply("❌ Failed to update prefix. Check console for details.");
    }
});
*/
