const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

// Configure axios with better settings
const axiosInstance = axios.create({
  timeout: 30000, // Increased timeout to 30 seconds
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': '*/*',
    'Accept-Encoding': 'identity', // Important for audio downloads
    'Connection': 'keep-alive',
    'Referer': 'https://www.youtube.com/'
  }
});

cmd(
    {
        pattern: 'songc',
        alias: ['play3', 'song3'],
        desc: 'YouTube audio downloader using GiftedTech API',
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

            // Fetch song data from GiftedTech API
            const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
            const apiResponse = await axiosInstance.get(apiUrl);
            
            if (!apiResponse.data?.success || !apiResponse.data?.result?.media?.[0]?.download_url) {
                return reply('🎵 Failed to fetch audio - API error');
            }

            const songData = apiResponse.data.result;
            const audioInfo = songData.media[0];

            // Get thumbnail
            let thumbnailBuffer;
            try {
                const thumbnailResponse = await axiosInstance.get(songData.thumbnail, {
                    responseType: 'arraybuffer'
                });
                thumbnailBuffer = Buffer.from(thumbnailResponse.data, 'binary');
            } catch {
                thumbnailBuffer = null;
            }

            // Format song information
            const songInfo = `🎧 *${songData.title}*\n` +
                            `📦 Format: ${audioInfo.format}\n` +
                            `💾 Size: ${audioInfo.size}\n\n` +
                            `> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɢɪғᴛᴇᴅᴛᴇᴄʜ ᴀᴘɪ`;

            // Send song info with thumbnail
            await conn.sendMessage(mek.chat, {
                image: thumbnailBuffer,
                caption: songInfo,
                contextInfo: {
                    externalAdReply: {
                        title: songData.title,
                        body: `Format: ${audioInfo.format} | Size: ${audioInfo.size}`,
                        thumbnail: thumbnailBuffer,
                        mediaType: 1,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl
                    }
                }
            }, { quoted: mek });

            // Download and send audio with proper headers
            try {
                const audioResponse = await axiosInstance.get(audioInfo.download_url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Referer': 'https://www.youtube.com/',
                        'Origin': 'https://www.youtube.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
                        'Range': 'bytes=0-',
                        'Accept-Encoding': 'identity' // Important for audio downloads
                    }
                });

                await conn.sendMessage(mek.chat, {
                    audio: Buffer.from(audioResponse.data, 'binary'),
                    mimetype: 'audio/mpeg',
                    fileName: `${songData.title.replace(/[^\w\s]/gi, '')}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: songData.title,
                            body: `🎵 ${Config.BOT_NAME}`,
                            thumbnail: thumbnailBuffer,
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
