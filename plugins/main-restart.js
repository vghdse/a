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
