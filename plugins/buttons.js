const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd({
    pattern: "animeart",
    alias: ["animepic", "animeimage"],
    desc: "Generate cool anime-style images",
    category: "fun",
    react: "🎨",
    filename: __filename,
    use: "<text>"
}, async (conn, mek, m, { text, reply }) => {
    try {
        if (!text) return reply('🎨 *Please provide text*\nExample: .animeart Dragon Slayer');

        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

        // Using free anime image generation API
        const apiUrl = `https://anime-api-generator.cyclic.app/generate?text=${encodeURIComponent(text)}&theme=samurai`;
        
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        await conn.sendMessage(mek.chat, { 
            image: response.data,
            caption: `🎨 *${text}*\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`,
            contextInfo: {
                externalAdReply: {
                    title: "Anime Art Generator",
                    body: "Created with Anime API",
                    thumbnail: response.data,
                    mediaType: 1,
                    mediaUrl: "https://example.com",
                    sourceUrl: "https://example.com"
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error('Anime art error:', error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply('🎨 *Error generating image* - Please try again later');
    }
});
