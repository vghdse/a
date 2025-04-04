const { cmd } = require('../command');
const { sleep } = require('../lib/functions');
const config = require('../config');
const moment = require('moment-timezone');

cmd({
    pattern: "restart",
    alias: ["reboot", "refresh", "reload"],
    desc: "Restart the SubZero MD bot system",
    category: "system",
    react: "🔄",
    filename: __filename,
    ownerOnly: true
},
async (conn, mek, m, { from, reply }) => {
    try {
        // ASCII Art Header
        const subzeroArt = `
                                    
╭──╴╴╴╴╴▢ *𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐁𝐎𝐓* ▢
> ┃  🚀 Project: ${config.BOT_NAME || "SubZero MD"}     
> ┃  👨‍💻 Creator: ${config.OWNER_NAME || "Darrell Mucheri"} 
> ┃  📦 Version: ${config.VERSION || "3.0.0"}           
╰╶╶╶╶▢
`.trim();

        // Initial warning message
        const warningMsg = await conn.sendMessage(from, { 
            text: `${subzeroArt}\n\n⚠️ *SYSTEM RESTART INITIATED!*\n\n` + 
                  "🔄 The bot will restart in 3 seconds...\n" +
                  "⏳ Please wait 15-20 seconds before using commands"
        });

        // Store the message key for editing
        const messageKey = warningMsg.key;

        // Cool countdown animation
        const countdownFrames = [
            { text: "🔄 Restarting in 3... 🔥", delay: 1000 },
            { text: "🚀 Restarting in 2... 💫", delay: 1000 },
            { text: "⚡ Restarting in 1... 🌪️", delay: 1000 },
            { text: "💥 *SYSTEM REBOOTING NOW!*", delay: 500 }
        ];

        for (const frame of countdownFrames) {
            await sleep(frame.delay);
            try {
                await conn.sendMessage(from, {
                    text: `${subzeroArt}\n\n${frame.text}`,
                    edit: messageKey
                });
            } catch (editError) {
                console.error("Failed to edit message:", editError);
                // Continue with restart even if edit fails
            }
        }

        // Execute restart
        const { exec } = require("child_process");
        exec("pm2 restart all", (error) => {
            if (error) {
                console.error("Restart failed:", error);
                // Log to file since bot may be restarting
                require('fs').appendFileSync('restart.log', 
                    `[${new Date().toISOString()}] Restart failed: ${error}\n`);
                
                // Try to send failure notification (may not work if connection is down)
                conn.sendMessage(from, { 
                    text: "⚠️ *RESTART FAILED!*\n" +
                          `Error: ${error.message}\n\n` +
                          "Please try manually: `pm2 restart all`"
                }).catch(e => console.error("Failed to send error message:", e));
            } else {
                console.log("Restart command sent successfully");
            }
        });

    } catch (e) {
        console.error("Restart Command Error:", e);
        try {
            await reply("⚠️ *RESTART FAILED!*\n" + 
                        `Error: ${e.message}\n\n` +
                        "Please try manually: `pm2 restart all`");
        } catch (sendError) {
            console.error("Failed to send error message:", sendError);
        }
    }
});
