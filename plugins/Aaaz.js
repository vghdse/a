const { cmd } = require('../commands');

// Help menu command
cmd(
  {
    pattern: 'help',
    alias: ['menu', 'commands'],
    desc: 'Shows list of all available commands',
    category: 'general',
    use: '[command name]',
    filename: __filename
  },
  async (conn, m, msg, { text, reply }) => {
    if (text) {
      // Show detailed help for a specific command
      const command = commands.find(c => c.pattern === text || c.alias?.includes(text));
      if (!command) return reply(`❌ Command "${text}" not found.`);
      return reply(`*Command:* ${command.pattern}\n*Description:* ${command.desc || 'No description'}\n*Usage:* ${command.use || 'No usage'}\n*Category:* ${command.category}`);
    }

    // Group commands by category
    const grouped = {};
    for (const cmd of commands) {
      if (cmd.dontAddCommandList) continue;
      if (!grouped[cmd.category]) grouped[cmd.category] = [];
      grouped[cmd.category].push(cmd);
    }

    // Build help menu text
    let menu = `*HELP MENU*\nHere are the available commands:\n\n`;

    for (const [category, cmds] of Object.entries(grouped)) {
      menu += `╭─── *${category.toUpperCase()}*\n`;
      cmds.forEach(c => {
        menu += `│ • *${c.pattern}* — ${c.desc || 'No description'}\n`;
      });
      menu += `╰────\n\n`;
    }

    reply(menu.trim());
  }
);
