const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
    pattern: 'version',
    react: '📌',
    desc: 'Check bot version and update status',
    category: 'info',
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const packageName = require('../package.json');
        const currentVersion = packageName.version;
        const time = moment().tz('Africa/Harare').format('HH:mm:ss');
        const date = moment().tz('Africa/Harare').format('DD/MM/YYYY');

        // Fetch latest version
        const apiUrl = 'https://raw.githubusercontent.com/mrfrank-ofc/SUBZERO-MD/master/package.json';
        const response = await axios.get(apiUrl);
        const latestVersion = response.data.version;

        // Version comparison
        const versionStatus = currentVersion === latestVersion 
            ? '🟢 UP-TO-DATE' 
            : '🔴 OUTDATED';
        
        const versionMessage = currentVersion === latestVersion
            ? `*Your SUBZERO is running the latest version!* 🎉`
            : `*Update available!* 🚀\nCurrent: v${currentVersion}\nLatest: v${latestVersion}`;

        // Build message
        const message = `
📌 *SUBZERO VERSION CHECK* 📌

${versionStatus}
        
${versionMessage}

⏰ *Time:* ${time}
📅 *Date:* ${date}

💻 *Developer:* ${config.OWNER_NAME || "Mr Frank"}
🤖 *Bot Name:* ${config.BOT_NAME || "SUBZERO-MD"}

🌟 *Support Development:*
🔗 ${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}
⭐ *Don't forget to star the repo!*
`.trim();

        // Send response with image
        await conn.sendMessage(from, { 
            image: { 
                url: config.ALIVE_IMG || 'https://i.postimg.cc/zv76KffW/IMG-20250115-WA0020.jpg' 
            },
            caption: message,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363304325601080@newsletter',
                    newsletterName: config.BOT_NAME ? `${config.BOT_NAME} Bot` : 'SUBZERO MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Version check error:", e);
        
        // Fallback message
        const fallback = `
⚠️ *Version Check Failed*
        
Couldn't fetch version information.
Please try again later.

🔗 Repository: ${config.REPO || "https://github.com/mrfrank-ofc/SUBZERO-MD"}
`.trim();
        
        reply(fallback);
    }
});
