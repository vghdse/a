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
    pattern: "songhd",
    alias: ["musichd", "playhd"],
    react: "🎵",
    desc: "Download HD quality audio from YouTube",
    category: "download",
    use: ".songhd <query or YouTube URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        // If no ID (not a URL), search YouTube
        if (!id) {
            try {
                const searchResults = await yts(q);
                if (!searchResults.videos.length) return reply("❌ No results found!");
                id = searchResults.videos[0].videoId;
            } catch (e) {
                return reply("❌ YouTube search failed. Please try again.");
            }
        }

        // Get video info
        let videoInfo;
        try {
            videoInfo = await yts({ videoId: id });
            if (!videoInfo) return reply("❌ Failed to fetch video info!");
        } catch (e) {
            return reply("❌ Couldn't get video information");
        }

        const { title, thumbnail, timestamp, views, author } = videoInfo;
        const processingMsg = await reply("⬇️ Downloading HD audio... Please wait");

        try {
            // Get download options from API
            const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=https://youtu.be/${id}`;
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            if (!response.data?.success || !response.data?.result?.media?.length) {
                return reply("❌ No download options available");
            }

            // Find HD quality (MP3 128kbps or best available)
            const mediaOptions = response.data.result.media;
            const hdOption = mediaOptions.find(opt => opt.format.includes("128Kbps")) || 
                            mediaOptions.find(opt => opt.format.includes("MP3")) || 
                            mediaOptions[0];

            if (!hdOption?.download_url) {
                return reply("❌ No HD download link found");
            }

            // Send audio immediately
            await conn.sendMessage(from, { 
                audio: { url: hdOption.download_url }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ''),
                ptt: false
            }, { quoted: mek });

            // Send info as separate message
            await conn.sendMessage(from, {
                text: `✅ HD Audio Downloaded!\n\n` +
                      `🎵 *${title}*\n` +
                      `⏳ Duration: ${timestamp || "Unknown"}\n` +
                      `👤 Artist: ${author?.name || "Unknown"}\n` +
                      `💾 Size: ${hdOption.size}\n` +
                      `📦 Format: ${hdOption.format}`
            }, { quoted: mek });

        } catch (error) {
            console.error("Download error:", error);
            reply(`❌ Download failed: ${error.message}`);
        } finally {
            try {
                if (processingMsg?.key) {
                    await conn.sendMessage(from, { delete: processingMsg.key });
                }
            } catch (e) {
                console.log("Couldn't delete processing message");
            }
        }

    } catch (error) {
        console.error("Error in songhd command:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
