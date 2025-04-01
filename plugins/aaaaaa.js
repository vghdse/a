const axios = require("axios");
const { cmd } = require("../command");
const yts = require("yt-search"); // For searching YouTube

// Song Downloader Command
cmd(
    {
        pattern: "songx",
        alias: ["mp3x", "ytmp3"],
        desc: "Download a song from YouTube as MP3.",
        category: "download",
        use: "<song name or YouTube URL>\nExample: .song faded\nExample: .song https://youtu.be/UDSYAD1sQuE",
        filename: __filename,
        react: "🎵"
    },
    async (conn, mek, m, { args, reply, from }) => {
        try {
            const input = args.join(" "); // Combine the query parts

            if (!input) {
                return reply("Please provide a song name or YouTube URL.\nExample: `.song faded`\nExample: `.song https://youtu.be/UDSYAD1sQuE`");
            }

            let youtubeUrl;

            // Check if the input is a YouTube URL
            if (input.startsWith("http://") || input.startsWith("https://")) {
                youtubeUrl = input;
            } else {
                // Search YouTube for the song
                const searchResults = await yts(input);
                if (!searchResults || searchResults.videos.length === 0) {
                    return reply("❌ No results found for your query. Please try again.");
                }
                youtubeUrl = searchResults.videos[0].url; // Get the first result's URL
            }

            // Call the API to fetch song details and download link
            const apiUrl = `https://bk9.fun/download/ytmp3?url=${encodeURIComponent(youtubeUrl)}&type=mp3`;
            const response = await axios.get(apiUrl);

            // Log the API response for debugging
            console.log("API Response:", response.data);

            // Check if the API response is valid
            if (!response.data || !response.data.status || !response.data.BK9 || !response.data.BK9.downloadUrl) {
                return reply("❌ Unable to fetch the song. Please check the URL and try again.");
            }

            // Extract song details
            const { title, downloadUrl } = response.data.BK9;

            // Send the song to the user
            await conn.sendMessage(
                from,
                {
                    audio: { url: downloadUrl },
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`,
                    caption: `🎵 *Title:* ${title}\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`
                },
                { quoted: mek }
            );

        } catch (error) {
            console.error("Error in songx command:", error);
            reply("❌ An error occurred while processing your request. Please try again later.");
        }
    }
);

// Video Downloader Command
cmd(
    {
        pattern: "videox",
        alias: ["ytvideox"],
        desc: "Download a video from YouTube.",
        category: "download",
        use: "<video name or YouTube URL>\nExample: .video lily\nExample: .video https://youtu.be/UDSYAD1sQuE",
        filename: __filename,
        react: "🎥"
    },
    async (conn, mek, m, { args, reply, from }) => {
        try {
            const input = args.join(" "); // Combine the query parts

            if (!input) {
                return reply("Please provide a video name or YouTube URL.\nExample: `.video lily`\nExample: `.video https://youtu.be/UDSYAD1sQuE`");
            }

            let youtubeUrl;

            // Check if the input is a YouTube URL
            if (input.startsWith("http://") || input.startsWith("https://")) {
                youtubeUrl = input;
            } else {
                // Search YouTube for the video
                const searchResults = await yts(input);
                if (!searchResults || searchResults.videos.length === 0) {
                    return reply("❌ No results found for your query. Please try again.");
                }
                youtubeUrl = searchResults.videos[0].url; // Get the first result's URL
            }

            // Call the API to fetch video details and download links
            const apiUrl = `https://bk9.fun/download/youtube?url=${encodeURIComponent(youtubeUrl)}`;
            const response = await axios.get(apiUrl);

            // Log the API response for debugging
            console.log("API Response:", response.data);

            // Check if the API response is valid
            if (!response.data || !response.data.status || !response.data.BK9 || !response.data.BK9.BK8) {
                return reply("❌ Unable to fetch the video. Please check the URL and try again.");
            }

            // Extract video details
            const { title, BK8 } = response.data.BK9;

            // Find the lowest quality video link
            const lowestQualityVideo = BK8.find(video => video.quality && video.format === "mp4") || BK8[0];

            if (!lowestQualityVideo || !lowestQualityVideo.link) {
                return reply("❌ No valid video link found.");
            }

            // Send the video to the user
            await conn.sendMessage(
                from,
                {
                    video: { url: lowestQualityVideo.link },
                    caption: `🎥 *Title:* ${title}\n📦 *Quality:* ${lowestQualityVideo.quality || "N/A"}\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`
                },
                { quoted: mek }
            );

        } catch (error) {
            console.error("Error in videox command:", error);
            reply("❌ An error occurred while processing your request. Please try again later.");
        }
    }
);
cmd({
  pattern: "fast",
  react: '🚀',
  desc: "Download audio from YouTube",
  category: "music",
  use: ".play2 <song name>",
  filename: __filename
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    if (!args.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("Please provide a song name. Example: .play2 Moye Moye");
    }

    // Add processing react
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // Search for the song on YouTube
    const query = args.join(" ");
    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ No results found.");
    }

    const videoUrl = searchResults.videos[0].url;

    // Fetch MP3 download link using the new API
    const apiUrl = `https://api.agungny.my.id/api/youtube-audiov2?url=${videoUrl}`;
    const response = await axios.get(apiUrl);

    if (!response.data.status || !response.data.result.url) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ Failed to fetch the MP3 file.");
    }

    const mp3Url = response.data.result.url;

    // Send the MP3 as an audio file without caption
    await conn.sendMessage(from, {
      audio: { url: mp3Url },
      mimetype: 'audio/mpeg',
      ptt: false
    });

    // Add success react
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Error:", error);

    // Add failure react
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    // Send error logs to WhatsApp
    const errorMessage = `
*❌ Play2 Command Error Logs*

*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || "Not available"}
*Timestamp:* ${new Date().toISOString()}
`;

    await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
  }
});

cmd({
  pattern: "fastvideo",
  alias: ["f2"],
  react: '⚡',
  desc: "Download video from YouTube",
  category: "media",
  use: ".video2 <video name>",
  filename: __filename
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    if (!args.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("Please provide a video name. Example: .video2 Pakistani Farzi");
    }

    // Add processing react
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // Search for the video on YouTube
    const query = args.join(" ");
    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ No results found.");
    }

    const videoUrl = searchResults.videos[0].url;

    // Fetch video download link using the new API
    const apiUrl = `https://api.agungny.my.id/api/youtube-videov2?url=${videoUrl}`;
    const response = await axios.get(apiUrl);

    if (!response.data.status || !response.data.result.url) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ Failed to fetch the video.");
    }

    const videoUrlDownload = response.data.result.url;

    // Send the video as a file
    await conn.sendMessage(from, {
      video: { url: videoUrlDownload },
      mimetype: 'video/mp4',
      caption: response.data.result.title,
      ptt: false
    });

    // Add success react
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Error:", error);

    // Add failure react
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    // Send error logs to WhatsApp
    const errorMessage = `
*❌ Video2 Command Error Logs*

*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || "Not available"}
*Timestamp:* ${new Date().toISOString()}
`;

    await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
  }
});

