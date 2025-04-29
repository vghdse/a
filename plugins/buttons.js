const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const Config = require('../config');

// Helper function to safely require plugins
function safeRequire(pluginPath) {
    try {
        delete require.cache[require.resolve(pluginPath)];
        return require(pluginPath);
    } catch (error) {
        console.error(`Error requiring plugin ${pluginPath}:`, error);
        return null;
    }
}

cmd(
    {
        pattern: 'menut',
        alias: ['help', 'commands'],
        desc: 'Show all available commands',
        category: 'utility',
        react: '📜',
        filename: __filename,
    },
    async (message, reply) => {
        try {
            console.log('[MENU] Command received'); // Debug log
            
            // First send the reaction
            await message.react('⏳').catch(e => console.error('React error:', e));
            
            // Then send a temporary message
            const processingMsg = await reply('🔄 Loading command list...').catch(e => {
                console.error('Failed to send processing message:', e);
                return null;
            });

            if (!processingMsg) {
                console.error('Failed to send initial message');
                return;
            }

            // Read plugins directory
            const pluginsDir = path.join(__dirname, '../plugins');
            console.log(`[MENU] Reading plugins from: ${pluginsDir}`); // Debug log
            
            let pluginFiles = [];
            try {
                pluginFiles = fs.readdirSync(pluginsDir)
                    .filter(file => file.endsWith('.js') && !file.startsWith('_'));
                console.log(`[MENU] Found ${pluginFiles.length} plugins`); // Debug log
            } catch (dirError) {
                console.error('Error reading plugins directory:', dirError);
                await reply('❌ Error: Could not read plugins directory');
                return;
            }

            // Categorize plugins
            const categories = {};
            let loadedCount = 0;
            
            for (const file of pluginFiles) {
                const pluginPath = path.join(pluginsDir, file);
                console.log(`[MENU] Loading plugin: ${file}`); // Debug log
                
                const plugin = safeRequire(pluginPath);
                if (!plugin) continue;
                
                // Find the cmd object in the plugin
                const cmdObj = plugin.cmd || Object.values(plugin).find(exp => exp?.pattern);
                if (!cmdObj?.pattern) continue;
                
                loadedCount++;
                const category = cmdObj.category || 'general';
                if (!categories[category]) {
                    categories[category] = [];
                }
                
                categories[category].push({
                    pattern: cmdObj.pattern,
                    alias: cmdObj.alias || [],
                    desc: cmdObj.desc || 'No description',
                    use: cmdObj.use || ''
                });
            }

            console.log(`[MENU] Successfully loaded ${loadedCount}/${pluginFiles.length} plugins`); // Debug log

            if (loadedCount === 0) {
                await reply('❌ No commands found! Please check your plugins directory.');
                return;
            }

            // Generate menu message
            let menuMessage = `╭─── *${Config.BOT_NAME || 'BOT'} COMMAND MENU* ───╮\n`;
            menuMessage += `│ *Prefix:* ${Config.PREFIX || '.'}\n`;
            menuMessage += `│ *Commands Loaded:* ${loadedCount}\n`;
            menuMessage += `╰─────────────────────────────╯\n\n`;

            // Add categories to menu
            for (const [category, commands] of Object.entries(categories)) {
                menuMessage += `┌── *${category.toUpperCase()}* ──\n`;
                
                commands.forEach(cmd => {
                    menuMessage += `│ *${Config.PREFIX || '.'}${cmd.pattern}*\n`;
                    menuMessage += `│ ${cmd.desc}\n`;
                    if (cmd.use) menuMessage += `│ Usage: ${Config.PREFIX || '.'}${cmd.pattern} ${cmd.use}\n`;
                    if (cmd.alias.length > 0) menuMessage += `│ Aliases: ${cmd.alias.join(', ')}\n`;
                    menuMessage += `│\n`;
                });
                
                menuMessage += `└──────────────────\n\n`;
            }

            menuMessage += `📌 Use ${Config.PREFIX || '.'}help <command> for more info\n`;
            menuMessage += `🔗 ${Config.BOT_NAME ? `Powered by ${Config.BOT_NAME}` : ''}`;

            console.log('[MENU] Sending menu message'); // Debug log
            await reply(menuMessage).catch(e => console.error('Failed to send menu:', e));
            
            // Delete the processing message if it exists
            if (processingMsg && processingMsg.delete) {
                await processingMsg.delete().catch(e => console.error('Failed to delete processing message:', e));
            }
            
            // Send success reaction
            await message.react('✅').catch(e => console.error('Success react failed:', e));

        } catch (error) {
            console.error('MENU COMMAND ERROR:', error);
            await reply('❌ Error generating command menu. Please check console for details.').catch(e => console.error('Failed to send error message:', e));
            await message.react('❌').catch(e => console.error('Error react failed:', e));
        }
    }
);

// Help command for specific commands
cmd(
    {
        pattern: 'helpt',
        desc: 'Get help for a specific command',
        category: 'utility',
        use: '<command>',
        filename: __filename,
    },
    async (message, reply, text) => {
        try {
            if (!text) {
                return reply(`Example: ${Config.PREFIX || '.'}help song`);
            }

            await message.react('⏳').catch(e => console.error('React error:', e));
            
            const command = text.trim().toLowerCase();
            const pluginsDir = path.join(__dirname, '../plugins');
            
            console.log(`[HELP] Looking for command: ${command}`); // Debug log
            
            let pluginFiles = [];
            try {
                pluginFiles = fs.readdirSync(pluginsDir)
                    .filter(file => file.endsWith('.js') && !file.startsWith('_'));
            } catch (dirError) {
                console.error('Error reading plugins directory:', dirError);
                return reply('❌ Error: Could not read plugins directory');
            }

            for (const file of pluginFiles) {
                const pluginPath = path.join(pluginsDir, file);
                const plugin = safeRequire(pluginPath);
                if (!plugin) continue;
                
                const cmdObj = plugin.cmd || Object.values(plugin).find(exp => exp?.pattern);
                if (!cmdObj?.pattern) continue;
                
                if (cmdObj.pattern.toLowerCase() === command || 
                    (cmdObj.alias && cmdObj.alias.some(a => a.toLowerCase() === command))) {
                    
                    let helpText = `╭── *${cmdObj.pattern.toUpperCase()}* ──╮\n`;
                    helpText += `│ *Description:* ${cmdObj.desc || 'No description'}\n`;
                    if (cmdObj.alias?.length > 0) helpText += `│ *Aliases:* ${cmdObj.alias.join(', ')}\n`;
                    helpText += `│ *Category:* ${cmdObj.category || 'general'}\n`;
                    if (cmdObj.use) helpText += `│ *Usage:* ${Config.PREFIX || '.'}${cmdObj.pattern} ${cmdObj.use}\n`;
                    helpText += `╰──────────────────────────╯`;
                    
                    await reply(helpText).catch(e => console.error('Failed to send help:', e));
                    return await message.react('✅').catch(e => console.error('Success react failed:', e));
                }
            }

            await reply(`No command found with name "${command}"`).catch(e => console.error('Failed to send not found:', e));
            await message.react('❌').catch(e => console.error('Error react failed:', e));

        } catch (error) {
            console.error('HELP COMMAND ERROR:', error);
            await reply('❌ Error fetching command help. Please check console.').catch(e => console.error('Failed to send error:', e));
            await message.react('❌').catch(e => console.error('Error react failed:', e));
        }
    }
);
