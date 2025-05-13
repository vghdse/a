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
    if (!newPrefix || newPrefix.length > 2) {
        return reply("❌ Provide a valid prefix (1–2 characters).");
    }

    try {
        // Save new prefix to file
        fs.writeFileSync(prefixPath, JSON.stringify({ prefix: newPrefix }, null, 2));

        // Inform the user and delay restart
        await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting bot in 2 seconds...`);

        // Restart bot after delay
        setTimeout(() => {
            exec("pm2 restart all", (err, stdout, stderr) => {
                if (err) {
                    console.error("PM2 restart error:", err);
                } else {
                    console.log("Bot restarted successfully via PM2.");
                }
            });
        }, 2000);

    } catch (err) {
        console.error("Error updating prefix:", err);
        reply("❌ Failed to update prefix.");
    }
});
