const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');
const moment = require('moment-timezone');

// Constants
const DEFAULT_BANNER = 'https://i.postimg.cc/MpLk9Xmm/IMG-20250305-WA0010.jpg';
const DEFAULT_AUDIO = 'https://files.catbox.moe/qda847.m4a';
const DEFAULT_REPO = 'https://github.com/mrfrank-ofc/SUBZERO-MD';

cmd({
    pattern: "repo",
    alias: ["repository", "github", "gitrepo"],
    desc: "Show GitHub repository information",
    react: "📦",
    category: "utility",
    filename: __filename,
    use: '<github-repo-url> or leave empty for default repo'
},
async (Void, citel, text) => {
    try {
        // Determine repo URL
        let repoUrl = text.trim() || config.REPO || DEFAULT_REPO;
        
        // Validate and format repo URL
        if (!repoUrl.includes('github.com')) {
            if (!repoUrl.includes('/')) {
                return await citel.reply(`*Invalid format!*\nUse: .repo username/repo\nOr full GitHub URL`);
            }
            repoUrl = `https://github.com/${repoUrl.replace(/^\/|\/$/g, '')}`;
        }
        
        // Extract owner and repo name
        const repoPath = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/)[1];
        if (!repoPath) return await citel.reply('*Invalid GitHub repository URL*');

        // Send processing reaction
        await citel.react('⏳');

        // Fetch repository data from GitHub API
        const apiUrl = `https://api.github.com/repos/${repoPath}`;
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'SUBZERO-MD-Bot',
                ...(config.GITHUB_TOKEN && { 'Authorization': `token ${config.GITHUB_TOKEN}` })
            },
            timeout: 10000
        });

        const repoData = response.data;
        const zipUrl = `${repoData.html_url}/archive/refs/heads/${repoData.default_branch}.zip`;

        // Format the information
        const formattedInfo = `
*📦 Repository Information*

🔹 *Name:* ${repoData.name}
🔹 *Owner:* ${repoData.owner.login}
🔹 *Description:* ${repoData.description || 'No description'}
🔹 *Stars:* ⭐ ${repoData.stargazers_count}
🔹 *Forks:* 🍴 ${repoData.forks_count}
🔹 *Watchers:* 👀 ${repoData.subscribers_count || repoData.watchers_count}
🔹 *Open Issues:* ⚠️ ${repoData.open_issues_count}
🔹 *Language:* ${repoData.language || 'Not specified'}
🔹 *License:* ${repoData.license?.name || 'None'}
🔹 *Created:* ${moment(repoData.created_at).format('DD/MM/YYYY')}
🔹 *Updated:* ${moment(repoData.pushed_at).format('DD/MM/YYYY')}

📥 *Download:*
- [Download ZIP](${zipUrl})
- Clone: \`git clone ${repoData.clone_url}\`

🌐 *Links:*
- [View Repository](${repoData.html_url})
- [Owner Profile](${repoData.owner.html_url})

${repoData.archived ? '⚠️ *This repository is archived*' : ''}
`.trim();

        // Send response with owner avatar
        await Void.sendMessage(citel.chat, {
            image: { url: repoData.owner.avatar_url || config.ALIVE_IMG || DEFAULT_BANNER },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [citel.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: citel });

        // Optional: Send audio file
        if (config.SEND_AUDIO !== false) {
            await Void.sendMessage(citel.chat, {
                audio: { url: DEFAULT_AUDIO },
                mimetype: 'audio/mp4'
            }, { quoted: citel });
        }

        await citel.react('✅');

    } catch (error) {
        console.error("Repo command error:", error);
        await citel.react('❌');
        
        // Fallback message
        const repoUrl = config.REPO || DEFAULT_REPO;
        const repoPath = repoUrl.replace('https://github.com/', '');
        
        await citel.reply(`
*⚠️ Couldn't fetch full repository info*

Here's basic info:
🌐 *Repository:* ${repoUrl}
📥 *Download ZIP:* ${repoUrl}/archive/refs/heads/main.zip

Try again later or check the URL.
`.trim());
    }
});
