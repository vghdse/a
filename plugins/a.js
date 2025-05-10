const axios = require("axios");
const { cmd } = require("../command");
const yts = require("yt-search");

function getYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

cmd({
    pattern: "songc",
    alias: ["music", "playc"],
    react: "🎵",
    desc: "Download YouTube audio (add 'low' for small size)",
    category: "download",
    use: ".song <query/url> [low]",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube URL!");

        // Check for low quality request
        const lowQuality = q.includes(" low");
        const cleanQuery = q.replace(" low", "").trim();

        // Get video ID
        let videoId = cleanQuery.startsWith("http") ? getYouTubeID(cleanQuery) : null;
        if (!videoId) {
            const search = await yts(cleanQuery);
            if (!search.videos.length) return reply("❌ No results found!");
            videoId = search.videos[0].videoId;
        }

        const processingMsg = await reply(lowQuality ? "⬇️ Downloading small audio..." : "⬇️ Downloading HD audio...");

        // Use GiftedTech API
        const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=https://youtu.be/${videoId}`;
        const response = await axios.get(apiUrl);
        
        if (!response.data?.success || !response.data?.result?.media?.length) {
            return reply("❌ Failed to get download options");
        }

        // Select quality
        const mediaOptions = response.data.result.media;
        let selectedOption;
        
        if (lowQuality) {
            // Find smallest size
            selectedOption = mediaOptions.reduce((smallest, current) => {
                const currentSize = parseFloat(current.size);
                const smallestSize = parseFloat(smallest.size);
                return currentSize < smallestSize ? current : smallest;
            }, mediaOptions[0]);
        } else {
            // Find highest quality
            selectedOption = mediaOptions.find(opt => opt.format.includes("128Kbps")) || 
                           mediaOptions.find(opt => opt.format.includes("MP3")) || 
                           mediaOptions[0];
        }

        if (!selectedOption?.download_url) {
            return reply("❌ No download link found");
        }

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: selectedOption.download_url },
            mimetype: 'audio/mpeg',
            fileName: `audio.mp3`,
            ptt: false
        }, { quoted: mek });

        // Send info
        await reply(`✅ ${lowQuality ? "Small" : "HD"} Audio Downloaded!\n\n` +
                   `🎵 *${response.data.result.title}*\n` +
                   `💾 Size: ${selectedOption.size}\n` +
                   `📦 Format: ${selectedOption.format}`);

    } catch (error) {
        console.error("Error:", error);
        reply(`❌ Error: ${error.message.includes('403') ? 'Server blocked request' : 'Download failed'}`);
    }
});
