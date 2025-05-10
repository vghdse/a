const axios = require("axios");
const { cmd } = require("../command");
const yts = require("yt-search");

const config = require('../config');

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "songlow",
    alias: ["musiclow", "playlow"],
    react: "🎵",
    desc: "Download ultra-low quality audio from YouTube (small size)",
    category: "download",
    use: ".songlow <query or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        // If no ID (not a URL), search YouTube
        if (!id) {
            const searchResults = await yts(q);
            if (!searchResults.videos.length) return await reply("❌ No results found!");
            id = searchResults.videos[0].videoId;
        }

        // Get video info
        const videoInfo = await yts({ videoId: id });
        if (!videoInfo) return await reply("❌ Failed to fetch video info!");

        const { title, thumbnail, timestamp, views, author } = videoInfo;

        // Show loading message
        const processingMsg = await reply("⬇️ Downloading small size audio... Please wait");

        // Get download options from API
        const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=https://youtu.be/${id}`;
        const response = await axios.get(apiUrl);
        
        if (!response.data?.success || !response.data?.result?.media?.length) {
            await conn.sendMessage(from, { delete: processingMsg.key });
            return await reply("❌ Failed to get download options from API");
        }

        // Find the smallest size audio
        const mediaOptions = response.data.result.media;
        const lowOption = mediaOptions.find(opt => opt.format.includes("Ultralow")) || 
                         mediaOptions.find(opt => opt.size && parseFloat(opt.size) === Math.min(...mediaOptions.map(o => parseFloat(o.size)))) || 
                         mediaOptions[mediaOptions.length - 1];

        if (!lowOption?.download_url) {
            await conn.sendMessage(from, { delete: processingMsg.key });
            return await reply("❌ No download link found");
        }

        // Send the audio file
        await conn.sendMessage(from, { 
            audio: { url: lowOption.download_url }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ''),
            ptt: false
        }, { quoted: mek });

        // Update status message
        await conn.sendMessage(from, { 
            text: `✅ Small Audio Downloaded!\n\n` +
                  `🎵 *${title}*\n` +
                  `⏳ Duration: ${timestamp || "Unknown"}\n` +
                  `👤 Artist: ${author?.name || "Unknown"}\n` +
                  `💾 Size: ${lowOption.size}\n` +
                  `📦 Format: ${lowOption.format}`,
            edit: processingMsg.key
        });

    } catch (error) {
        console.error("Error in songlow command:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
