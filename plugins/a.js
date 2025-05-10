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
    pattern: "songc",
    alias: ["music", "playc"],
    react: "🎵",
    desc: "Download high quality audio from YouTube",
    category: "download",
    use: ".song <query or YouTube URL>",
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
        const processingMsg = await reply("🔍 Fetching download options... Please wait");

        // Get download options from API
        const apiUrl = `https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=https://youtu.be/${id}`;
        const response = await axios.get(apiUrl);
        
        if (!response.data?.success || !response.data?.result?.media?.length) {
            await conn.sendMessage(from, { delete: processingMsg.key });
            return await reply("❌ Failed to get download options from API");
        }

        const mediaOptions = response.data.result.media;

        // Prepare options message
        let optionsMsg = `🎵 *${title || "Unknown Song"}*\n\n`;
        optionsMsg += `⏳ Duration: ${timestamp || "Unknown"}\n`;
        optionsMsg += `👀 Views: ${views || "Unknown"}\n`;
        optionsMsg += `👤 Artist: ${author?.name || "Unknown"}\n\n`;
        optionsMsg += `*Available Audio Qualities:*\n\n`;

        mediaOptions.forEach((option, index) => {
            optionsMsg += `${index + 1}. ${option.format} (${option.size})\n`;
        });

        optionsMsg += `\nReply with the number of your choice (1-${mediaOptions.length})`;
        optionsMsg += `\n\n${config.FOOTER || "> © Powered by GiftedTech API"}`;

        // Send options with thumbnail
        const sentMsg = await conn.sendMessage(from, { 
            image: { url: thumbnail }, 
            caption: optionsMsg 
        }, { quoted: mek });

        // Delete processing message
        await conn.sendMessage(from, { delete: processingMsg.key });

        // Create a unique identifier for this interaction
        const interactionId = `${from}_${sentMsg.key.id}`;
        
        // Store media options temporarily
        conn.songOptions = conn.songOptions || {};
        conn.songOptions[interactionId] = {
            mediaOptions,
            title,
            timestamp: Date.now()
        };

        // Set timeout to clean up (5 minutes)
        setTimeout(() => {
            if (conn.songOptions?.[interactionId]) {
                delete conn.songOptions[interactionId];
            }
        }, 300000);

    } catch (error) {
        console.error("Error in song command:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});

// Handle user replies globally
module.exports.handleSongReplies = (conn) => {
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message || !m.key.remoteJid) return;

            const message = m.message.conversation || m.message.extendedTextMessage?.text;
            if (!message) return;

            // Check if this is a reply to our options message
            const isReply = m.message.extendedTextMessage?.contextInfo?.stanzaId;
            if (!isReply) return;

            const from = m.key.remoteJid;
            const interactionId = `${from}_${isReply}`;
            
            // Check if we have options stored for this interaction
            const options = conn.songOptions?.[interactionId];
            if (!options) return;

            // Clean up old interactions
            for (const [key, value] of Object.entries(conn.songOptions)) {
                if (Date.now() - value.timestamp > 300000) {
                    delete conn.songOptions[key];
                }
            }

            const choice = parseInt(message.trim());
            if (isNaN(choice) || choice < 1 || choice > options.mediaOptions.length) {
                await conn.sendMessage(from, { text: "❌ Invalid choice! Please reply with a valid number" }, { quoted: m });
                return;
            }

            const selectedOption = options.mediaOptions[choice - 1];
            const downloadUrl = selectedOption.download_url;

            // Send downloading message
            const downloadMsg = await conn.sendMessage(from, { text: `⬇️ Downloading ${selectedOption.format}...` }, { quoted: m });

            try {
                // Send the audio file
                await conn.sendMessage(from, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${options.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
                    ptt: false
                }, { quoted: m });

                // Update download message
                await conn.sendMessage(from, { 
                    text: `✅ Download complete!\n\n` +
                          `🎵 *${options.title}*\n` +
                          `📦 Format: ${selectedOption.format}\n` +
                          `💾 Size: ${selectedOption.size}`,
                    edit: downloadMsg.key
                });
            } catch (downloadError) {
                console.error("Download error:", downloadError);
                await conn.sendMessage(from, { 
                    text: `❌ Failed to download audio: ${downloadError.message}`,
                    edit: downloadMsg.key
                });
            }

            // Clean up
            delete conn.songOptions[interactionId];

        } catch (error) {
            console.error("Error in reply handler:", error);
        }
    });
};
