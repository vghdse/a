const { cmd } = require('../command')
const config = require('../config')
const axios = require('axios')
const moment = require('moment-timezone')

const FALLBACK_IMAGE = 'https://i.postimg.cc/MpLk9Xmm/IMG-20250305-WA0010.jpg'
const BK9_API = 'https://bk9.fun/stalk/githubrepo'

cmd({
    pattern: "repo",
    alias: ["repostalk", "github"],
    desc: "Get GitHub repository info",
    react: "📦",
    category: "info",
    filename: __filename
}, async (Void, citel, text) => {
    try {
        let repoUrl = text || config.REPO || 'mrfrank-ofc/SUBZERO-MD'
        
        if (!repoUrl.includes('github.com')) {
            repoUrl = 'https://github.com/' + repoUrl.replace(/^\/|\/$/g, '')
        }

        await citel.react('⏳')

        const { data } = await axios.get(`${BK9_API}?url=${encodeURIComponent(repoUrl)}`, { 
            timeout: 10000 
        })

        if (!data.status || !data.BK9) return await citel.reply('*Invalid repository data received*')

        const repo = data.BK9
        const owner = repo.owner
        const zipUrl = `${repo.html_url}/archive/refs/heads/${repo.default_branch}.zip`

        const message = `
*❄️ SUBZERO REPOSITORY INFO ❄️*

📂 *Repository Name:* ${repo.name}
👨‍💻 *Owner:* ${owner.login}
🔗 *URL:* ${repo.html_url}

⭐ *Stars:* ${repo.stargazers_count}
🍴 *Forks:* ${repo.forks_count}
👀 *Watchers:* ${repo.watchers_count}
💻 *Language:* ${repo.language || 'Not specified'}

📅 *Created:* ${moment(repo.created_at).format('DD/MM/YYYY')}
🔄 *Updated:* ${moment(repo.updated_at).format('DD/MM/YYYY')}

📥 *Download Options:*
▸ [Download ZIP](${zipUrl})
▸ \`git clone ${repo.clone_url}\`

${repo.archived ? '⚠️ *This repository is archived*' : ''}

*Type .install for setup instructions*
`
        await Void.sendMessage(citel.chat, {
            image: { url: owner.avatar_url || config.ALIVE_IMG || FALLBACK_IMAGE },
            caption: message,
            contextInfo: { mentionedJid: [citel.sender] }
        }, { quoted: citel })

        await citel.react('✅')

    } catch (err) {
        console.error(err)
        await citel.react('❌')
        await citel.reply(`
*⚠️ Error fetching repository info*

Basic Details:
▸ Repository: ${config.REPO || 'mrfrank-ofc/SUBZERO-MD'}
▸ ZIP: ${config.REPO || 'https://github.com/mrfrank-ofc/SUBZERO-MD'}/archive/main.zip

_Error: ${err.message || 'Request failed'}_
`)
    }
})
