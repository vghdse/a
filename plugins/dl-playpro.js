const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');

cmd({
    pattern: "yt2",
    alias: ["play5", "music5"],
    react: "🎵",
    desc: "Download audio from YouTube",
    category: "download",
    use: ".song <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let videoUrl, title;
        
        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoInfo = await yts({ videoId: q.split(/[=/]/).pop() });
            title = videoInfo.title;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ Downloading audio...");

        // Use API to get audio
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success) return await reply("❌ Failed to download audio!");

        await conn.sendMessage(from, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});



/*const { cmd } = require('../command');
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
        const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url= ${encodeURIComponent(videoUrl)}`;
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
*/
