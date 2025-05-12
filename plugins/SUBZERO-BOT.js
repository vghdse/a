const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');
const GIFTED_DLS = require('gifted-dls');
const gifted = new GIFTED_DLS();

cmd(
  {
    pattern: 'dls',
    alias: ['playg', 'ytmp3'],
    desc: 'Download and play audio from YouTube using gifted-dls',
    category: 'media',
    use: '<YouTube URL or search query>',
    filename: __filename,
  },
  async (conn, mek, m, { text, reply }) => {
    try {
      if (!text) return reply('❌ Please provide a YouTube URL or search query');

      // Show loading reaction
      await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

      // Get actual video URL
      const videoUrl = text.match(/youtu\.?be|youtube\.com/) ? text : await getVideoUrl(text);
      if (!videoUrl) return reply('❌ No results found');

      // Fetch MP3 info using gifted-dls
      const res = await gifted.ytmp3(videoUrl);
      if (!res?.success || !res.result?.download_url) return reply('❌ Failed to fetch download link');

      // Download MP3
      const audioResponse = await axios.get(res.result.download_url, {
        responseType: 'arraybuffer'
      });

      // Send as audio/mpeg
      await conn.sendMessage(mek.chat, {
        audio: Buffer.from(audioResponse.data, 'binary'),
        mimetype: 'audio/mpeg',
        fileName: `${res.result.title.substring(0, 64)}.mp3`.replace(/[^\w\s.-]/gi, ''),
        caption: `🎵 *Now Playing:* ${res.result.title}`,
        ptt: false
      });

      // Success reaction
      await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

    } catch (error) {
      console.error('Error:', error);
      await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
      reply('❌ Failed to download. Try again or use a different link.');
    }
  }
);

// Helper to search YouTube and return video URL
async function getVideoUrl(query) {
  try {
    const search = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
    const videoId = search.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1];
    return videoId ? `https://youtu.be/${videoId}` : null;
  } catch {
    return null;
  }
}
