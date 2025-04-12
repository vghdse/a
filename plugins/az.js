const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Cache the settings image
let settingsImage = null;
const SETTINGS_IMAGE_URL = 'https://files.catbox.moe/18il7k.jpg';

cmd({
    pattern: "setvar1",
    alias: ["settings", "cmdlist"],
    react: "⚙️",
    desc: "Manage bot settings and view command list",
    category: "settings",
    filename: __filename,
    use: '<option> <on/off> or leave empty to view settings'
}, async (conn, mek, m, { from, isOwner, reply, args }) => {
    if (!isOwner) return reply("*📛 Only the owner can use this command!*");

    // Download settings image if not cached
    if (!settingsImage) {
        try {
            const response = await axios.get(SETTINGS_IMAGE_URL, { 
                responseType: 'arraybuffer',
                timeout: 10000
            });
            settingsImage = Buffer.from(response.data, 'binary');
        } catch (e) {
            console.error('Failed to load settings image:', e.message);
        }
    }

    // Available settings configuration
    const settingsConfig = {
        'MODE': { desc: "Bot access mode", values: ["public", "private"] },
        'AUTO_TYPING': { desc: "Typing indicators", values: ["on", "off"] },
        'ALWAYS_ONLINE': { desc: "Online status", values: ["on", "off"] },
        'AUTO_RECORDING': { desc: "Voice recording", values: ["on", "off"] },
        'AUTO_STATUS_REACT': { desc: "Status reactions", values: ["on", "off"] },
        'ANTI_BAD_WORD': { desc: "Bad word filter", values: ["on", "off"] },
        'ANTI_DELETE': { desc: "Anti-delete", values: ["on", "off"] },
        'AUTO_STICKER': { desc: "Auto-sticker", values: ["on", "off"] },
        'AUTO_REPLY': { desc: "Auto-reply", values: ["on", "off"] },
        'AUTO_REACT': { desc: "Auto-react", values: ["on", "off"] },
        'ANTI_LINK': { desc: "Anti-link", values: ["on", "off"] },
        'HEART_REACT': { desc: "Heart reactions", values: ["on", "off"] }
    };

    // Handle setting changes
    if (args.length >= 2) {
        const [setting, value] = args;
        const upperSetting = setting.toUpperCase();

        if (!settingsConfig[upperSetting]) {
            return reply(`❌ Invalid setting. Use *.setvar* to see options`);
        }

        const validValues = settingsConfig[upperSetting].values;
        if (!validValues.includes(value.toLowerCase())) {
            return reply(`❌ Value must be one of: ${validValues.join(', ')}`);
        }

        // Update config file
        try {
            const configPath = path.join(__dirname, '../config.js');
            let configContent = fs.readFileSync(configPath, 'utf8');
            
            configContent = configContent.replace(
                new RegExp(`(${upperSetting}:\\s*['"])([^'"]*)(['"])`, 'g'),
                `$1${value.toLowerCase()}$3`
            );
            
            fs.writeFileSync(configPath, configContent);
            config[upperSetting] = value.toLowerCase();
            
            return await conn.sendMessage(from, {
                text: `✅ *${upperSetting}* updated to *${value.toLowerCase()}*`,
                ...(settingsImage && { image: settingsImage })
            }, { quoted: mek });
            
        } catch (error) {
            console.error('Config update error:', error);
            return reply('❌ Failed to update config. Check console for details.');
        }
    }

    // Generate settings list
    let settingsList = '┌───────────────┐\n';
    settingsList += '│  SUBZERO MD  │\n';
    settingsList += '│  SETTINGS    │\n';
    settingsList += '└───────────────┘\n\n';
    
    settingsList += '⚙ *Current Settings:*\n';
    for (const [name, config] of Object.entries(settingsConfig)) {
        settingsList += `▸ *${name}*: ${config.desc}\n   › Current: _${config[name] || 'off'}_\n   › Usage: .setvar ${name.toLowerCase()} <${config.values.join('/')}>\n\n`;
    }
    
    settingsList += '📌 *Other Commands:*\n';
    settingsList += '▸ .setprefix <new_prefix>\n';
    settingsList += '▸ .poll "question";opt1,opt2\n';
    settingsList += '▸ .randomship\n';
    settingsList += '▸ .newgc "name";num1,num2\n';
    settingsList += '▸ .exit (leave group)\n';
    settingsList += '▸ .invite2 (group link)\n';
    settingsList += '▸ .broadcast <message>\n';
    settingsList += '▸ .setgrouppp (reply image)\n\n';
    settingsList += '> © SUBZERO MD';

    // Send response with image if available
    await conn.sendMessage(from, {
        text: settingsList,
        ...(settingsImage && { image: settingsImage })
    }, { quoted: mek });
});
