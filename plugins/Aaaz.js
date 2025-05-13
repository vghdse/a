const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { cmd } = require("../command");

const prefixPath = path.join(__dirname, "../lib/prefix.json");

cmd({
    pattern: "setprefix",
    alias: ["changeprefix"],
    desc: "Change the bot's command prefix",
    category: "owner",
    react: "✏️",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");

    const newPrefix = args[0]?.trim();
    if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1–2 characters).");

    try {
        // Write the new prefix
        fs.writeFileSync(prefixPath, JSON.stringify({ prefix: newPrefix }, null, 2));
        
        // Send success message first
        await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting bot...`);
        
        // Add a small delay to ensure message is sent before restart
        setTimeout(() => {
            exec("pm2 restart all", (err) => {
                if (err) {
                    console.error("Restart error:", err);
                    // You might want to notify the owner about restart failure
                    // But the bot might be restarting so this message may not send
                }
            });
        }, 1000); // 1 second delay
        
    } catch (err) {
        console.error("Error:", err);
        reply("❌ Failed to update prefix. Error: " + err.message);
    }
});
