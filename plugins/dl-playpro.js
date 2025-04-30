const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const Config = require('../config');

cmd(
    {
        pattern: 'songp',
        alias: ['ytmusic', 'ym'],
        desc: 'Download YouTube songs using Kaiz API',
        category: 'media',
        use: '<song name or YouTube URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('*Please provide a song name or YouTube URL*\nExample: .song Alan Walker Lily\nOr: .song https://youtu.be/ox4tmEV6-QU');

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            let videoUrl = q;
            
            // If it's not a URL, search YouTube
            if (!isValidYouTubeUrl(q)) {
                videoUrl = await searchYouTube(q);
                if (!videoUrl) return reply('*No results found for your search*');
            }

            // Get video ID for thumbnail
            const videoId = extractVideoId(videoUrl);
            if (!videoId) return reply('*Invalid YouTube URL*');

            // Call Kaiz API
            const apiUrl = `https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            if (!response.data || !response.data.download_url) {
                return reply('*Failed to get download link from the API*');
            }

            const songData = response.data;
            const downloadUrl = songData.download_url;

            // Download the audio file and thumbnail in parallel
            const [audioResponse, thumbnailBuffer] = await Promise.all([
                axios.get(downloadUrl, { responseType: 'arraybuffer', timeout: 60000 }),
                getThumbnailBuffer(videoId)
            ]);

            const audioBuffer = Buffer.from(audioResponse.data, 'binary');

            // Send the audio file
            await conn.sendMessage(mek.chat, { 
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${songData.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
                contextInfo: {
                    externalAdReply: {
                        title: songData.title.substring(0, 60),
                        body: `Duration: ${songData.duration || 'N/A'}`,
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
            console.error('Error in song command:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('*An error occurred. Please try again later.*');
        }
    }
);

// Helper functions
function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    return pattern.test(url);
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

async function searchYouTube(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        
        const videoIdMatch = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
        return videoIdMatch ? `https://youtube.com/watch?v=${videoIdMatch[1]}` : null;
    } catch {
        return null;
    }
}

async function getThumbnailBuffer(videoId) {
    try {
        const thumbnailUrls = [
            `https://files.catbox.moe/m31j88.jpg`,
            `https://files.catbox.moe/m31j88.jpg`,
            `https://files.catbox.moe/m31j88.jpg`
        ];
        
        for (const url of thumbnailUrls) {
            try {
                const response = await axios.get(url, { 
                    responseType: 'arraybuffer',
                    timeout: 5000 
                });
                if (response.data) {
                    return Buffer.from(response.data, 'binary');
                }
            } catch {
                continue;
            }
        }
        return null;
    } catch {
        return null;
    }
}
