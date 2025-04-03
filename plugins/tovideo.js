const converter = require('../lib/converter');
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');

// Cover image configuration
const COVER_URL = 'https://files.catbox.moe/18il7k.jpg';
let coverImagePath = null;

// Utility functions
function getRandomString() {
    return Math.random().toString(36).substring(2, 15);
}

async function ensureCoverImage() {
    if (!coverImagePath || !fs.existsSync(coverImagePath)) {
        coverImagePath = path.join(converter.tempDir, `cover_${getRandomString()}.jpg`);
        try {
            const response = await axios.get(COVER_URL, { 
                responseType: 'arraybuffer',
                timeout: 10000
            });
            await fs.promises.writeFile(coverImagePath, response.data);
        } catch (e) {
            console.error('Cover image download failed:', e.message);
            throw new Error('Failed to download cover image');
        }
    }
    return coverImagePath;
}

cmd({
    pattern: 'tovideo2',
    desc: 'Convert audio to video with cover image',
    category: 'media',
    react: '🎬',
    filename: __filename
}, async (client, match, message, { from }) => {
    // Input validation
    if (!match.quoted) {
        return await client.sendMessage(from, {
            text: "*🎵 Please reply to an audio message*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ"
        }, { quoted: message });
    }

    if (match.quoted.mtype !== 'audioMessage') {
        return await client.sendMessage(from, {
            text: "*❌ Only audio messages can be converted to video*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ"
        }, { quoted: message });
    }

    // Send processing message
    const processingMsg = await client.sendMessage(from, {
        text: "*🔄 Preparing video conversion...*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ"
    }, { quoted: message });

    let audioPath, outputPath;
    try {
        // Prepare files
        const imagePath = await ensureCoverImage();
        const buffer = await match.quoted.download();
        audioPath = path.join(converter.tempDir, `audio_${getRandomString()}.mp3`);
        outputPath = path.join(converter.tempDir, `video_${getRandomString()}.mp4`);

        await fs.promises.writeFile(audioPath, buffer);

        // Update processing status
        await client.sendMessage(from, {
            text: "*🔄 Converting audio to video...*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ",
            edit: processingMsg.key
        });

        // FFmpeg conversion with error handling
        const ffmpegArgs = [
            '-y',
            '-loop', '1',
            '-i', imagePath,
            '-i', audioPath,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            '-vf', 'scale=640:-2',
            '-movflags', '+faststart',
            outputPath
        ];

        const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
        
        let errorOutput = '';
        ffmpeg.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        await new Promise((resolve, reject) => {
            ffmpeg.on('close', (code) => {
                if (code !== 0) {
                    console.error('FFmpeg error:', errorOutput);
                    reject(new Error(`FFmpeg process failed with code ${code}`));
                } else {
                    resolve();
                }
            });
            ffmpeg.on('error', reject);
        });

        // Verify output
        if (!fs.existsSync(outputPath)) {
            throw new Error('Output file not created');
        }

        // Send result
        const videoBuffer = await fs.promises.readFile(outputPath);
        await client.sendMessage(from, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: "🎵 Audio Visualized\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ"
        }, { quoted: message });

    } catch (e) {
        console.error('Conversion error:', e);
        await client.sendMessage(from, {
            text: `*❌ Conversion failed*\n${e.message}\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`
        }, { quoted: message });
    } finally {
        // Cleanup
        await Promise.all([
            audioPath && converter.cleanFile(audioPath),
            outputPath && converter.cleanFile(outputPath)
        ]);
    }
});
