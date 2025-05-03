/*const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

// Helper function to search YouTube
async function searchYouTube(query) {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl);
        const videoId = response.data.match(/\/watch\?v=([^"&?\/ ]{11})/)?.[1];
        return videoId ? `https://youtube.com/watch?v=${videoId}` : null;
    } catch {
        return null;
    }
}

cmd({
    pattern: 'songxx',
    alias: ['play', 'music'],
    desc: 'Download YouTube audio',
    category: 'media',
    filename: __filename,
}, async (m, conn, args) => {
    try {
        // Input validation
        if (!args.length) return m.reply('Please provide a YouTube URL or search query\nExample: .song https://youtu.be/dQw4w9WgXcQ\nOr: .song never gonna give you up');

        const query = args.join(' ');
        let videoUrl = query;

        // Handle search queries
        if (!query.match(/youtu(be\.com|\.be)/)) {
            await m.reply('🔍 Searching YouTube...');
            videoUrl = await searchYouTube(query);
            if (!videoUrl) return m.reply('No results found for your search');
        }

        // Extract video ID
        const videoId = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!videoId) return m.reply('Invalid YouTube URL');

        // Get audio from API
        await m.reply('⏳ Downloading audio...');
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.success || !response.data.result?.downloadUrl) {
            return m.reply('Failed to get download link');
        }

        const { title, image, downloadUrl } = response.data.result;

        // Download the audio
        const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(audioResponse.data, 'binary');
        const fileName = `${title.replace(/[^\w\s.-]/g, '')}.mp3`;

        // Send the audio file
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: fileName,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: 'Downloaded via YouTube',
                    thumbnail: await (await axios.get(image, { responseType: 'arraybuffer' })).data,
                    mediaType: 2,
                    mediaUrl: videoUrl,
                    sourceUrl: videoUrl
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Song download error:', error);
        m.reply('❌ Error downloading song. Please try again later.');
    }
});
*/
