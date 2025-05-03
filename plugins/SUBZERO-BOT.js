const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "song",
    alias: ["play", "music"],
    react: "🎵",
    desc: "Download YouTube audio instantly",
    category: "download",
    use: "<query/url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Provide song name/URL!");

        // Immediately start processing
        const processingMsg = await reply("⚡ Processing...");
        
        // Extract video ID whether from URL or search
        let videoId = q.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        
        if (!videoId) {
            // Fast search API call
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
            const { data } = await axios.get(searchUrl, { timeout: 5000 });
            videoId = data.match(/\/watch\?v=([^"&?\/ ]{11})/)?.[1];
            if (!videoId) return reply("❌ No results found!");
        }

        // Direct API call without waiting for response
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url=https://youtu.be/${videoId}`;
        
        // Start download immediately
        conn.sendMessage(from, { 
            audio: { url: apiUrl }, // Directly pass API URL
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: mek });

        // Delete processing message
        if (processingMsg) {
            await conn.sendMessage(from, { 
                delete: processingMsg.key 
            });
        }

    } catch (error) {
        console.error("Fast download error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
