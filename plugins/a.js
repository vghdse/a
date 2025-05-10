const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const Config = require('../config');

cmd(
    {
        pattern: 'songc',
        alias: ['ytmusic', 'music', 'ytdl'],
        desc: 'Download YouTube songs in different qualities',
        category: 'media',
        use: '<song name or YouTube URL> [quality]',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('*Please provide a song name or YouTube URL*\nExample: .song Alan Walker Lily\nOr: .song https://youtu.be/ox4tmEV6-QU high');

            // Extract quality parameter (default: high)
            const [input, quality] = q.split(' ');
            const audioQuality = quality ? quality.toLowerCase() : 'high';
            
            if (!['high', 'low'].includes(audioQuality)) {
                return reply('*Invalid quality specified*\nPlease use "high" or "low" (default: high)');
            }

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            let videoUrl = input;
            
            // If it's not a URL, search YouTube
            if (!input.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/)) {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
                const searchResponse = await axios.get(searchUrl);
                
                // Extract first video ID from search results
                const videoIdMatch = searchResponse.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
                if (!videoIdMatch) return reply('*No results found for your search*');
                
                videoUrl = `https://youtube.com/watch?v=${videoIdMatch[1]}`;
            }

            // Call GiftedTech API
            const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            
            if (!response.data.success || !response.data.result?.media?.length) {
                return reply('*Failed to fetch song information*');
            }

            const songInfo = response.data.result;
            const mediaOptions = songInfo.media;

            // Select appropriate media based on quality preference
            let selectedMedia;
            if (audioQuality === 'high') {
                // Find the highest quality MP3 or fallback to highest quality overall
                selectedMedia = mediaOptions.find(m => m.format.includes('MP3') && m.format.includes('128Kbps')) || 
                               mediaOptions.reduce((prev, current) => {
                                   const prevSize = parseFloat(prev.size.split(' ')[0]);
                                   const currSize = parseFloat(current.size.split(' ')[0]);
                                   return currSize > prevSize ? current : prev;
                               });
            } else {
                // Find the lowest quality option
                selectedMedia = mediaOptions.reduce((prev, current) => {
                    const prevSize = parseFloat(prev.size.split(' ')[0]);
                    const currSize = parseFloat(current.size.split(' ')[0]);
                    return currSize < prevSize ? current : prev;
                });
            }

            if (!selectedMedia?.download_url) {
                return reply('*Failed to find a valid download link*');
            }

            // Download the audio file
            const audioResponse = await axios.get(selectedMedia.download_url, { responseType: 'arraybuffer' });
            const audioBuffer = Buffer.from(audioResponse.data, 'binary');

            // Get thumbnail buffer
            const thumbnailBuffer = await getThumbnailBuffer(videoUrl);

            // Send the audio file
            await conn.sendMessage(mek.chat, { 
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${songInfo.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
                contextInfo: {
                    externalAdReply: {
                        title: songInfo.title,
                        body: `🎵 ${selectedMedia.format} | ${selectedMedia.size}`,
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
            reply('*Error downloading song. Please try again later.*');
        }
    }
);

// Helper function to get YouTube thumbnail
async function getThumbnailBuffer(videoUrl) {
    try {
        const videoId = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        // Fallback to a default thumbnail if needed
        return fs.readFileSync('./assets/default_thumbnail.jpg');
    }
}
