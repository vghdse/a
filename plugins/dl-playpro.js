const { cmd } = require('../command');
const axios = require('axios');

cmd(
    {
        pattern: 'songp',
        alias: ['play', 'music'],
        desc: 'Download YouTube audio',
        category: 'media',
        filename: __filename,
    },
    async (conn, mek, m, { q, reply }) => {
        try {
            // Validate input
            if (!q) {
                return reply('Please provide:\n• A YouTube URL\n• Or song name to search\nExample: .song https://youtu.be/dQw4w9WgXcQ\nOr: .song never gonna give you up');
            }

            let videoUrl = q;
            
            // Handle search queries (non-URLs)
            if (!q.includes('youtube.com') && !q.includes('youtu.be')) {
                try {
                    const searchResults = await searchYouTube(q);
                    if (!searchResults) return reply('No results found for your search');
                    videoUrl = searchResults;
                } catch (searchError) {
                    console.error('Search error:', searchError);
                    return reply('Search failed. Please try a different query or use a direct YouTube URL');
                }
            }

            // Validate YouTube URL format
            const videoId = extractVideoId(videoUrl);
            if (!videoId) return reply('Invalid YouTube URL. Please provide a valid link');

            // Fetch from Kaiz API
            let apiResponse;
            try {
                apiResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/ytdl?url=${encodeURIComponent(videoUrl)}`, {
                    timeout: 15000 // 15 second timeout
                });
            } catch (apiError) {
                console.error('API error:', apiError);
                return reply('Service unavailable. Please try again later');
            }

            if (!apiResponse.data?.download_url) {
                return reply('Audio not available for this video');
            }

            const { title, duration, thumbnail, download_url } = apiResponse.data;

            // Download files with timeout
            try {
                const [audioRes, thumbRes] = await Promise.all([
                    axios.get(download_url, { responseType: 'arraybuffer', timeout: 30000 }),
                    axios.get(thumbnail, { responseType: 'arraybuffer', timeout: 10000 })
                ]);

                await conn.sendMessage(mek.chat, {
                    audio: audioRes.data,
                    mimetype: 'audio/mpeg',
                    fileName: `${cleanFilename(title)}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: title.slice(0, 60),
                            body: duration ? `Duration: ${duration}` : 'YouTube Audio',
                            thumbnail: thumbRes.data,
                            mediaType: 2,
                            mediaUrl: videoUrl
                        }
                    }
                }, { quoted: mek });

            } catch (downloadError) {
                console.error('Download error:', downloadError);
                return reply('Download failed. The video may be too long or unavailable');
            }

        } catch (error) {
            console.error('Unexpected error:', error);
            reply('An unexpected error occurred. Please try again later.');
        }
    }
);

// Helper functions
async function searchYouTube(query) {
    try {
        const { data } = await axios.get(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
            { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 10000
            }
        );
        const videoId = data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch {
        return null;
    }
}

function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function cleanFilename(name) {
    return name.replace(/[^\w\s.-]/g, '').slice(0, 60);
}
