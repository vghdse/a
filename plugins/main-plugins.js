const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Plugins = require('../models/plugins'); // Your plugins database model

// Helper functions
async function installPlugin(url) {
    try {
        const response = await axios.get(url);
        const pluginName = path.basename(url).replace('.js', '') || `plugin-${Date.now()}`;
        const pluginPath = path.join(__dirname, '../plugins', `${pluginName}.js`);
        
        await fs.promises.writeFile(pluginPath, response.data);
        require(pluginPath); // Load the plugin
        
        // Save to database
        await Plugins.create({
            id: pluginName,
            url: url,
            installedAt: new Date()
        });
        
        return {
            status: 200,
            message: 'Plugin installed successfully!',
            pluginName: pluginName
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to install plugin: ' + error.message
        };
    }
}

async function deletePlugin(identifier) {
    try {
        // Check if identifier is URL or ID
        let plugin;
        if (identifier.startsWith('http')) {
            plugin = await Plugins.findOne({ url: identifier });
        } else {
            plugin = await Plugins.findOne({ id: identifier });
        }

        if (!plugin) {
            return { status: 404, message: 'Plugin not found' };
        }

        const pluginPath = path.join(__dirname, '../plugins', `${plugin.id}.js`);
        
        // Delete file
        if (fs.existsSync(pluginPath)) {
            fs.unlinkSync(pluginPath);
        }
        
        // Remove from database
        await Plugins.deleteOne({ _id: plugin._id });
        
        // Clear from require cache
        delete require.cache[require.resolve(pluginPath)];
        
        return {
            status: 200,
            message: 'Plugin deleted successfully!',
            pluginName: plugin.id
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Failed to delete plugin: ' + error.message
        };
    }
}

// Install Plugin Command
cmd({
    pattern: "install",
    alias: ["addplugin"],
    desc: "Install external plugins from GitHub raw URLs",
    category: "core",
    react: "📥",
    filename: __filename,
    use: "<github-raw-url>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("📥 *Please provide a GitHub raw URL*\nExample: .install https://raw.githubusercontent.com/user/repo/main/plugin.js");

        const url = args[0];
        if (!url.match(/^https:\/\/raw\.githubusercontent\.com\/.+\/.+\.js$/)) {
            return reply("❌ *Invalid URL* - Must be a GitHub raw JS file URL");
        }

        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

        // Check if already installed
        const existing = await Plugins.findOne({ url: url });
        if (existing) return reply("⚠️ This plugin is already installed!");

        const result = await installPlugin(url);
        
        if (result.status === 200) {
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });
            reply(`✨ *Plugin Installed!*\nName: ${result.pluginName}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`);
        } else {
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply(`❌ *Install Failed*\n${result.message}`);
        }

    } catch (error) {
        console.error('Install error:', error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply('❌ *Error installing plugin* - Please check console');
    }
});

// Delete Plugin Command
cmd({
    pattern: "delplugin",
    alias: ["removeplugin", "uninstall"],
    desc: "Remove installed plugins",
    category: "core",
    react: "🗑️",
    filename: __filename,
    use: "<plugin-id|url>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("🗑️ *Please provide plugin ID or URL*\nExample: .delplugin myplugin\n.delplugin https://raw.githubusercontent.com/...");

        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

        const result = await deletePlugin(args[0]);
        
        if (result.status === 200) {
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });
            reply(`♻️ *Plugin Deleted!*\nName: ${result.pluginName}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`);
        } else {
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply(`❌ *Delete Failed*\n${result.message}`);
        }

    } catch (error) {
        console.error('Delete error:', error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply('❌ *Error deleting plugin* - Please check console');
    }
});

// List Plugins Command
cmd({
    pattern: "plugins",
    alias: ["listplugins"],
    desc: "List all installed plugins",
    category: "core",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const plugins = await Plugins.find({});
        
        if (plugins.length === 0) return reply("📭 *No plugins installed*");

        let pluginList = "📦 *Installed Plugins*\n\n";
        plugins.forEach((plugin, index) => {
            pluginList += `${index+1}. ${plugin.id}\n   🔗 ${plugin.url}\n   📅 ${plugin.installedAt.toLocaleDateString()}\n\n`;
        });

        pluginList += `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`;

        reply(pluginList);

    } catch (error) {
        console.error('Plugins list error:', error);
        reply('❌ *Error listing plugins*');
    }
});
