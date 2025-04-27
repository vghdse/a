const axios = require('axios');
const { cmd } = require('../command');
const Config = require('../config');

// NPM Package Search Plugin (Simplified)
cmd({
    pattern: "npm",
    alias: ["npms"],
    desc: "Search for npm packages",
    category: "tools",
    react: "📦",
    filename: __filename,
    use: "<package name>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply(`Please provide a package name\nExample: *${Config.PREFIX}npm axios*`);

        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

        const response = await axios.get(`https://draculazyx-xyzdrac.hf.space/api/Npm?q=${encodeURIComponent(args[0])}`);
        const pkg = response.data;

        if (!pkg.status || pkg.status !== 200) return reply("❌ Package not found or API error");

        const packageInfo = `📦 *${pkg.name}@${pkg.version}*\n\n` +
            `📝 ${pkg.description}\n\n` +
            `🏠 *Homepage*: ${pkg.homepage}\n` +
            `📂 *Repository*: ${pkg.repository}\n` +
            `👤 *Author*: ${pkg.author}\n` +
            `🔄 *Last Published*: ${new Date(pkg.last_published).toLocaleDateString()}\n\n` +
            `🔗 *NPM URL*: ${pkg.npm_url}\n\n` +
            (pkg.keywords?.length > 0 ? `🏷️ *Keywords*: ${pkg.keywords.join(', ')}\n` : '') +
            (pkg.maintainers ? `👥 *Maintainers*: ${pkg.maintainers}\n` : '') +
            `\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`;

        await conn.sendMessage(mek.chat, { 
            text: packageInfo,
            contextInfo: {
                externalAdReply: {
                    title: `${pkg.name}@${pkg.version}`,
                    body: pkg.description.substring(0, 50) + (pkg.description.length > 50 ? "..." : ""),
                    thumbnail: 'https://files.catbox.moe/m31j88.jpg', // NPM logo
                    mediaType: 1,
                    mediaUrl: pkg.npm_url,
                    sourceUrl: pkg.npm_url
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("NPM search error:", error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply("❌ Error searching for package. Please try again later.");
    }
});

// Anime Quotes Plugin (With Thumbnail)
cmd({
    pattern: "animequote",
    alias: ["aquote", "aniquote"],
    desc: "Get random anime quotes",
    category: "fun",
    react: "🌸",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

        const response = await axios.get('https://draculazyx-xyzdrac.hf.space/api/aniQuotes');
        const quote = response.data;

        if (!quote.SUCCESS) return reply("❌ Failed to fetch anime quote");

        const quoteText = `🌸 *${quote.MESSAGE.anime}*\n\n"${quote.MESSAGE.quote}"\n\n- ${quote.MESSAGE.author}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`;

        await conn.sendMessage(mek.chat, { 
            image: { url: 'https://files.catbox.moe/m31j88.jpg' }, // Anime thumbnail
            caption: quoteText,
            contextInfo: {
                externalAdReply: {
                    title: quote.MESSAGE.anime,
                    body: "Random Anime Quote",
                    thumbnail: await getImageBuffer('https://files.catbox.moe/m31j88.jpg'),
                    mediaType: 1,
                    mediaUrl: "https://myanimelist.net/",
                    sourceUrl: "https://myanimelist.net/"
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Anime quote error:", error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply("❌ Error fetching anime quote. Please try again later.");
    }
});

// Helper function to get image buffer
async function getImageBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null;
    }
}
