const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd(
    {
        pattern: 'npm',
        alias: ['npmpkg', 'npmsearch'],
        desc: 'Search for NPM packages',
        category: 'utilities',
        use: '<package name>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('📦 *Please provide an NPM package name*\nExample: .npm axios');

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "🔍", key: mek.key } });

            const apiUrl = `https://api.giftedtech.web.id/api/search/npmsearch?apikey=gifted&packagename=${encodeURIComponent(q)}`;
            
            const response = await axios.get(apiUrl);
            
            if (!response.data.success || !response.data.result) {
                return reply('❌ *Package not found or API error*');
            }

            const pkg = response.data.result;
            
            // Format the response with emojis
            let message = `📦 *${pkg.name}* v${pkg.version}\n\n`;
            message += `📝 *Description:* ${pkg.description}\n\n`;
            message += `🕒 *Published:* ${pkg.publishedDate}\n`;
            message += `👤 *Owner:* ${pkg.owner}\n`;
            message += `📜 *License:* ${pkg.license}\n\n`;
            
            if (pkg.keywords && pkg.keywords.length > 0 && pkg.keywords[0] !== "N/A") {
                message += `🏷️ *Keywords:* ${pkg.keywords.join(', ')}\n\n`;
            }
            
            message += `🔗 *NPM Page:* ${pkg.packageLink}\n`;
            if (pkg.homepage && pkg.homepage !== "N/A") {
                message += `🌐 *Homepage:* ${pkg.homepage}\n`;
            }
            if (pkg.downloadLink && pkg.downloadLink !== "N/A") {
                message += `⬇️ *Download:* ${pkg.downloadLink}\n`;
            }

            // Send the formatted message
            await conn.sendMessage(mek.chat, { 
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: `NPM: ${pkg.name}`,
                        body: pkg.description.substring(0, 50) + (pkg.description.length > 50 ? '...' : ''),
                        thumbnail: await getNpmThumbnail(pkg.name),
                        mediaType: 1,
                        sourceUrl: pkg.packageLink
                    }
                }
            }, { quoted: mek });

            // Send success reaction
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Error in npm command:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('❌ *Error searching NPM. Please try again later.*');
        }
    }
);

// Helper function to get NPM package thumbnail
async function getNpmThumbnail(packageName) {
    try {
        // Try to get logo from npms.io
        const npmsResponse = await axios.get(`https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`);
        if (npmsResponse.data?.collected?.metadata?.links?.repository) {
            const repoUrl = npmsResponse.data.collected.metadata.links.repository;
            if (repoUrl.includes('github.com')) {
                const repoPath = repoUrl.split('github.com/')[1].split('/').slice(0, 2).join('/');
                return `https://opengraph.githubassets.com/1/${repoPath}`;
            }
        }
        
        // Fallback to standard NPM icon
        return 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png';
    } catch {
        return null;
    }
}
