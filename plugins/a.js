const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

// Configure axios for maximum speed
const axiosInstance = axios.create({
  timeout: 15000, // 15 second timeout (reduced from 30)
  maxRedirects: 3, // Reduced from 5
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

cmd(
    {
        pattern: 'songc',
        alias: ['play', 'music'],
        desc: 'Instant YouTube MP3 downloader',
        category: 'media',
        react: '🎵',
        use: '<YouTube URL or search query>',
        filename: __filename,
    },
    async (conn, mek, m, { text, reply }) => {
        try {
            if (!text) return reply('❌ Please provide a YouTube URL or search query');

            // Immediately show loading reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Get video URL (direct if already a YouTube link)
            const videoUrl = text.match(/youtu\.?be/) ? text : await getVideoUrl(text);
            if (!videoUrl) return reply('❌ No results found');

            // Fetch download URL from Kaiz API
            const apiResponse = await axiosInstance.get(`https://kaiz-apis.gleeze.com/api/ytdown-mp3?url=${encodeURIComponent(videoUrl)}`);
            if (!apiResponse.data?.download_url) return reply('❌ Failed to get download link');

            // Download audio in parallel with sending the file
            const [audioResponse] = await Promise.all([
                axiosInstance.get(apiResponse.data.download_url, {
                    responseType: 'arraybuffer',
                    headers: { 'Referer': 'https://www.youtube.com/' }
                }),
                // Send minimal info immediately
                conn.sendMessage(mek.chat, { 
                    text: `⬇️ Downloading: ${apiResponse.data.title.substring(0, 50)}...` 
                })
            ]);

            // Send audio immediately without extra info
            await conn.sendMessage(mek.chat, {
                audio: Buffer.from(audioResponse.data, 'binary'),
                mimetype: 'audio/mpeg',
                fileName: `${apiResponse.data.title.substring(0, 64)}.mp3`.replace(/[^\w\s.-]/gi, '')
            });

            // Update reaction to success
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('❌ Failed to download. Try again or use a different link.');
        }
    }
);

// Fast video URL resolver
async function getVideoUrl(query) {
    try {
        const response = await axiosInstance.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        const videoId = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtu.be/${videoId}` : null;
    } catch {
        return null;
    }
}
