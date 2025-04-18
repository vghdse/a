const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

cmd({
    pattern: "voicefx",
    desc: "Change voice effects on audio messages",
    alias: ["vfx", "voiceeffect"],
    category: "fun",
    react: "🎤",
    filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {
    try {
        if (!quoted?.audio) return reply('❌ Please reply to a voice note or audio message');

        // Download the audio
        const buffer = await conn.downloadMediaMessage(quoted);
        const tempPath = './temp_audio.ogg';
        fs.writeFileSync(tempPath, buffer);

        // Voice effects options
        const effects = {
            '1': 'chipmunk',
            '2': 'demon',
            '3': 'slow',
            '4': 'robot',
            '5': 'echo',
            '6': 'reverse'
        };

        // Show effect selection
        let effectList = '🎧 *VOICE EFFECTS*\n\n';
        for (const [num, effect] of Object.entries(effects)) {
            effectList += `${num}. ${effect.charAt(0).toUpperCase() + effect.slice(1)}\n`;
        }
        effectList += '\nReply with the number of the effect you want';

        await reply(effectList);

        // Wait for user response
        const effectChoice = await new Promise((resolve) => {
            conn.ev.once('messages.upsert', ({ messages }) => {
                const msg = messages[0];
                if (msg.key.remoteJid === from && msg.key.fromMe === false) {
                    resolve(msg.message?.conversation || '');
                }
            });
        });

        if (!effects[effectChoice]) return reply('❌ Invalid choice');

        // Process with voicechanger.io free API
        const form = new FormData();
        form.append('audio', fs.createReadStream(tempPath));
        form.append('effect', effects[effectChoice]);

        const { data } = await axios.post('https://api.voicechanger.io/process', form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        });

        // Send the modified audio
        await conn.sendMessage(from, {
            audio: data,
            mimetype: 'audio/ogg',
            ptt: true
        }, { quoted: mek });

        // Clean up
        fs.unlinkSync(tempPath);

    } catch (error) {
        console.error('VoiceFX Error:', error);
        reply('❌ Failed to process audio. Error: ' + error.message);
    }
});
