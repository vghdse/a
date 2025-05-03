const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'song5',
    alias: ['play', 'ytmp3'],
    desc: 'Download YouTube audio',
    category: 'media',
    filename: __filename,
}, async (m, conn, args) => {
    try {
        // Check if query exists
        if (!args.length) return m.reply('Please provide a YouTube URL or search query\nExample: .song https://youtu.be/dQw4w9WgXcQ\nOr: .song never gonna give you up');

        const query = args.join(' ');
        let videoUrl = query;

        // If it's not a URL, search YouTube
        if (!query.match(/youtu(be\.com|\.be)/)) {
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl);
            const videoId = response.data.match(/\/watch\?v=([^"&?\/ ]{11})/)?.[1];
            if (!videoId) return m.reply('No results found for your search');
            videoUrl = `https://youtube.com/watch?v=${videoId}`;
        }

        // Call the API
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.download_url) return m.reply('Failed to get download link');

        // Send the audio file
        await conn.sendMessage(m.chat, {
            audio: { url: data.download_url },
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: data.title,
                    body: `By ${data.author}`,
                    thumbnail: await axios.get(data.thumbnail, { responseType: 'arraybuffer' }).then(res => res.data),
                    mediaType: 2,
                    mediaUrl: videoUrl
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Song download error:', error);
        m.reply('Error downloading song. Please try again later.');
    }
});
