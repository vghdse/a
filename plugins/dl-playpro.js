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
        // Ensure args is a string
        const input = typeof args === 'string' ? args : '';
        if (!input.trim()) return reply("Please provide a song name or YouTube URL\nExample: .song lily\nOr: .song https://youtu.be/ox4tmEV6-QU");

        // Check if input is URL
        const isUrl = /(youtube\.com|youtu\.be)/i.test(input);
        
        // Show processing message
        await reply("🔍 Processing your request...");

        // Fetch from API
        const apiUrl = `https://kaiz-apis.gleeze.com/api/${isUrl ? 'ytmp3' : 'ytsearch'}?${isUrl ? 'url=' + encodeURIComponent(input) : 'query=' + encodeURIComponent(input)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.download_url) {
            // Handle search results
            if (data.items && data.items.length > 0) {
                const firstResult = data.items[0];
                return reply(`🎵 *Search Result*\n\n📌 Title: ${firstResult.title}\n👤 Artist: ${firstResult.author}\n\nUse: .song ${firstResult.url}`);
            }
            throw new Error("No results found");
        }

        // Send the audio file
        await conn.sendMessage(from, {
            audio: { url: data.download_url },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: data.title,
                    body: data.author,
                    thumbnailUrl: data.thumbnail,
                    mediaType: 1,
                    mediaUrl: ''
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Song download error:", e);
        reply(`⚠️ Error: ${e.message || "Failed to download song"}`);
    }
});
