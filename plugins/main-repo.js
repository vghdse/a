const { cmd } = require('../command');
const config = require('../config'); // Make sure this path is correct
const fetch = require('node-fetch');
const moment = require('moment-timezone');

// Constants
const BANNER_IMG = 'https://i.postimg.cc/MpLk9Xmm/IMG-20250305-WA0010.jpg';
const AUDIO_URL = 'https://files.catbox.moe/qda847.m4a';
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Show SubZero MD repository information",
    react: "❄️",
    category: "info",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Use config.REPO with fallback to default URL
        const repoUrl = config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD';
        const repoPath = repoUrl.replace('https://github.com/', '');
        const apiUrl = `https://api.github.com/repos/${repoPath}`;
        
        // Fetch repository data
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        
        const repoData = await response.json();

        // Format information
        const formattedInfo = `
*❄️ ${config.BOT_NAME || 'SUBZERO MD'} REPOSITORY ❄️*

👋 *Hello ${m.pushName || "User"}!* 

> *${config.DESCRIPTION || 'Simple, Icy, Cold & Feature-Rich WhatsApp Bot'}*

${readMore}
📂 *Repository Info:*
🔹 *Name:* ${repoData.name || 'SUBZERO-MD'}
🔹 *Owner:* ${repoData.owner?.login || config.OWNER_NAME || 'mrfrank-ofc'}
🔹 *Stars:* ⭐ ${repoData.stargazers_count || 0}
🔹 *Forks:* 🍴 ${repoData.forks_count || 0}
🔹 *Watchers:* 👀 ${repoData.watchers_count || 0}
🔹 *License:* 📜 ${repoData.license?.name || 'Not specified'}
🔹 *Created:* ${moment(repoData.created_at).format('MMMM Do YYYY')}
🔹 *Updated:* ${moment(repoData.updated_at).format('MMMM Do YYYY')}

📝 *Description:*
${repoData.description || 'No description available'}

🌐 *Repository URL:*
${repoUrl}

💡 *Don't forget to star & fork the repo!*

> *© Powered by ${config.OWNER_NAME || 'Mr Frank OFC'}*
`.trim();

        // Send image with repository info
        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG || BANNER_IMG },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363304325601080@newsletter',
                    newsletterName: config.BOT_NAME ? `${config.BOT_NAME} Bot` : 'ѕυϐzєяο м∂ ϐοτ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: AUDIO_URL },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

    } catch (error) {
        console.error("Repo command error:", error);
        
        // Fallback message if API fails
        const fallbackInfo = `
*❄️ ${config.BOT_NAME || 'SUBZERO MD'} REPOSITORY ❄️*

👋 *Hello ${m.pushName || "User"}!*

🌐 *Repository URL:*
${config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD'}

> *© Powered by ${config.OWNER_NAME || 'Mr Frank OFC'}*
`.trim();

        await reply(fallbackInfo);
    }
});
