const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

// Configure axios with better settings
const axiosInstance = axios.create({
  timeout: 30000, // 30 second timeout
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*'
  }
});

cmd(
    {
        pattern: 'song3',
        alias: ['play3', 'song3'],
        desc: 'YouTube MP3 downloader using Kaiz API',
        category: 'media',
        react: '🎵',
        use: '<YouTube URL or search query>',
        filename: __filename,
    },
    async (conn, mek, m, { text, reply }) => {
        try {
            if (!text) return reply('🎵 *Usage:* .song3 <query/url>\nExample: .song3 https://youtu.be/ox4tmEV6-QU\n.song3 Alan Walker Lily');

            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Get video URL
            const videoUrl = await getVideoUrl(text);
            if (!videoUrl) return reply('🎵 No results found for your search');

            // Fetch song data from Kaiz API
            const apiUrl = `https://kaiz-apis.gleeze.com/api/ytdown-mp3?url=${encodeURIComponent(videoUrl)}`;
            const apiResponse = await axiosInstance.get(apiUrl);
            
            if (!apiResponse.data?.download_url) {
                return reply('🎵 Failed to fetch download link from API');
            }

            const songData = apiResponse.data;

            // Send initial info
            const songInfo = `🎧 *${songData.title}*\n\n` +
                            `> Downloading audio...\n\n` +
                            `> © Powered by Kaiz API`;

            await conn.sendMessage(mek.chat, {
                text: songInfo
            }, { quoted: mek });

            // Download and send audio
            try {
                const audioResponse = await axiosInstance.get(songData.download_url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Referer': 'https://www.youtube.com/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                await conn.sendMessage(mek.chat, {
                    audio: Buffer.from(audioResponse.data, 'binary'),
                    mimetype: 'audio/mpeg',
                    fileName: songData.title,
                    contextInfo: {
                        externalAdReply: {
                            title: songData.title,
                            body: `🎵 ${Config.BOT_NAME}`,
                            mediaType: 1,
                            mediaUrl: videoUrl,
                            sourceUrl: videoUrl
                        }
                    }
                });

                await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });
            } catch (downloadError) {
                console.error('Download error:', downloadError);
                await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
                reply('🎵 Download failed: The audio file could not be retrieved. Please try again later.');
            }

        } catch (error) {
            console.error('Error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('🎵 Error: ' + (error.message || 'Please try again later'));
        }
    }
);

// Helper to get video URL
async function getVideoUrl(input) {
    if (input.match(/youtu\.?be/)) return input;
    
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
        const response = await axiosInstance.get(searchUrl);
        const videoId = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch (e) {
        console.error('Search error:', e);
        return null;
    }
}
