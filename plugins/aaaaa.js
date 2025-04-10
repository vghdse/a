const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "song5",
  alias: ["ytmp3", "ytaudio"],
  react: "🎵",
  desc: "Download YouTube audio",
  category: "media",
  use: "<song name/url>",
  filename: __filename
}, async (conn, mek, m, { from, reply, args, text }) => {
  try {
    // Check if input is provided
    if (!text) return reply("Please provide a YouTube URL or search query");

    // Show processing message
    await reply("🔍 Searching for audio... Please wait");

    // Extract video ID if URL is provided
    let videoId = '';
    if (text.includes('youtube.com') || text.includes('youtu.be')) {
      const urlMatch = text.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|youtu\.be\/)([^"&?\/\s]{11})/);
      videoId = urlMatch ? urlMatch[1] : null;
    }

    // If no URL found, search YouTube
    if (!videoId) {
      const searchUrl = `https://lolhuman.xyz/api/ytsearch?apikey=${config.LOLHUMAN_API}&query=${encodeURIComponent(text)}`;
      const searchRes = await axios.get(searchUrl);
      
      if (!searchRes.data || !searchRes.data.result || searchRes.data.result.length === 0) {
        return reply("No results found for your search");
      }
      
      videoId = searchRes.data.result[0].videoId;
    }

    // Download audio
    const apiUrl = `https://lolhuman.xyz/api/ytaudio2?apikey=${config.LOLHUMAN_API}&url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.result || !response.data.result.link) {
      return reply("Failed to get audio download link");
    }

    const audioInfo = response.data.result;
    const audioUrl = audioInfo.link;

    // Download the audio file
    const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const tempPath = path.join(__dirname, '../temp', `yt_audio_${Date.now()}.mp3`);
    fs.writeFileSync(tempPath, audioRes.data);

    // Send audio with metadata
    await conn.sendMessage(from, {
      audio: { url: tempPath },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: audioInfo.title,
          body: "YouTube Audio Download",
          thumbnailUrl: audioInfo.thumbnail,
          mediaType: 2,
          mediaUrl: `https://youtu.be/${videoId}`,
          sourceUrl: `https://youtu.be/${videoId}`
        }
      }
    }, { quoted: mek });

    // Clean up
    fs.unlinkSync(tempPath);

  } catch (error) {
    console.error('Song download error:', error);
    reply("❌ Error downloading audio. Please try again later.");
  }
});
