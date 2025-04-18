const { commands } = require('../command');
const leven = require('fast-levenshtein');
const config = require('../config');

module.exports = async (m, { conn, body, reply }) => {
    if (!body?.startsWith(config.PREFIX)) return;
    
    // Extract the typed command (without prefix)
    const typedCmd = body.trim().split(/\s+/)[0].slice(config.PREFIX.length).toLowerCase();
    
    // Get all registered command patterns
    const availableCommands = Object.values(commands)
        .map(c => c.pattern)
        .filter(Boolean);
    
    // Check if it's a valid command
    if (availableCommands.includes(typedCmd)) return;
    
    // Find closest matches (max 2 character differences)
    const suggestions = availableCommands
        .map(cmd => ({
            cmd,
            score: leven.get(typedCmd, cmd)
        }))
        .filter(({ score }) => score <= 2)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3); // Top 3 suggestions
    
    if (suggestions.length) {
        const suggestionText = suggestions
            .map(s => `${config.PREFIX}${s.cmd}`)
            .join('\n• ');
        await reply(`❌ Unknown command. Did you mean:\n• ${suggestionText}`);
    } else {
        await reply(`❌ Invalid command. Use *${config.PREFIX}menu* for commands list.`);
    }
};
