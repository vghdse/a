const axios = require("axios");
const { cmd } = require("../command");
const yts = require("yt-search"); // For searching YouTube
/*

- MADE BY MR FRANK 
- COPY WITH CREDITS

*/

const config = require('../config');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play",
    alias: ["p", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `📽️ *\`𝚂𝚄𝙱𝚉𝙴𝚁𝙾 𝚈𝚃 𝙿𝙻𝙰𝚈𝙴𝚁\`*📽️\n\n⟡─────────────────⟡\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n⟡─────────────────⟡\n` +
            `🔢 *Reply with your choice:*\n\n` +
            `1️⃣ |  *Audio* Type 🎵\n` +
            `2️⃣ |  *Document* Type 📁\n` +
            `3️⃣ |  *Video* Type 🎥\n\n` +

            `${config.FOOTER || "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen for user reply only once!
        conn.ev.on('messages.upsert', async (messageUpdate) => { 
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let msg;
                let type;
                let response;
                
                if (userReply === "1") {
                    msg = await conn.sendMessage(from, { text: "_⏳ Subzero Processing, Wait 5 seconds..._" }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                    
                } else if (userReply === "2") {
                    msg = await conn.sendMessage(from, { text: "_⏳ Subzero Processing, Wait 5 seconds..._" }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                    
                
                } else if (userReply === "3") {
                    msg = await conn.sendMessage(from, { text: "_⏳ Subzero Processing, Wait 5 seconds..._" }, { quoted: mek });
                    const response = await dy_scrap.ytmp4_v2(`https://youtube.com/watch?v=${id}`, 360); // Default quality: 360p
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { video: { url: downloadUrl }, caption: title };
                    
                } else { 
                    return await reply("❌ Invalid choice! Reply with 1️⃣, 2️⃣ or 3️⃣");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Downloaded Successfully ✅', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});



// Song Downloader Command
cmd(
    {
        pattern: "song3",
        alias: ["song2", "songx"],
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
        pattern: "video2",
        alias: ["ytvideo2"],
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
  pattern: "song",
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
  pattern: "video",
  alias: ["ytmp4"],
  react: '🚀',
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
