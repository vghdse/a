const config = require('../config');
const { cmd } = require('../command');
const moment = require('moment-timezone');
const { isBanned, isSudo, loadJSON, saveJSON } = require('./index'); // adjust the path as necessary
// Enhanced ping command with repo info
cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    desc: "Check bot's response time and status",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const start = Date.now();
        
        // Emoji collections
        const emojiSets = {
            reactions: ['⚡', '🚀', '💨', '🎯', '🌟', '💎', '🔥', '✨', '🌀', '🔹'],
            decorations: ['▰▰▰▰▰▰▰▰▰▰', '▰▱▱▱▱▱▱▱▱▱', '▰▰▱▱▱▱▱▱▱▱', '▰▰▰▱▱▱▱▱▱▱', '▰▰▰▰▱▱▱▱▱▱'],
            status: ['🟢 ONLINE', '🔵 ACTIVE', '🟣 RUNNING', '🟡 RESPONDING']
        };

        // Random selections
        const reactionEmoji = emojiSets.reactions[Math.floor(Math.random() * emojiSets.reactions.length)];
        const statusEmoji = emojiSets.status[Math.floor(Math.random() * emojiSets.status.length)];
        const loadingBar = emojiSets.decorations[Math.floor(Math.random() * emojiSets.decorations.length)];

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: reactionEmoji, key: mek.key }
        });

        // Calculate response time
        const responseTime = (Date.now() - start) / 1000;
        
        // Get current time
        const time = moment().tz('Africa/Harare').format('HH:mm:ss');
        const date = moment().tz('Africa/Harare').format('DD/MM/YYYY');

        // Build response message
        const pingMessage = `
${loadingBar}
*${statusEmoji}*
        
⚡ *Response Time:* ${responseTime.toFixed(2)}ms
⏰ *Time:* ${time}
📅 *Date:* ${date}

💻 *Developer:* ${config.OWNER_NAME || "Mr Frank"}
🤖 *Bot Name:* ${config.BOT_NAME || "SUBZERO-MD"}

🌟 *Don't forget to star & fork the repo!*
🔗 ${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}

${loadingBar}
`.trim();

        // Send ping response
        await conn.sendMessage(from, {
            text: pingMessage,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363304325601080@newsletter',
                    newsletterName: "🚀 𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐌𝐃 🚀",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Ping command error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Ping2 with enhanced visuals
cmd({
    pattern: "ping2",
    desc: "Advanced ping with system info",
    category: "main",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = Date.now();
        const loadingMsg = await conn.sendMessage(from, { 
            text: '🚀 *Measuring SUBZERO performance...*' 
        });

        const endTime = Date.now();
        const ping = endTime - startTime;

        // System emojis
        const systemEmojis = {
            cpu: '⚙️',
            ram: '🧠', 
            speed: '⚡',
            clock: '⏱️',
            repo: '📦'
        };

        const pingMessage = `
${systemEmojis.cpu} *SYSTEM PERFORMANCE*
        
${systemEmojis.clock} *Response Time:* ${ping}ms
${systemEmojis.speed} *Speed:* ${ping < 500 ? '⚡ Blazing Fast' : ping < 1000 ? '🚀 Fast' : '🐢 Slow'}

${systemEmojis.repo} *Repository:*
${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}

💫 *Don't forget to star the repo!*
`.trim();

        await conn.sendMessage(from, { 
            text: pingMessage,
            edit: loadingMsg.key
        });

    } catch (e) {
        console.error("Ping2 error:", e);
        reply(`⚠️ Command failed: ${e.message}`);
    }
});

// Ping3 with typing indicator
// Ping3 with typing indicator
cmd({
    pattern: "ping3",
    desc: "Ping with typing simulation",
    category: "utility",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner, reply }) => {
    try {
        // Check if user is banned
        if (isBanned(sender)) {
            return reply("❌ You are banned from using this bot.");
        }

        // Check if user has permission (owner or sudo)
        if (!isOwner && !isSudo(sender)) {
            return reply("❌ You do not have permission to use this command.");
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        const start = Date.now();
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const latency = Date.now() - start;
        await conn.sendPresenceUpdate('paused', from);

        const resultMessage = `
⏱️ *Real-time Performance Metrics*
        
🏓 *Pong!* 
📶 *Latency:* ${latency}ms
📊 *Status:* ${latency < 300 ? 'Excellent' : latency < 600 ? 'Good' : 'Fair'}

✨ *Keep SUBZERO alive by starring the repo!*
🔗 ${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}
`.trim();

        await reply(resultMessage);

    } catch (error) {
        console.error('Ping3 error:', error);
        reply('❌ Failed to measure performance');
    }
});
