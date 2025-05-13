const { cmd } = require("../command");
const { setConfig } = require("../lib/configdb");
const { exec } = require("child_process");

cmd({
    pattern: "setprefix",
    desc: "Set the bot's command prefix",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const newPrefix = args[0]?.trim();
    if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1–2 characters).");

    setConfig("PREFIX", newPrefix);

    await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});



cmd({
    pattern: "setbotname",
    desc: "Set the bot's name",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const newName = args.join(" ").trim();
    if (!newName) return reply("❌ Provide a bot name.");

    setConfig("BOT_NAME", newName);

    await reply(`✅ Bot name updated to: *${newName}*\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});


cmd({
    pattern: "setownername",
    desc: "Set the owner's name",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const name = args.join(" ").trim();
    if (!name) return reply("❌ Provide an owner name.");

    setConfig("OWNER_NAME", name);

    await reply(`✅ Owner name updated to: *${name}*\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});


cmd({
    pattern: "setbotimage",
    desc: "Set the bot's image URL",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const url = args[0];
    if (!url || !url.startsWith("http")) return reply("❌ Provide a valid image URL.");

    setConfig("BOT_IMAGE", url);

    await reply(`✅ Bot image updated.\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});

/*const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { cmd } = require("../command");

const configPath = path.join(__dirname, "../lib/config.json");

cmd({
    pattern: "setprefix",
    desc: "Set the command prefix",
    category: "owner",
    react: "✏️",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  
    const newPrefix = args[0]?.trim();
    if (!newPrefix || newPrefix.length > 2) return reply("❌ Provide a valid prefix (1–2 characters).");

    const config = JSON.parse(fs.readFileSync(configPath));
    config.PREFIX = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await reply(`✅ Prefix updated to: *${newPrefix}*\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});




cmd({
    pattern: "setbotimage",
    desc: "Set the bot's image URL",
    category: "owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");
    const newImage = args[0];
    if (!newImage || !newImage.startsWith("http")) return reply("❌ Provide a valid image URL.");

    const config = JSON.parse(fs.readFileSync(configPath));
    config.BOT_IMAGE = newImage;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await reply(`✅ Bot image URL updated.\n\n♻️ Restarting...`);
    setTimeout(() => exec("pm2 restart all"), 2000);
});
*/
