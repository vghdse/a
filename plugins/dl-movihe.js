const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API configuration
const MOVIE_API = {
  baseUrl: 'https://moviesapi.club',
  search: '/search',
  download: '/download'
};

cmd({
  pattern: "movie1",
  alias: ["getmovie", "film"],
  react: "🎬",
  desc: "Search and download movies",
  category: "media",
  use: '<movie name>',
  filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
  try {
    if (!args.length) return reply('Please provide a movie name\nExample: .movie Inception 2010');

    const query = args.join(' ');
    await reply(`🔍 Searching for "${query}"...`);

    // Search for movie
    const searchUrl = `${MOVIE_API.baseUrl}${MOVIE_API.search}?query=${encodeURIComponent(query)}`;
    const { data: results } = await axios.get(searchUrl, { timeout: 10000 });

    if (!results?.length) return reply('No movies found. Try another title.');

    // Get first result
    const movie = results[0];
    await reply(`🎥 Found: *${movie.title}* (${movie.year})\n\n📥 Downloading...`);

    // Get download link
    const downloadUrl = `${MOVIE_API.baseUrl}${MOVIE_API.download}?id=${movie.id}`;
    const { data: fileData } = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Save temporarily
    const tempPath = path.join(__dirname, '../temp', `${movie.title.replace(/\s+/g, '_')}.mp4`);
    fs.writeFileSync(tempPath, Buffer.from(fileData));

    // Send as document
    await conn.sendMessage(from, {
      document: { url: tempPath },
      fileName: `${movie.title} (${movie.year}).mp4`,
      mimetype: 'video/mp4',
      caption: `🎬 *${movie.title}* (${movie.year})\n📁 Size: ${formatBytes(fileData.length)}\n\nEnjoy your movie!`
    }, { quoted: mek });

    // Cleanup
    fs.unlinkSync(tempPath);

  } catch (error) {
    console.error('Movie error:', error);
    reply(`❌ Failed to get movie. Error: ${error.message}\n\nTry again later or use another title.`);
  }
});

// Helper function to format file size
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
