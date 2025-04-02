const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');
const moment = require('moment-timezone');

// Constants
const BANNER_IMG = 'https://i.postimg.cc/MpLk9Xmm/IMG-20250305-WA0010.jpg';
const AUDIO_URL = 'https://files.catbox.moe/qda847.m4a';
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info", "repository"],
    desc: "Show GitHub repository information",
    react: "❄️",
    category: "info",
    filename: __filename,
    use: '<github-repo-url> or leave empty for default repo'
},
async (conn, mek, m, { from, reply, args, q }) => {
    try {
        // Determine repo URL (user input or config default)
        let repoUrl = q || config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD';
        if (!repoUrl.startsWith('http') {
            repoUrl = 'https://github.com/' + repoUrl;
        }

        // Send processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Call BK9 API for rich repository data
        const bk9Url = `https://bk9.fun/stalk/githubrepo?url=${encodeURIComponent(repoUrl)}`;
        const bk9Response = await axios.get(bk9Url, { timeout: 10000 });
        
        if (!bk9Response.data.status) {
            throw new Error('BK9 API failed');
        }

        const repoData = bk9Response.data.BK9;
        const ownerData = repoData.owner;
        const zipUrl = `${repoData.html_url}/archive/refs/heads/${repoData.default_branch}.zip`;

        // Format the information
        const formattedInfo = `
*❄️ ${config.BOT_NAME || 'SUBZERO MD'} REPOSITORY ❄️*

👋 *Hello ${m.pushName || "User"}!* 

> *${config.DESCRIPTION || 'Simple, Icy, Cold & Feature-Rich WhatsApp Bot'}*

${readMore}
📂 *Repository Information*

🔹 *Name:* ${repoData.name}
🔹 *Owner:* [${ownerData.login}](${ownerData.html_url})
🔹 *Description:* ${repoData.description || 'No description'}
🔹 *Stars:* ⭐ ${repoData.stargazers_count}
🔹 *Forks:* 🍴 ${repoData.forks_count}
🔹 *Watchers:* 👀 ${repoData.watchers_count}
🔹 *Open Issues:* ⚠️ ${repoData.open_issues_count}
🔹 *Language:* ${repoData.language || 'Not specified'}
🔹 *License:* 📜 ${repoData.license?.name || 'Not specified'}
🔹 *Created At:* ${moment(repoData.created_at).format('MMMM Do YYYY')}
🔹 *Last Updated:* ${moment(repoData.updated_at).format('MMMM Do YYYY')}

📦 *Download Options:*
- [Download ZIP](${zipUrl})
- [Git Clone](${repoData.clone_url})

🌐 *Links:*
- [Repository](${repoData.html_url})
- [Owner Profile](${ownerData.html_url})

💡 *Don't forget to star & fork the repo!*

> *© Powered by ${config.OWNER_NAME || 'Mr Frank OFC'}*
`.trim();

        // Send response with owner avatar as banner (fallback to default)
        await conn.sendMessage(from, {
            image: { url: ownerData.avatar_url || config.ALIVE_IMG || BANNER_IMG },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: AUDIO_URL },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

        // Send success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Repo command error:", error);
        
        // Fallback to basic info when API fails
        const repoUrl = config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD';
        const repoPath = repoUrl.replace('https://github.com/', '');
        const zipUrl = `${repoUrl}/archive/refs/heads/main.zip`;

        const fallbackInfo = `
*❄️ ${config.BOT_NAME || 'SUBZERO MD'} REPOSITORY ❄️*

👋 *Hello ${m.pushName || "User"}!*

🌐 *Repository URL:*
${repoUrl}

📦 *Download Options:*
- [Download ZIP](${zipUrl})
- Git Clone: \`git clone https://github.com/${repoPath}.git\`

> *© Powered by ${config.OWNER_NAME || 'Mr Frank OFC'}*
`.trim();

        await conn.sendMessage(from, {
            image: { url: config.ALIVE_IMG || BANNER_IMG },
            caption: fallbackInfo
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});
