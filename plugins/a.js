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
        await conn.sendMessage(from, { 
            image: { url: thumbnail }, 
            caption: optionsMsg 
        }, { quoted: mek });

        // Delete processing message
        await conn.sendMessage(from, { 
            delete: processingMsg.key 
        });

        // Listen for user's quality choice
        const choiceListener = async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message || mekInfo.key.remoteJid !== from) return;

                const messageText = mekInfo?.message?.conversation || 
                                  mekInfo?.message?.extendedTextMessage?.text;
                
                if (!messageText) return;

                const choice = parseInt(messageText.trim());
                if (isNaN(choice) || choice < 1 || choice > mediaOptions.length) {
                    return await reply("❌ Invalid choice! Please reply with a valid number");
                }

                // Remove listener after getting valid choice
                conn.ev.off('messages.upsert', choiceListener);

                const selectedOption = mediaOptions[choice - 1];
                const downloadUrl = selectedOption.download_url;

                // Send downloading message
                const downloadMsg = await reply(`⬇️ Downloading ${selectedOption.format}...`);

                // Send the audio file
                await conn.sendMessage(from, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`,
                    ptt: false
                }, { quoted: mek });

                // Update download message
                await conn.sendMessage(from, { 
                    text: `✅ Download complete!\n\n` +
                          `🎵 *${title}*\n` +
                          `📦 Format: ${selectedOption.format}\n` +
                          `💾 Size: ${selectedOption.size}`,
                    edit: downloadMsg.key
                });

            } catch (error) {
                console.error("Error in choice listener:", error);
                await reply(`❌ Error: ${error.message}`);
                conn.ev.off('messages.upsert', choiceListener);
            }
        };

        // Set timeout for choice (2 minutes)
        setTimeout(() => {
            conn.ev.off('messages.upsert', choiceListener);
        }, 120000);

        conn.ev.on('messages.upsert', choiceListener);

    } catch (error) {
        console.error("Error in song command:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
