/*

$$$$$$\            $$\                                               
$$  __$$\           $$ |                                              
$$ /  \__|$$\   $$\ $$$$$$$\  $$$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$\  
\$$$$$$\  $$ |  $$ |$$  __$$\ \____$$  |$$  __$$\ $$  __$$\ $$  __$$\ 
 \____$$\ $$ |  $$ |$$ |  $$ |  $$$$ _/ $$$$$$$$ |$$ |  \__|$$ /  $$ |
$$\   $$ |$$ |  $$ |$$ |  $$ | $$  _/   $$   ____|$$ |      $$ |  $$ |
\$$$$$$  |\$$$$$$  |$$$$$$$  |$$$$$$$$\ \$$$$$$$\ $$ |      \$$$$$$  |
 \______/  \______/ \_______/ \________| \_______|\__|       \______/

Project Name : SubZero MD
Creator      : Darrell Mucheri ( Mr Frank OFC )
Repo         : https//github.com/mrfrank-ofc/SUBZERO-MD
Support      : wa.me/18062212660
*/



const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const Config = require('../config');

cmd(
    {
        pattern: 'play',
        alias: ['song', 'ytmp3'],
        desc: 'Download YouTube songs',
        category: 'media',
        use: '<song name or YouTube URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('*Please provide a song name or YouTube URL*\nExample: .ytsong Alan Walker Lily\nOr: .ytsong https://youtu.be/ox4tmEV6-QU');

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            let videoUrl = q;
            
            // If it's not a URL, search YouTube
            if (!q.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/)) {
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
                const searchResponse = await axios.get(searchUrl);
                
                // Extract first video ID from search results (simplified approach)
                const videoIdMatch = searchResponse.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
                if (!videoIdMatch) return reply('*No results found for your search*');
                
                videoUrl = `https://youtube.com/watch?v=${videoIdMatch[1]}`;
            }

            // Call Dracula API
            const apiUrl = `https://draculazxy-xyzdrac.hf.space/api/Ytmp3?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios.get(apiUrl);
            
            if (response.data.STATUS !== 200 || !response.data.song?.download_link) {
                return reply('*Failed to download the song*');
            }

            const songData = response.data.song;
            const downloadUrl = songData.download_link;

            // Download the audio file
            const audioResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const audioBuffer = Buffer.from(audioResponse.data, 'binary');

            // Send the audio file
            await conn.sendMessage(mek.chat, { 
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${songData.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: songData.title,
                        body: '⟡ 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳 𝙱𝚈 𝚂𝚄𝙱𝚉𝙴𝚁𝙾 ⟡',
                        thumbnail: await getThumbnailBuffer(videoUrl),
                        mediaType: 2,
                        mediaUrl: videoUrl,
                        sourceUrl: videoUrl
                    }
                }
            }, { quoted: mek });

            // Send success reaction
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Error in ytsong command:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('*Error downloading song. Please try again later.*');
        }
    }
);

// Helper function to get YouTube thumbnail
async function getThumbnailBuffer(videoUrl) {
    try {
        const videoId = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null; // Return null if thumbnail can't be fetched
    }
}

