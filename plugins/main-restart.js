/*
╔════════════════════════════════════════╗
║                                        ║
║   ███████╗██╗   ██╗██████╗ ███████╗  ║
║   ██╔════╝██║   ██║██╔══██╗██╔════╝  ║
║   ███████╗██║   ██║██████╔╝█████╗    ║
║   ╚════██║██║   ██║██╔══██╗██╔══╝    ║
║   ███████║╚██████╔╝██║  ██║███████╗  ║
║   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝  ║
║                                        ║
╠════════════════════════════════════════╣
║  � Project: SubZero MD                 ║
║  👨‍💻 Creator: Darrell Mucheri           ║
║  (Mr Frank OFC)                        ║
║  📦 Repo: github.com/mrfrank-ofc/SUBZERO-MD ║
║  💬 Support: wa.me/18062212660         ║
╚════════════════════════════════════════╝
*/
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
╔════════════════════════════════════════╗
║                                        ║
║   ███████╗██╗   ██╗██████╗ ███████╗  ║
║   ██╔════╝██║   ██║██╔══██╗██╔════╝  ║
║   ███████╗██║   ██║██████╔╝█████╗    ║
║   ╚════██║██║   ██║██╔══██╗██╔══╝    ║
║   ███████║╚██████╔╝██║  ██║███████╗  ║
║   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝  ║
║                                        ║
╠════════════════════════════════════════╣
║  🚀 Project: ${config.BOT_NAME || "SubZero MD"}     ║
║  👨‍💻 Creator: ${config.OWNER_NAME || "Darrell Mucheri"} ║
║  📦 Version: ${config.VERSION || "3.0.0"}           ║
║  🌐 Repo: ${config.REPO || "github.com/mrfrank-ofc/SUBZERO-MD"} ║
╚════════════════════════════════════════╝
`.trim();

        // Initial warning message
        const warningMsg = await reply(`${subzeroArt}\n\n⚠️ *SYSTEM RESTART INITIATED!*\n\n` + 
                                      "🔄 The bot will restart in 3 seconds...\n" +
                                      "⏳ Please wait 15-20 seconds before using commands");

        // Cool countdown animation
        const countdownFrames = [
            "🔄 Restarting in 3... 🔥",
            "🚀 Restarting in 2... 💫",
            "⚡ Restarting in 1... 🌪️",
            "💥 *SYSTEM REBOOTING NOW!*"
        ];

        for (let i = 0; i < countdownFrames.length; i++) {
            await sleep(1000);
            await conn.sendMessage(from, {
                text: `${subzeroArt}\n\n${countdownFrames[i]}`,
                edit: warningMsg.key
            });
        }

        // Final message before restart (won't be seen but good for logs)
        await conn.sendMessage(from, {
            text: `${subzeroArt}\n\n✅ *Restart sequence completed!*\n` +
                  `⏱️ ${moment().tz('Africa/Harare').format('HH:mm:ss DD/MM/YYYY')}\n` +
                  "📌 The bot should be back online shortly...",
            edit: warningMsg.key
        });

        // Execute restart
        const { exec } = require("child_process");
        exec("pm2 restart all", (error) => {
            if (error) {
                console.error("Restart failed:", error);
                // Log to file since bot is restarting
                require('fs').appendFileSync('restart.log', 
                    `[${new Date().toISOString()}] Restart failed: ${error}\n`);
            }
        });

    } catch (e) {
        console.error("Restart Command Error:", e);
        reply("⚠️ *RESTART FAILED!*\n" + 
              "Error: " + e.message + "\n\n" +
              "Please try manually: `pm2 restart all`");
    }
});


/*const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "restart",
    alias: ["reboot", "refresh"],
    desc: "Restart the SubZero MD bot system",
    category: "system",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        // Warning message with countdown
        await reply("⚠️ *WARNING: System Restart Initiated!*\n\n" +
                   "🔄 The bot will restart in 3 seconds...\n" +
                   "📌 Please wait 15-20 seconds before using commands again.");
        
        // Countdown animation
        await sleep(1000);
        await reply("3...");
        await sleep(1000);
        await reply("2...");
        await sleep(1000);
        await reply("1...");
        await sleep(500);
        
        // Restart process
        const { exec } = require("child_process");
        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error(`Restart error: ${error}`);
                // This won't be sent since bot is restarting
                // Consider logging to a file instead
            }
            console.log(`Restart successful: ${stdout}`);
        });

    } catch (e) {
        console.error("Restart Command Error:", e);
        // This might not send if the bot is already restarting
        reply("⚠️ *Error During Restart!*\n" + e.message);
    }
});
*/
