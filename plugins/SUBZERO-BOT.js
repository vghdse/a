const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "mp3",
    alias: ["ytmp3", "ytaudio"],
    react: "🎧",
    desc: "Download YouTube audio (fast)",
    category: "download",
    use: "<query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube URL or search query!");

        // Extract video ID if URL is provided
        let videoId;
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoId = q.split(/[=/]/).pop().split("&")[0];
            if (videoId.length !== 11) return reply("❌ Invalid YouTube URL!");
        } else {
            // Search for video if query is provided
            const searchUrl = `https://kaiz-apis.gleeze.com/api/yts?q=${encodeURIComponent(q)}`;
            const searchRes = await axios.get(searchUrl);
            if (!searchRes.data?.videos?.length) return reply("❌ No results found!");
            videoId = searchRes.data.videos[0].videoId;
        }

        await reply("⚡ Fetching audio...");

        // Get MP3 download link
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytdown-mp3?url=https://youtube.com/watch?v=${videoId}`;
        const { data } = await axios.get(apiUrl);

        if (!data.download_url) return reply("❌ Failed to get download link!");

        // Send audio file
        await conn.sendMessage(from, {
            audio: { url: data.download_url },
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`.replace(/[^\w\s.-]/g, ''),
            contextInfo: {
                externalAdReply: {
                    title: data.title || "YouTube Audio",
                    body: "Downloaded via Kaiz API",
                    thumbnail: await axios.get(data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, { 
                        responseType: 'arraybuffer' 
                    }).then(res => res.data).catch(() => null),
                    mediaType: 2,
                    mediaUrl: `https://youtube.com/watch?v=${videoId}`
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("MP3 download error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
