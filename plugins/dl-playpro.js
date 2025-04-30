const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "songa",
  alias: ["ytmp3", "music"],
  react: "🎵",
  desc: "Download high quality YouTube audio",
  category: "media",
  use: "<song name/url>",
  filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
  try {
    if (!text) return reply("Please provide a song name or YouTube link");

    // Show processing message
    const processingMsg = await reply("⚡ Searching for your song...");

    // Extract video ID if URL is provided
    let videoId;
    const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const urlMatch = text.match(urlRegex);
    
    if (urlMatch && urlMatch[1]) {
      videoId = urlMatch[1];
    } else {
      // Search for video if query is provided
      const searchUrl = `https://kaiz-apis.gleeze.com/api/yts?query=${encodeURIComponent(text)}`;
      const searchRes = await axios.get(searchUrl);
      
      if (!searchRes.data?.result?.length) {
        await conn.sendMessage(from, { delete: processingMsg.key });
        return reply("❌ No results found for your search");
      }
      videoId = searchRes.data.result[0].id;
    }

    // Get download link from Kaiz API
    const apiUrl = `https://kaiz-apis.gleeze.com/api/ytmp3?url=https://youtube.com/watch?v=${videoId}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data?.download_url) {
      await conn.sendMessage(from, { delete: processingMsg.key });
      return reply("❌ Failed to get download link");
    }

    // Delete processing message
    await conn.sendMessage(from, { delete: processingMsg.key });

    // Send audio directly from URL (fastest method)
    await conn.sendMessage(from, {
      audio: { url: data.download_url },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: data.title || "YouTube Audio",
          body: "Downloaded via Kaiz API",
          thumbnailUrl: data.thumbnail,
          mediaType: 2,
          mediaUrl: `https://youtu.be/${videoId}`,
          sourceUrl: `https://youtu.be/${videoId}`
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error('Song download error:', error);
    reply("❌ Error processing your request. Please try again.");
  }
});
