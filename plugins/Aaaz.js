const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

const prefixPath = path.join(__dirname, "../lib/prefix.json");

cmd({
    pattern: "setprefix3",
    alias: ["changeprefix"],
    desc: "Change the bot's command prefix",
    category: "owner",
    react: "✏️",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const newPrefix = args[0];
    if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1-2 characters).");

    let prefixData = { prefix: newPrefix };
    fs.writeFileSync(prefixPath, JSON.stringify(prefixData, null, 2));

    reply(`✅ Prefix updated to: *${newPrefix}*`);
});
