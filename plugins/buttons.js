const { cmd } = require('../command');

cmd({
    pattern: "setprefixx",
    alias: ["prefix", "setp"],
    react: "🔧",
    desc: "Change the bot's command prefix",
    category: "settings",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 Only the owner can use this command!*");

    const newPrefix = args[0];
    
    // Validation checks
    if (!newPrefix) return reply("❌ Please provide a new prefix.\nExample: `.setprefix !`");
    if (newPrefix.length > 3) return reply("❌ Prefix cannot be longer than 3 characters!");
    if (newPrefix.includes(" ")) return reply("❌ Prefix cannot contain spaces!");
    if (newPrefix === config.PREFIX) return reply(`❌ Prefix is already set to *${newPrefix}*`);
    
    // Update all three locations
    const oldPrefix = config.PREFIX;
    
    // 1. Update runtime config (immediate effect)
    config.PREFIX = newPrefix;
    
    // 2. Update process.env (for current process)
    process.env.PREFIX = newPrefix;
    
    try {
        // 3. Update .env file (for persistence)
        await updateEnvFile('PREFIX', newPrefix);
        
        return reply(`✅ Prefix changed from *${oldPrefix}* to *${newPrefix}*\n\nNow use commands with *${newPrefix}* (Example: *${newPrefix}ping*)`);
    } catch (error) {
        // Revert changes if file update fails
        config.PREFIX = oldPrefix;
        process.env.PREFIX = oldPrefix;
        console.error("Prefix update failed:", error);
        return reply("❌ Failed to update prefix. All changes reverted.");
    }
});

// Enhanced env file updater
async function updateEnvFile(key, value) {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    // Handle both PREFIX=value and PREFIX="value" formats
    const keyRegex = new RegExp(`^${key}=(?:"|')?(.*?)(?:"|')?$`, 'm');
    
    if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, `${key}="${value}"`);
    } else {
        envContent += `\n${key}="${value}"\n`;
    }
    
    fs.writeFileSync(envPath, envContent.trim());
}
