const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const axios = require('axios');


cmd({
    pattern: "voicefx",
    desc: "Change voice effects on audio messages",
    alias: ["vfx", "voiceeffect"],
    category: "fun",
    react: "🎤",
    filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {
    try {
        const quotedMsg = m.quoted ? m.quoted : m;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
        
        if (!mimeType.includes('audio')) {
            return reply('❌ Please reply to a voice note or audio message');
        }

        // Download audio
        const buffer = await quotedMsg.download();
        const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}.ogg`);
        fs.writeFileSync(tempPath, buffer);

        // Effect selection menu
        const effects = {
            '1': { name: 'Chipmunk', param: 'highpitch' },
            '2': { name: 'Demon', param: 'lowpitch' },
            '3': { name: 'Slow', param: 'slow' },
            '4': { name: 'Robot', param: 'robot' },
            '5': { name: 'Echo', param: 'echo' }
        };

        let menu = '🎧 *VOICE EFFECTS*\n\n';
        Object.entries(effects).forEach(([num, effect]) => {
            menu += `${num}. ${effect.name}\n`;
        });
        menu += '\nReply with the effect number';

        await reply(menu);

        // Wait for user response
        const choice = await new Promise((resolve) => {
            const handler = ({ messages }) => {
                const msg = messages[0];
                if (msg.key.remoteJid === from && !msg.key.fromMe) {
                    conn.ev.off('messages.upsert', handler);
                    resolve(msg.message?.conversation || '');
                }
            };
            conn.ev.on('messages.upsert', handler);
            
            // Timeout after 30 seconds
            setTimeout(() => {
                conn.ev.off('messages.upsert', handler);
                resolve('');
            }, 30000);
        });

        if (!effects[choice]) {
            return reply('❌ Invalid selection or timed out');
        }

        // Process with API
        const form = new FormData();
        form.append('file', fs.createReadStream(tempPath), {
            filename: 'audio.ogg',
            contentType: 'audio/ogg'
        });
        form.append('effect', effects[choice].param);

        const { data } = await axios.post('https://api.voicemod.net/v2/fx', form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        });

        await conn.sendMessage(from, {
            audio: data,
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

        fs.unlinkSync(tempPath);

    } catch (error) {
        console.error('VoiceFX Error:', error);
        reply('❌ Failed to process audio. Error: ' + (error.message || error));
    }
});
