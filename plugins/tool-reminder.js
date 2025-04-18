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
