const config = require('../config');
const { cmd } = require('../command');
const moment = require('moment-timezone');
const os = require('os');
const process = require('process');

// Performance monitoring utility
class PerformanceMonitor {
    static getCpuUsage() {
        const cpus = os.cpus();
        let totalIdle = 0, totalTick = 0;
        
        cpus.forEach(cpu => {
            for (let type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        return {
            idle: totalIdle / cpus.length,
            total: totalTick / cpus.length
        };
    }

    static getMemoryUsage() {
        return {
            total: os.totalmem(),
            free: os.freemem(),
            used: process.memoryUsage().rss
        };
    }
}

// Enhanced ping command with system diagnostics
cmd({
    pattern: "ping4",
    alias: ["speed", "pong", "status"],
    desc: "Check bot's response time and system status",
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
            decorations: ['▰▰▰▰▰▰▰▰▰▰', '▱▱▱▱▱▱▱▱▱▱', '▰▰▰▰▱▱▱▱▱▱', '▰▰▰▰▰▰▰▱▱▱'],
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
        
        // Get system information
        const memory = PerformanceMonitor.getMemoryUsage();
        const memoryUsage = ((memory.used / memory.total) * 100).toFixed(2);
        const uptime = process.uptime();
        const formattedUptime = moment.duration(uptime, 'seconds').humanize();
        
        // Get current time
        const time = moment().tz('Africa/Harare').format('HH:mm:ss');
        const date = moment().tz('Africa/Harare').format('DD/MM/YYYY');

        // Build response message
        const pingMessage = `
${loadingBar}
*${statusEmoji}*  *${config.BOT_NAME || "SUBZERO-MD"} Status*

⚡ *Response Time:* ${responseTime.toFixed(2)}ms
⏱️ *Uptime:* ${formattedUptime}
🧠 *Memory Usage:* ${memoryUsage}%

⏰ *Time:* ${time}
📅 *Date:* ${date}

👨‍💻 *Developer:* ${config.OWNER_NAME || "Mr Frank"}
🌐 *Version:* ${config.VERSION || "3.0.0"}

🔗 *Repository:*
${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}

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

// System diagnostics ping
cmd({
    pattern: "diagnostics",
    alias: ["sysinfo", "system"],
    desc: "Detailed system diagnostics",
    category: "main",
    react: "💻",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const start = Date.now();
        
        // Get detailed system info
        const memory = PerformanceMonitor.getMemoryUsage();
        const cpu = PerformanceMonitor.getCpuUsage();
        const platform = os.platform();
        const arch = os.arch();
        const uptime = process.uptime();
        
        const formatBytes = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const diagnosticsMessage = `
🖥️ *System Diagnostics Report*

• *Platform:* ${platform} (${arch})
• *Uptime:* ${moment.duration(uptime, 'seconds').humanize()}
• *CPU Usage:* ${((1 - cpu.idle / cpu.total) * 100).toFixed(2)}%
• *Memory:*
  - Total: ${formatBytes(memory.total)}
  - Used: ${formatBytes(memory.used)} (${memoryUsage}%)
  - Free: ${formatBytes(memory.free)}
• *Process:*
  - Node.js: ${process.version}
  - PID: ${process.pid}
  - Running as: ${process.getuid ? process.getuid() : 'N/A'}

📊 *Performance Metrics*
• *Response Time:* ${((Date.now() - start) / 1000).toFixed(2)}ms
• *Load Average:* ${os.loadavg().map(v => v.toFixed(2)).join(', ')}

💡 *Keep the bot running smoothly by starring the repo!*
${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}
`.trim();

        await reply(diagnosticsMessage);

    } catch (e) {
        console.error("Diagnostics error:", e);
        reply(`❌ Failed to get system info: ${e.message}`);
    }
});

// Lightweight ping command
cmd({
    pattern: "speed",
    alias: ["fastping"],
    desc: "Minimal ping command for quick response check",
    category: "utility",
    react: "🏓",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const start = Date.now();
        const response = await reply("🏓 Pong!");
        const latency = Date.now() - start;
        
        await conn.sendMessage(from, {
            text: `⚡ Response Time: ${latency}ms`,
            edit: response.key
        });

    } catch (e) {
        console.error("Speed ping error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Ping with network test
cmd({
    pattern: "network",
    alias: ["netping"],
    desc: "Check network connectivity and speed",
    category: "utility",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const testStart = Date.now();
        const testMsg = await reply("🌐 Testing network connection...");
        
        const testEnd = Date.now();
        const networkLatency = testEnd - testStart;
        
        const networkStatus = networkLatency < 300 ? 'Excellent' : 
                            networkLatency < 600 ? 'Good' : 
                            networkLatency < 1000 ? 'Fair' : 'Poor';
        
        const networkMessage = `
🌐 *Network Test Results*

• *Response Time:* ${networkLatency}ms
• *Connection Quality:* ${networkStatus}
• *Server Location:* ${config.SERVER_LOCATION || "Africa/Harare"}

${networkLatency > 1000 ? '⚠️ Your connection seems slow!' : '✅ Connection is stable!'}
`.trim();

        await conn.sendMessage(from, {
            text: networkMessage,
            edit: testMsg.key
        });

    } catch (e) {
        console.error("Network test error:", e);
        reply(`❌ Network test failed: ${e.message}`);
    }
});
