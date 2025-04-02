const axios = require('axios');
const yts = require('yt-search');
const { cmd, generateWAMessageFromContent, proto } = require('../command');
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

        let buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎵 Audio",
                    id: `${prefix}confirm_audio ${videoUrl}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🎥 Video",
                    id: `${prefix}confirm_video ${videoUrl}`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "❌ Cancel",
                    id: `${prefix}cancel_play`
                })
            }
        ];

        let msg = generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `*Found:* ${videoTitle}\n*Duration:* ${videoDuration}\n*Channel:* ${videoAuthor}\n\nChoose the format you want to download:`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "> SUBZERO-MD"
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: "🎵 Media Found",
                            subtitle: "Click a button to continue",
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: buttons
                        })
                    })
                }
            }
        }, {});

        await conn.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        });
        
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

        // Rest of the audio download code remains the same...
        // [Include the other two API methods from your original code]

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ An error occurred during the download process. Please try again later.");
    }
});

// [Include the confirm_video and cancel_play commands from your original code]
