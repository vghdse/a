const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

// Configure axios with YouTube-specific headers
const axiosInstance = axios.create({
  timeout: 30000,
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.youtube.com/',
    'Origin': 'https://www.youtube.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site'
  }
});

cmd(
    {
        pattern: 'song3',
        alias: ['play3', 'song3'],
        desc: 'YouTube audio downloader',
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

            // Fetch song data from API
            const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
            const apiResponse = await axiosInstance.get(apiUrl);
            
            if (!apiResponse.data?.success || !apiResponse.data?.result?.media) {
                return reply('🎵 Failed to get download links from API');
            }

            const songData = apiResponse.data.result;
            
            // Select the ultralow webm format (itag 600)
            const audioInfo = songData.media.find(item => 
                item.download_url.includes('itag=600') || 
                item.format.includes('Ultralow')
            );
            
            if (!audioInfo) {
                return reply('🎵 Ultralow quality not available');
            }

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

            // Send song info first
            const songInfo = `🎧 *${songData.title}*\n` +
                            `📦 Format: ${audioInfo.format}\n` +
                            `💾 Size: ${audioInfo.size}\n\n` +
                            `> Downloading audio...`;

            await conn.sendMessage(mek.chat, {
                image: thumbnailBuffer,
                caption: songInfo
            }, { quoted: mek });

            // Download audio with YouTube-specific headers
            try {
                const audioResponse = await axiosInstance.get(audioInfo.download_url, {
                    responseType: 'arraybuffer',
                    headers: {
                        'Referer': 'https://www.youtube.com/',
                        'Origin': 'https://www.youtube.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9',
                        'Range': 'bytes=0-',
                        'Accept-Encoding': 'identity',
                        'Connection': 'keep-alive'
                    }
                });

                await conn.sendMessage(mek.chat, {
                    audio: Buffer.from(audioResponse.data, 'binary'),
                    mimetype: 'audio/webm',
                    fileName: `${songData.title.substring(0, 64).replace(/[^\w\s]/gi, '')}.webm`,
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
                console.error('Download Error:', downloadError);
                await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
                reply('🎵 Failed to download audio. The link may have expired. Try again.');
            }

        } catch (error) {
            console.error('Command Error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('🎵 Error: ' + (error.message || 'Please try again later'));
        }
    }
);

async function getVideoUrl(input) {
    if (input.match(/youtu\.?be/)) return input;
    
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
        const response = await axiosInstance.get(searchUrl);
        const videoId = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch (e) {
        console.error('Search Error:', e);
        return null;
    }
}
