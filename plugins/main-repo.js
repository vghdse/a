const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');
const moment = require('moment-timezone');

// Constants
const FALLBACK_IMAGE = 'https://i.postimg.cc/MpLk9Xmm/IMG-20250305-WA0010.jpg'; 
const BK9_API_URL = 'https://bk9.fun/stalk/githubrepo';

cmd({
    pattern: "repo",
    alias: ["repostalk", "github", "gitrepo"],
    desc: "Get GitHub repo info via BK9 API",
    react: "📦",
    category: "utility",
    filename: __filename,
    use: '<github-url> or username/repo'
},
async (Void, citel, text) => {
    try {
        // Determine repo URL
        let repoUrl = text.trim() || config.REPO || 'mrfrank-ofc/SUBZERO-MD';
        
        // Format URL for BK9 API
        if (!repoUrl.includes('github.com')) {
            repoUrl = `https://github.com/${repoUrl.replace(/^\/|\/$/g, '')}`;
        }

        // Send processing reaction
        await citel.react('⏳');

        // Fetch from BK9 API
        const { data } = await axios.get(`${BK9_API_URL}?url=${encodeURIComponent(repoUrl)}`, {
            timeout: 15000
        });

        if (!data.status || !data.BK9) {
            throw new Error('BK9 API returned invalid data');
        }

        const repo = data.BK9;
        const owner = repo.owner;
        const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`;

        // Format response
        const message = `
*📦 ${repo.name} Repository*

👤 *Owner:* [${owner.login}](${owner.html_url})
📝 *Desc:* ${repo.description || 'No description'}

⭐ *Stars:* ${repo.stargazers_count}
🍴 *Forks:* ${repo.forks_count} 
👀 *Watchers:* ${repo.watchers_count}
⚠️ *Issues:* ${repo.open_issues_count}
💻 *Language:* ${repo.language || 'None'}

📅 *Created:* ${moment(repo.created_at).format('DD/MM/YYYY')}
🔄 *Updated:* ${moment(repo.updated_at).format('DD/MM/YYYY')}

📥 *Download:*
🔗 [ZIP File](${zipUrl})
🔗 [Git Clone](${repo.clone_url})

${repo.archived ? '⚠️ *ARCHIVED REPOSITORY*' : ''}
`.trim();

        // Send with owner avatar (fallback to config image)
        await Void.sendMessage(citel.chat, {
            image: { 
                url: owner.avatar_url || config.ALIVE_IMG || FALLBACK_IMAGE 
            },
            caption: message,
            contextInfo: { 
                mentionedJid: [citel.sender] 
            }
        }, { quoted: citel });

        await citel.react('✅');

    } catch (error) {
        console.error('Repo command error:', error);
        await citel.react('❌');
        
        // Fallback with basic info
        const repoUrl = config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD';
        await citel.reply(`
*⚠️ Failed to fetch repo details*

Basic Info:
🌐 *Repository:* ${repoUrl}
📥 *ZIP Download:* ${repoUrl}/archive/main.zip

Error: ${error.message || 'API timeout'}
`.trim());
    }
});
