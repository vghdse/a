cmd({
    pattern: "setprefix",
    alias: ["prefix"],
    react: "🔧",
    desc: "Change the bot's command prefix",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    const newPrefix = args[0]?.trim();
    
    if (!newPrefix) {
        return reply(`📌 Current prefix: *${config.PREFIX}*\n\nUsage: *${config.PREFIX}setprefix !*`);
    }

    if (newPrefix.length > 3 || /\s/.test(newPrefix)) {
        return reply("❌ Prefix must be 1-3 characters with no spaces");
    }

    // Update in THREE places:
    // 1. Config
    config.PREFIX = newPrefix;
    
    // 2. Command handler (critical!)
    const cmdHandler = require('../command');
    cmdHandler.prefix = newPrefix;
    
    // 3. Command collection (if exists)
    if (cmdHandler.commands) {
        cmdHandler.commands.prefix = newPrefix;
    }

    // Force reload commands (if needed)
    if (cmdHandler.loadCommands) {
        cmdHandler.loadCommands(newPrefix);
    }

    return reply(`✅ Prefix changed to *${newPrefix}*\n\nExample: *${newPrefix}menu*\n\n⚠️ Restarting bot may be required for full effect`);
});
