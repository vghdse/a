const { cmd, commands } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

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

    // 1. Update config file permanently
    const configPath = path.join(__dirname, '../config.js');
    let configFile = fs.readFileSync(configPath, 'utf8');
    configFile = configFile.replace(
        /(PREFIX\s*:\s*['"`]).*?(['"`])/,
        `$1${newPrefix}$2`
    );
    fs.writeFileSync(configPath, configFile);

    // 2. Update in-memory config
    config.PREFIX = newPrefix;

    // 3. Update command handler prefix
    const cmdHandler = require('../command');
    cmdHandler.prefix = newPrefix;

    // 4. Update all registered commands
    Object.keys(commands).forEach(oldPattern => {
        // Remove old command
        const cmdObj = commands[oldPattern];
        delete commands[oldPattern];
        
        // Register with new prefix
        const newPattern = oldPattern.replace(
            new RegExp(`^\\${config.PREFIX}`), 
            newPrefix
        );
        commands[newPattern] = cmdObj;
    });

    return reply(`✅ Prefix changed to *${newPrefix}*\n\nExample: *${newPrefix}menu*`);
});
