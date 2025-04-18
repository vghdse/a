
const { cmd } = require('../command');
const config = require('../config');
const levenshtein = require('fast-levenshtein');

// Store all registered commands
const commandList = Object.values(require('../command').commands)
    .map(cmd => cmd.pattern)
    .filter(Boolean);

cmd({
    pattern: null, // Catch-all handler
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { body, reply }) => {
    try {
        if (!body?.startsWith(config.PREFIX)) return;
        
        const typedCmd = body.trim().split(/\s+/)[0].toLowerCase();
        const pureCmd = typedCmd.slice(config.PREFIX.length);
        
        // Skip if it's a valid command
        if (commandList.includes(pureCmd)) return;
        
        // Find closest matching command
        const suggestions = commandList
            .map(cmd => ({
                cmd,
                distance: levenshtein.get(pureCmd, cmd)
            }))
            .filter(({ distance }) => distance <= 2) // Max 2 character differences
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3); // Top 3 suggestions
        
        if (suggestions.length > 0) {
            const suggestionText = suggestions
                .map(s => `${config.PREFIX}${s.cmd}`)
                .join('\n• ');
                
            await reply(`❌ Command not found. Did you mean:\n• ${suggestionText}`);
        } else {
            await reply(`❌ Invalid command. Use *${config.PREFIX}menu* to see available commands.`);
        }
    } catch (error) {
        console.error('TypoHandler Error:', error);
    }
});


/*const moment = require('moment');
const reminders = {};

cmd({
    pattern: "remind",
    alias: ["reminder"],
    desc: "Set personalized reminders",
    category: "productivity",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, { text, reply, sender }) => {
    const [time, ...task] = text.split(' ');
    if (!time || !task.length) {
        return reply("Usage: .remind 30m Buy milk\nUnits: m(minutes), h(hours), d(days)");
    }

    // Parse time
    const units = { m: 60000, h: 3600000, d: 86400000 };
    const duration = parseInt(time) * units[time.slice(-1)];
    if (isNaN(duration)) return reply("❌ Invalid time format");

    const reminderId = Date.now();
    const remindTime = Date.now() + duration;

    reminders[reminderId] = setTimeout(() => {
        conn.sendMessage(m.chat, {
            text: `⏰ REMINDER for @${sender.split('@')[0]}:\n${task.join(' ')}\n\nSet ${moment.duration(duration).humanize()} ago`
        }, { mentions: [sender] });
        delete reminders[reminderId];
    }, duration);

    reply(`✅ Reminder set for ${moment(remindTime).format('LLL')}`);
});
*/
/*const pdf = require('pdf-parse');
const fs = require('fs');

cmd({
    pattern: "pdftext",
    alias: ["extracttext"],
    desc: "Extract text from PDFs",
    category: "utility",
    react: "📄",
    filename: __filename
}, async (conn, mek, m, { quoted, reply }) => {
    if (!quoted?.document || !quoted.mimetype.includes('pdf')) {
        return reply("❌ Reply to a PDF file");
    }

    const buffer = await quoted.download();
    const tempPath = './temp.pdf';
    fs.writeFileSync(tempPath, buffer);

    try {
        const data = await pdf(fs.readFileSync(tempPath));
        const text = data.text.slice(0, 2000); // Limit to 2000 chars
        reply(`📄 Extracted Text:\n\n${text || "No text found"}`);
    } finally {
        fs.unlinkSync(tempPath);
    }
});
*/
