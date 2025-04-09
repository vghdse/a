const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd(
    {
        pattern: 'song4',
        alias: ['ytmusic', 'ytaudio'],
        desc: 'Download audio from YouTube',
        category: 'media',
        react: '🎵',
        use: '<YouTube URL or search query>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('🎵 *Please provide a YouTube URL or search query*\nExample: .song https://youtu.be/eZskFo64rs8\nOr: .song Sukitte Ii na yo opening');

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            let videoUrl = q;
            
            // If it's not a URL, search YouTube
            if (!q.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/)) {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
                const searchResponse = await axios.get(searchUrl);
                
                // Extract first video ID from search results
                const videoIdMatch = searchResponse.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
                if (!videoIdMatch) return reply('🎵 *No results found for your search*');
                
                videoUrl = `https://youtube.com/watch?v=${videoIdMatch[1]}`;
            }

            // Call Lolhuman API
            const apiUrl = `https://api.lolhuman.xyz/api/ytaudio2?apikey=e0a6483c508018877ac67326&url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data.status !== 200 || !response.data.result?.link) {
                return reply('🎵 *Failed to fetch audio* - API error');
            }

            const songData = response.data.result;

            // Download the audio file
            const audioResponse = await axios.get(songData.link, { 
                responseType: 'arraybuffer',
                headers: {
                    'Referer': 'https://www.youtube.com/',
                    'Origin': 'https://www.youtube.com'
                }
            });
            const audioBuffer = Buffer.from(audioResponse.data, 'binary');

            // Get thumbnail
            const thumbnailBuffer = await getImageBuffer(songData.thumbnail);

            // Send the audio file
            await conn.sendMessage(mek.chat, { 
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${songData.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: songData.title,
                        body: 'YouTube Audio Download',
                        thumbnail: thumbnailBuffer,
                        mediaType: 2,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl
                    }
                }
            }, { quoted: mek });

            // Send success reaction
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Song download error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('🎵 *Error downloading audio* - Please try again later');
        }
    }
);

// Helper function to get image buffer
async function getImageBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null;
    }
}
