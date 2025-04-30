const { cmd } = require('../command');
const { sleep } = require('../lib/functions');
const config = require('../config');
const moment = require('moment-timezone');

cmd({
    pattern: "restart2",
    alias: ["reboot", "refresh", "reload"],
    desc: "Restart the SubZero MD bot system",
    category: "system",
    react: "🔄",
    filename: __filename,
    ownerOnly: true
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Enhanced ASCII Art Header with better emojis
        const subzeroArt = `
╭────────────⟢
│      🚀 *SubZero MD System*      
│                                 
│  🤖 *Bot Name:* ${config.BOT_NAME || "SubZero MD"}  
│  👨‍💻 *Owner:* ${config.OWNER_NAME || "Darrell Mucheri"}  
│  📌 *Version:* ${config.VERSION || "3.0.0"}        
│  🕒 *Time:* ${moment().tz(config.TIMEZONE || "Africa/Harare").format("HH:mm:ss")}  
╰────────────⟢`.trim();

        // Initial notification with better formatting
        const initMsg = await conn.sendMessage(from, {
            text: `${subzeroArt}\n\n` +
                  "⚠️ *SYSTEM RESTART INITIATED*\n\n" +
                  "▸ 🔄 System refresh requested\n" +
                  "▸ ⏳ Preparing for graceful restart\n" +
                  "▸ 🛠️ Services will temporarily unavailable\n\n" +
                  "⌛ Beginning restart sequence in 3 seconds..."
        });

        const messageKey = initMsg.key;

        // Enhanced countdown with professional emojis
        const countdownFrames = [
            { text: "🔄 *Restart Sequence Started*\n\n" +
                    "▸ 3... Initializing system checks\n" +
                    "▸ 📊 Saving active sessions\n" +
                    "▸ 🗃️ Closing database connections", 
              delay: 1000 },
            
            { text: "⚙️ *Restart In Progress*\n\n" +
                    "▸ 2... Finalizing processes\n" +
                    "▸ 📡 Disconnecting network\n" +
                    "▸ 🔒 Securing temporary files", 
              delay: 1000 },
            
            { text: "🚀 *Final Countdown*\n\n" +
                    "▸ 1... Preparing reboot\n" +
                    "▸ ♻️ Memory cleanup\n" +
                    "▸ 🛑 Stopping services", 
              delay: 1000 },
            
            { text: "💫 *Rebooting Now*\n\n" +
                    "▸ 🎯 Executing restart command\n" +
                    "▸ ⚡ PM2 process manager engaged\n" +
                    "▸ 🕒 Estimated downtime: 15-20s\n\n" +
                    "✅ Will automatically reconnect", 
              delay: 500 }
        ];

        // Animated countdown
        for (const frame of countdownFrames) {
            await sleep(frame.delay);
            try {
                await conn.sendMessage(from, {
                    text: `${subzeroArt}\n\n${frame.text}`,
                    edit: messageKey
                });
            } catch (editError) {
                console.error("Message edit failed:", editError);
            }
        }

        // Execute restart with enhanced status
        const { exec } = require("child_process");
        exec("pm2 restart all", (error) => {
            if (error) {
                console.error("Restart failed:", error);
                require('fs').appendFileSync('restart.log', 
                    `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ❌ RESTART FAILED: ${error}\n`);
                
                conn.sendMessage(from, {
                    text: `${subzeroArt}\n\n` +
                          "❌ *RESTART FAILED*\n\n" +
                          "▸ 🚨 Critical error encountered\n" +
                          "▸ 📛 Error: " + error.message + "\n\n" +
                          "🛠️ *Troubleshooting Steps*\n" +
                          "▸ 1. Check PM2 status\n" +
                          "▸ 2. Verify system resources\n" +
                          "▸ 3. Manual command: `pm2 restart all`"
                }).catch(e => console.error("Failed to send error:", e));
            } else {
                console.log("✅ Restart command executed successfully");
            }
        });

    } catch (e) {
        console.error("Restart Command Error:", e);
        await reply(
            "🛑 *RESTART EXECUTION FAILED*\n\n" +
            "▸ 🚫 Error: " + e.message + "\n" +
            "▸ 📍 Location: " + e.stack.split('\n')[1].trim() + "\n\n" +
            "🆘 Please contact developer if issue persists"
        );
