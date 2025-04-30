const config = require('../config');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
    pattern: "ping",
    desc: "Advanced ping with system info",
    category: "main", 
    react: "🌟",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = Date.now();
        const loadingMsg = await conn.sendMessage(from, { 
            text: '```Pinging...```' 
        });

        const endTime = Date.now();
        const ping = endTime - startTime;

        const pingMessage = `\`\`\`Pong ${ping}ms!\`\`\``;

        await conn.sendMessage(from, { 
            text: pingMessage,
            edit: loadingMsg.key 
        });

    } catch (e) {
        console.error("Ping error:", e);
        reply(`⚠️ Command failed: ${e.message}`);
    }
});
