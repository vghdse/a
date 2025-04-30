const { cmd } = require('../command');
const axios = require('axios');

cmd(
    {
        pattern: 'songp',
        alias: ['play', 'music', 'ytmusic'],
        desc: 'Download YouTube audio',
        category: 'media',
        filename: __filename,
    },
    async (conn, mek, m, { q, reply }) => {
        try {
            if (!q) return reply('Please send a YouTube URL or search query\nExample: .song https://youtu.be/ox4tmEV6-QU\nOr: .song Alan Walker Lily');

            let videoUrl = q;
            
            // If it's not a URL, search YouTube
            if (!q.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/)) {
                videoUrl = await searchYouTube(q);
                if (!videoUrl) return reply('No results found for your search');
            }

            // Get video ID
            const videoId = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
            if (!videoId) return reply('Invalid YouTube URL');

            // Fetch from Kaiz API
            const apiUrl = `https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl);
            
            if (!data?.download_url) return reply('Could not get audio download link');

            // Download audio and thumbnail
            const [audioRes, thumbRes] = await Promise.all([
                axios.get(data.download_url, { responseType: 'arraybuffer' }),
                axios.get(data.thumbnail, { responseType: 'arraybuffer' })
            ]);

            // Send audio
            await conn.sendMessage(mek.chat, {
                audio: Buffer.from(audioRes.data),
                mimetype: 'audio/mpeg',
                fileName: `${data.title}.mp3`.replace(/[^\w\s.-]/g, ''),
                contextInfo: {
                    externalAdReply: {
                        title: data.title.substring(0, 60),
                        body: `Duration: ${data.duration}`,
                        thumbnail: Buffer.from(thumbRes.data),
                        mediaType: 2,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl
                    }
                }
            }, { quoted: mek });

        } catch (error) {
            console.error('Error:', error);
            reply('An error occurred. Please try again later.');
        }
    }
);

// YouTube search function
async function searchYouTube(query) {
    try {
        const { data } = await axios.get(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        
        const videoId = data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch {
        return null;
    }
}
