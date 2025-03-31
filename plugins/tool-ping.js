const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed","pong"],use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "✔️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `*sᴜʙᴢᴇʀᴏ ɪᴄᴇ ᴍᴇʟᴛᴇᴅ ${responseTime.toFixed(2)}ms*`;

        await conn.sendMessage(from, {
            text,
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
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ping2 

cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now()
        const message = await conn.sendMessage(from, { text: '\`SUBZERO PINGING 🚀\`' })
        const endTime = Date.now()
        const ping = endTime - startTime
        await conn.sendMessage(from, { text: `*SUBZERO PONGED ! : ${ping}ms ⚡*` }, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
;

cmd({
    pattern: "ping3",
    alias: ["speed","pong"],
    desc: "Check bot's response time",
    category: "utility",
    react: "⚡",
    filename: __filename
}, async (m, conn) => {
    try {
        // Get start time
        const start = Date.now();
        
        // Send initial message
        const pingMsg = await conn.sendMessage(m.chat, {
            text: '🚀 *Measuring response time...*'
        }, { quoted: m });

        // Calculate latency
        const latency = Date.now() - start;

        // Edit with results
        await conn.sendMessage(m.chat, {
            text: `🏓 *Pong!*\n⏱️ Response time: ${latency}ms`,
            edit: pingMsg.key
        });

    } catch (error) {
        console.error('Ping error:', error);
        await conn.sendMessage(m.chat, {
            text: '❌ Failed to measure response time',
            quoted: m
        });
    }
});
