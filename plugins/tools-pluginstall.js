/*const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

cmd({
    pattern: "install",
    alias: ["addplugin"],
    desc: "Install a plugin from a GitHub Gist URL and restart the bot.",
    react: "📥",
    category: "plugin",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!q) return reply("Please provide a plugin URL. *Eg* `.install https://gist.github.com/...`");

        // Extract the Gist ID from the URL
        const gistId = q.match(/(?:\/|gist\.github\.com\/)([a-fA-F0-9]+)/);
        if (!gistId) return reply("Invalid plugin URL. Please provide a valid GitHub Gist URL.");

        const gistName = gistId[1];
        const gistURL = `https://api.github.com/gists/${gistName}`;

        // Fetch the Gist data
        const response = await axios.get(gistURL);
        const gistData = response.data;

        if (!gistData || !gistData.files) {
            return reply("No valid files found in the Gist.");
        }

        // Process each file in the Gist
        for (const file of Object.values(gistData.files)) {
            const pluginName = file.filename; // Use the Gist file name as the plugin name
            const pluginPath = path.join('plugins', `${pluginName}`); // Construct the path to save the plugin

            // Write the Gist file content to the plugin file
            await fs.promises.writeFile(pluginPath, file.content);
            reply(`✅ Successfully installed the plugin: *${pluginName}*`);
        }

        // Notify the bot is restarting
        reply("🔄 Restarting the bot to apply changes...");

        // Restart the bot
        setTimeout(() => {
            process.exit(0); // Exit the process
        }, 2000); // Wait 2 seconds before restarting

    } catch (error) {
        console.error(error);
        reply(`Error: ${error.message}`);
    }
});*/
