const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const Config = require('../config');

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
            await reply('⏳ Loading command list...');

            // Read plugins directory
            const pluginsDir = path.join(__dirname, '../plugins');
            const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

            // Categorize plugins
            const categories = {};
            
            for (const file of pluginFiles) {
                try {
                    const plugin = require(path.join(pluginsDir, file));
                    
                    // Find the cmd object in the plugin
                    const cmdObj = plugin.cmd || Object.values(plugin).find(exp => exp?.pattern);

                    if (cmdObj?.pattern) {
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
                } catch (error) {
                    console.error(`Error loading plugin ${file}:`, error);
                }
            }

            // Generate menu message
            let menuMessage = `╭─── *${Config.BOT_NAME} COMMAND MENU* ───╮\n`;
            menuMessage += `│ *Prefix:* ${Config.PREFIX}\n`;
            menuMessage += `│ *Total Commands:* ${pluginFiles.length}\n`;
            menuMessage += `╰─────────────────────────────╯\n\n`;

            // Add categories to menu
            for (const [category, commands] of Object.entries(categories)) {
                menuMessage += `┌── *${category.toUpperCase()}* ──\n`;
                
                commands.forEach(cmd => {
                    menuMessage += `│ *${Config.PREFIX}${cmd.pattern}*\n`;
                    menuMessage += `│ ${cmd.desc}\n`;
                    if (cmd.use) menuMessage += `│ Usage: ${Config.PREFIX}${cmd.pattern} ${cmd.use}\n`;
                    if (cmd.alias.length > 0) menuMessage += `│ Aliases: ${cmd.alias.join(', ')}\n`;
                    menuMessage += `│\n`;
                });
                
                menuMessage += `└──────────────────\n\n`;
            }

            menuMessage += `📌 Use ${Config.PREFIX}help <command> for more info\n`;
            menuMessage += `🔗 Powered by ${Config.BOT_NAME}`;

            await reply(menuMessage);

        } catch (error) {
            console.error('Menu command error:', error);
            await reply('❌ Error generating command menu. Please try again later.');
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
        if (!text) return reply(`Example: ${Config.PREFIX}help song`);

        const command = text.trim().toLowerCase();
        const pluginsDir = path.join(__dirname, '../plugins');
        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            try {
                const plugin = require(path.join(pluginsDir, file));
                const cmdObj = plugin.cmd || Object.values(plugin).find(exp => exp?.pattern);

                if (cmdObj?.pattern && 
                    (cmdObj.pattern.toLowerCase() === command || 
                     (cmdObj.alias && cmdObj.alias.some(a => a.toLowerCase() === command)))) {
                    
                    let helpText = `╭── *${cmdObj.pattern.toUpperCase()}* ──╮\n`;
                    helpText += `│ *Description:* ${cmdObj.desc || 'No description'}\n`;
                    if (cmdObj.alias?.length > 0) helpText += `│ *Aliases:* ${cmdObj.alias.join(', ')}\n`;
                    helpText += `│ *Category:* ${cmdObj.category || 'general'}\n`;
                    if (cmdObj.use) helpText += `│ *Usage:* ${Config.PREFIX}${cmdObj.pattern} ${cmdObj.use}\n`;
                    helpText += `╰──────────────────────────╯`;
                    
                    return reply(helpText);
                }
            } catch (error) {
                console.error(`Error checking plugin ${file}:`, error);
            }
        }

        await reply(`No command found with name "${command}"`);
    }
);
