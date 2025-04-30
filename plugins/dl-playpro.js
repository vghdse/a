const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Configure axios for faster downloads
const api = axios.create({
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
});

cmd({
    pattern: 'songp',
    alias: ['play', 'music'],
    desc: 'Download high quality YouTube audio',
    category: 'media',
    react: '🎵',
    use: '<URL or search query>',
    filename: __filename
}, async (message, reply, text) => {
    try {
        if (!text) return reply(`Example: ${config.PREFIX}song https://youtu.be/ox4tmEV6-QU\nOr: ${config.PREFIX}song Alan Walker Lily`);

        // Show processing indicator
        await message.react('⏳').catch(() => {});

        // Get video URL (handles both direct links and search queries)
        const videoUrl = await getVideoUrl(text);
        if (!videoUrl) return reply('❌ No results found');

        // Fetch song data from API
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await api.get(apiUrl);
        
        if (!data?.download_url) {
            return reply('❌ Failed to fetch song data');
        }

        // Send metadata first
        const infoMsg = `🎧 *${data.title}*\n👤 ${data.author}\n\n⬇️ Downloading audio...`;
        await reply(infoMsg);

        // Download and send audio (streaming for faster delivery)
        const audioResponse = await api.get(data.download_url, {
            responseType: 'stream',
            headers: {
                'Referer': 'https://www.youtube.com/',
                'Accept': 'audio/mpeg'
            }
        });

        await reply({
            audio: audioResponse.data,
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`.replace(/[<>:"\/\\|?*]/g, ''),
            contextInfo: {
                externalAdReply: {
                    title: data.title,
                    body: `🎵 ${config.BOT_NAME}`,
                    thumbnailUrl: data.thumbnail,
                    mediaType: 1,
                    mediaUrl: videoUrl
                }
            }
        });

        await message.react('✅').catch(() => {});

    } catch (error) {
        console.error('Song error:', error);
        await message.react('❌').catch(() => {});
        reply('❌ Error: ' + (error.message || 'Failed to download song'));
    }
});

// Helper functions
async function getVideoUrl(input) {
    if (input.match(/youtu\.?be/)) return input;
    
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
        const response = await api.get(searchUrl);
        const videoId = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch {
        return null;
    }
}
