const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "songp",
    alias: ["mp3", "music"],
    desc: "Download songs from YouTube",
    category: "media",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        // Robust input handling
        let query = '';
        if (typeof args === 'string') {
            query = args.trim();
        } else if (Array.isArray(args)) {
            query = args.join(' ').trim();
        } else if (args && typeof args === 'object') {
            query = String(args).trim();
        }

        if (!query) {
            return reply("Please provide a song name or YouTube URL\nExample: .song lily\nOr: .song https://youtu.be/ox4tmEV6-QU");
        }

        // Always show processing message first
        await reply("⚡ Processing your song request...");

        // Determine if it's a URL or search query
        const isUrl = /(youtube\.com|youtu\.be)/i.test(query);
        const endpoint = isUrl ? 'ytmp3' : 'ytsearch';
        const param = isUrl ? 'url' : 'query';
        
        // Make API request
        const apiUrl = `https://kaiz-apis.gleeze.com/api/${endpoint}?${param}=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl, {
            timeout: 30000 // 30 second timeout
        });
        
        const data = response.data;

        // Handle search results if no direct download
        if (!data.download_url && data.items?.length > 0) {
            const firstResult = data.items[0];
            return reply(
                `🎵 *Search Result Found*\n\n` +
                `📌 *Title*: ${firstResult.title}\n` +
                `👤 *Artist*: ${firstResult.author}\n\n` +
                `To download, reply with:\n.song ${firstResult.url}`
            );
        }

        // Verify we have download URL
        if (!data?.download_url) {
            throw new Error("No download link found");
        }

        // Send the audio file with metadata
        await conn.sendMessage(from, {
            audio: { url: data.download_url },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: data.title || 'Audio Download',
                    body: data.author || 'Unknown Artist',
                    thumbnailUrl: data.thumbnail || '',
                    mediaType: 1,
                    mediaUrl: ''
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error('Song Download Error:', error);
        
        // User-friendly error messages
        let errorMsg = "⚠️ Failed to download song";
        if (error.response?.status === 404) {
            errorMsg = "🔍 Song not found, please try another";
        } else if (error.code === 'ECONNABORTED') {
            errorMsg = "⏳ Request timed out, please try again";
        } else if (error.message.includes('No download link')) {
            errorMsg = "❌ No download link available for this song";
        }
        
        reply(errorMsg);
    }
});
