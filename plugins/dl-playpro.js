const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// Configure axios with better timeout and headers
const api = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'audio/mpeg'
  }
});

cmd({
    pattern: 'song',
    alias: ['play', 'music'],
    desc: 'Download YouTube audio',
    category: 'media',
    react: '🎵',
    use: '<URL or search query>',
    filename: __filename
}, async (message, reply) => {
    try {
        console.log('[SONG] Command received'); // Debug log
        const text = message.body.slice(config.PREFIX.length).split(' ').slice(1).join(' ');
        
        if (!text) {
            console.log('[SONG] No query provided');
            return reply(`Example:\n${config.PREFIX}song https://youtu.be/ox4tmEV6-QU\n${config.PREFIX}song Alan Walker Lily`);
        }

        await message.react('⏳').catch(e => console.log('[SONG] React error:', e));

        // Get video URL
        const videoUrl = await getVideoUrl(text);
        if (!videoUrl) {
            console.log('[SONG] No video found for query:', text);
            return reply('❌ No results found');
        }

        console.log('[SONG] Video URL:', videoUrl);

        // Fetch song data
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        console.log('[SONG] API URL:', apiUrl);
        
        const { data } = await api.get(apiUrl).catch(e => {
            console.log('[SONG] API error:', e.message);
            throw new Error('Failed to fetch song info');
        });

        if (!data?.download_url) {
            console.log('[SONG] Invalid API response:', data);
            return reply('❌ Could not get download link');
        }

        console.log('[SONG] Download URL:', data.download_url);

        // Send metadata first
        const infoMsg = `🎧 *${data.title || 'Unknown Title'}*\n👤 ${data.author || 'Unknown Artist'}\n\n⬇️ Downloading audio...`;
        await reply(infoMsg).catch(e => console.log('[SONG] Info message failed:', e));

        // Download audio
        console.log('[SONG] Starting download...');
        const audioResponse = await api.get(data.download_url, {
            responseType: 'arraybuffer',
            headers: {
                'Referer': 'https://www.youtube.com/'
            }
        }).catch(e => {
            console.log('[SONG] Download failed:', e.message);
            throw new Error('Audio download failed');
        });

        if (!audioResponse.data || audioResponse.data.length < 1000) {
            console.log('[SONG] Invalid audio data received');
            throw new Error('Received empty audio file');
        }

        console.log('[SONG] Audio size:', audioResponse.data.length, 'bytes');

        // Send audio file
        console.log('[SONG] Attempting to send audio...');
        await reply({
            audio: audioResponse.data,
            mimetype: 'audio/mpeg',
            fileName: `${(data.title || 'audio').replace(/[^\w\s]/gi, '')}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: data.title || 'YouTube Audio',
                    body: `Powered by ${config.BOT_NAME || 'Bot'}`,
                    thumbnailUrl: data.thumbnail,
                    mediaType: 1,
                    mediaUrl: videoUrl
                }
            }
        });

        console.log('[SONG] Audio sent successfully');
        await message.react('✅').catch(e => console.log('[SONG] Success react failed:', e));

    } catch (error) {
        console.error('[SONG ERROR]', error);
        await message.react('❌').catch(() => {});
        reply('❌ Error: ' + (error.message || 'Failed to process request'));
    }
});

// Helper to get video URL
async function getVideoUrl(input) {
    if (input.match(/youtu\.?be/)) return input;
    
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
        const response = await api.get(searchUrl);
        const videoId = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch (e) {
        console.log('[SONG] Search error:', e.message);
        return null;
    }
}
