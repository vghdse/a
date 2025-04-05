
const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "spotify",
  alias: ["sp", "spotifydl"],
  react: '🎵',
  desc: "Search and download Spotify tracks",
  category: "music",
  use: ".spotify <song name>",
  filename: __filename
}, async (client, message, { reply, quoted, args }) => {
  try {
    const q = args.join(" ");
    if (!q) return reply("Please provide a song name. Example: `.spotify Hannah Montana by Ice Spice`");

    // Search for track
    const searchApiUrl = `https://draculazxy-xyzdrac.hf.space/api/Spotify?q=${encodeURIComponent(q)}`;
    const searchResponse = await axios.get(searchApiUrl, { timeout: 10000 });
    const searchData = searchResponse.data;

    if (searchData.STATUS !== 200) {
      return reply(`❌ Spotify search failed: ${searchData.message || 'Unknown error'}`);
    }

    // Extract song data
    const { title, artist, album, release_date, spotify_url, cover_art } = searchData.SONG;
    const spotifyInfo = `
🎵 *Track:* ${title}
🎤 *Artist:* ${artist}
💿 *Album:* ${album}
📅 *Release Date:* ${release_date}
🔗 *Spotify URL:* ${spotify_url}
`;

    // Send track info with cover art
    await client.sendMessage(message.chat, { 
      image: { url: cover_art }, 
      caption: spotifyInfo 
    }, { quoted: message });

    // Download track if URL available
    if (!spotify_url) return reply("⚠️ No Spotify URL found - cannot download");

    try {
      const downloadApiUrl = `https://apis.davidcyriltech.my.id/spotifydl?url=${encodeURIComponent(spotify_url)}`;
      const downloadResponse = await axios.get(downloadApiUrl, { timeout: 15000 });
      const downloadData = downloadResponse.data;

      if (downloadData.status !== 200 || !downloadData.success) {
        return reply(`❌ Download failed: ${downloadData.message || 'No download link available'}`);
      }

      // Send audio file
      await client.sendMessage(message.chat, {
        audio: { url: downloadData.DownloadLink },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: message });

    } catch (downloadError) {
      console.error('Spotify DL Error:', downloadError);
      reply(`⚠️ Download error: ${downloadError.message || 'Check console for details'}`);
    }

  } catch (error) {
    console.error('Spotify CMD Error:', error);
    reply(`❌ Command failed: ${error.message || 'Unknown error occurred'}`);
  }
});



/*const axios = require("axios");
const yts = require("yt-search");
const { youtube } = require("btch-downloader");
const { cmd } = require('../command');

cmd({
  pattern: 'spotify',
  alias: ["ytmusic", "music"],
  react: '🎵',
  desc: "Fetch audio from Spotify or YouTube",
  category: "media",
  filename: __filename
}, async (conn, m, store, { 
  from, 
  quoted, 
  body, 
  isCmd, 
  command, 
  args, 
  q, 
  isGroup, 
  sender, 
  senderNumber, 
  botNumber, 
  pushname, 
  reply 
}) => {
  if (!q) return reply("Please provide a title or link (Spotify/YouTube)!");

  reply("*Searching For Song*");

  try {
    // Run Spotify & YouTube search in parallel to speed up the process
    const [spotifySearch, ytResults] = await Promise.all([
      axios.get(`https://spotifyapi.caliphdev.com/api/search/tracks?q=${encodeURIComponent(q)}`).catch(() => null),
      yts(q).catch(() => null)
    ]);

    // Check if Spotify returned results
    const track = spotifySearch?.data?.[0];
    if (track) {
      const spotifyDownload = await axios({
        url: `https://spotifyapi.caliphdev.com/api/download/track?url=${encodeURIComponent(track.url)}`,
        method: "GET",
        responseType: 'stream'
      }).catch(() => null);

      if (spotifyDownload && spotifyDownload.headers["content-type"] === "audio/mpeg") {
        await conn.sendMessage(from, {
          audio: spotifyDownload.data,
          mimetype: "audio/mpeg",
          contextInfo: {
            externalAdReply: {
              title: track.title,
              body: "Artist: " + track.artist,
              mediaType: 1,
              sourceUrl: track.url,
              renderLargerThumbnail: true
            }
          }
        });
        return; // Stop here if Spotify was successful
      }
    }

    // If Spotify failed, try YouTube
    const video = ytResults?.videos?.[0];
    if (video && video.seconds < 3600) { // Less than 1 hour
      const ytDownload = await youtube(video.url).catch(() => null);
      if (ytDownload && ytDownload.mp3) {
        await conn.sendMessage(from, {
          audio: { url: ytDownload.mp3 },
          mimetype: "audio/mpeg",
          contextInfo: {
            externalAdReply: {
              title: video.title,
              body: "Fetched from YouTube",
              mediaType: 1,
              sourceUrl: video.url,
              renderLargerThumbnail: true
            }
          }
        });
        return;
      }
    }

    reply("No suitable results found on Spotify or YouTube.");
  } catch (error) {
    console.error("Audio Fetch Error:", error.message);
    reply("An error occurred while fetching audio.");
  }
});
*/
