const axios = require('axios');
const yts = require('yt-search');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "play",
    alias: ["song", "music"],
    desc: "Download audio/video from YouTube",
    category: "media",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, prefix }) => {
    try {
        if (!args) return reply("*Please provide a song name or keywords to search for.*\nExample: .play baby shark");

        const searchQuery = args;
        await conn.sendMessage(from, { react: { text: "🎧", key: mek.key } });
        await reply("*🎧 Searching for the song...*");

        const searchResults = await yts(searchQuery);
        if (!searchResults.videos || searchResults.videos.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No results found for "${searchQuery}".`);
        }

        const firstResult = searchResults.videos[0];
        const videoUrl = firstResult.url;
        const videoTitle = firstResult.title;
        const videoDuration = firstResult.timestamp;
        const videoAuthor = firstResult.author.name;

        const buttons = [
            { buttonId: `${prefix}confirm_audio ${videoUrl}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
            { buttonId: `${prefix}confirm_video ${videoUrl}`, buttonText: { displayText: '🎥 Video' }, type: 1 },
            { buttonId: `${prefix}cancel_play`, buttonText: { displayText: '❌ Cancel' }, type: 1 }
        ];

        const buttonMessage = {
            text: `*Found:* ${videoTitle}\n*Duration:* ${videoDuration}\n*Channel:* ${videoAuthor}\n\nChoose the format you want to download:`,
            footer: "> SUBZERO-MD",
            buttons: buttons,
            headerType: 1
        };

        await conn.sendMessage(from, buttonMessage);
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ An error occurred while searching for the media.");
    }
});

cmd({
    pattern: "confirm_audio",
    desc: "Confirm audio download",
    category: "media",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, prefix }) => {
    try {
        if (!args) return reply("*Invalid request. Please try again.*");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        await reply("*⏳ Starting audio download process...*");

        const videoUrl = args;
        
        // Try first API
        try {
            const headers = {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-platform": '"Android"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                Referer: "https://v4.mp3paw.link/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            };
            const apiKey = "30de256ad09118bd6b60a13de631ae2cea6e5f9d";
            const downloadInitUrl = `https://p.oceansaver.in/ajax/download.php?copyright=0&format=mp3&url=${encodeURIComponent(videoUrl)}&api=${apiKey}`;
            const initResponse = await axios.get(downloadInitUrl, { headers });
            
            if (initResponse.data && initResponse.data.url) {
                const downloadUrl = initResponse.data.url;
                const title = initResponse.data.title || "Downloaded audio";
                await conn.sendMessage(
                    from,
                    {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mp4",
                        ptt: false,
                        fileName: `${title}.mp3`,
                    },
                    { quoted: mek }
                );
                await conn.sendMessage(from, { react: { text: "🎵", key: mek.key } });
                return reply(`✅ *${title}* has been downloaded successfully!`);
            }
        } catch (error) {
            console.log("First API method failed, trying second method...");
        }

        // Try second API
        try {
            const apiUrl = `https://api.agungny.my.id/api/youtube-audiov2?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            if (response.data.status && response.data.result.url) {
                const mp3Url = response.data.result.url;
                const title = response.data.result.title || "Downloaded audio";
                await conn.sendMessage(
                    from,
                    {
                        audio: { url: mp3Url },
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileName: `${title}.mp3`,
                    },
                    { quoted: mek }
                );
                await conn.sendMessage(from, { react: { text: "🎵", key: mek.key } });
                return reply(`✅ *${title}* has been downloaded successfully!`);
            }
        } catch (error) {
            console.log("Second API method failed, trying third method...");
        }

        // Try third API
        try {
            const apiUrl = `https://bk9.fun/download/ytmp3?url=${encodeURIComponent(videoUrl)}&type=mp3`;
            const response = await axios.get(apiUrl);
            if (response.data && response.data.status && response.data.BK9 && response.data.BK9.downloadUrl) {
                const { title, downloadUrl } = response.data.BK9;
                await conn.sendMessage(
                    from,
                    {
                        audio: { url: downloadUrl },
                        mimetype: "audio/mpeg",
                        ptt: false,
                        fileName: `${title}.mp3`,
                    },
                    { quoted: mek }
                );
                await conn.sendMessage(from, { react: { text: "🎵", key: mek.key } });
                return reply(`✅ *${title}* has been downloaded successfully!`);
            }
        } catch (error) {
            console.log("All API methods failed");
        }

        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to download the audio. Please try again later.");
        
    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ An error occurred during the download process. Please try again later.");
    }
});

cmd({
    pattern: "confirm_video",
    desc: "Confirm video download",
    category: "media",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, prefix }) => {
    try {
        if (!args) return reply("*Invalid request. Please try again.*");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        await reply("*⏳ Starting video download process...*");

        const videoUrl = args;
        
        // Try first API
        try {
            const apiUrl = `https://api.agungny.my.id/api/youtube-videov2?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            if (response.data.status && response.data.result.url) {
                const videoUrlDownload = response.data.result.url;
                const title = response.data.result.title || "Downloaded video";
                await conn.sendMessage(
                    from,
                    {
                        video: { url: videoUrlDownload },
                        mimetype: 'video/mp4',
                        caption: title,
                    },
                    { quoted: mek }
                );
                await conn.sendMessage(from, { react: { text: "🎥", key: mek.key } });
                return reply(`✅ *${title}* has been downloaded successfully!`);
            }
        } catch (error) {
            console.log("First video API method failed, trying second method...");
        }

        // Try second API
        try {
            const apiUrl = `https://bk9.fun/download/youtube?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            if (response.data && response.data.status && response.data.BK9 && response.data.BK9.BK8) {
                const { title, BK8 } = response.data.BK9;
                
                const lowestQualityVideo = BK8.find(video => video.quality && video.format === "mp4") || BK8[0];
                if (lowestQualityVideo && lowestQualityVideo.link) {
                    await conn.sendMessage(
                        from,
                        {
                            video: { url: lowestQualityVideo.link },
                            mimetype: 'video/mp4',
                            caption: `${title} (${lowestQualityVideo.quality || "N/A"})`,
                        },
                        { quoted: mek }
                    );
                    await conn.sendMessage(from, { react: { text: "🎥", key: mek.key } });
                    return reply(`✅ *${title}* has been downloaded successfully!`);
                }
            }
        } catch (error) {
            console.log("All video API methods failed");
        }

        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to download the video. Please try again later.");
        
    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ An error occurred during the video download process. Please try again later.");
    }
});

cmd({
    pattern: "cancel_play",
    desc: "Cancel download",
    category: "media",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
    reply("*Download cancelled.*");
});
