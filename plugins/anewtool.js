/*const { cmd } = require('../command');
const Jimp = require('jimp');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const figlet = require('figlet');

// ===== UTILITY FUNCTIONS =====
const TEMP_DIR = path.join(os.tmpdir(), 'subzero_temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

function msToTime(ms) {
    const minutes = Math.floor(ms / 60000);
    return minutes + " minute" + (minutes !== 1 ? "s" : "");
}

// ===== PLUGINS =====

// Group Analyzer
cmd({
    pattern: "analyzegc",
    desc: "Analyze chat activity",
    category: "stats",
    react: "📊"
}, async (conn, mek, m, { reply, groupMetadata }) => {
    if (!m.isGroup) return reply("Group only command");
    
    const participants = groupMetadata.participants;
    const activeUsers = participants.slice(0, 5).map(p => `@${p.id.split('@')[0]}`);
    
    await reply(`📊 *Group Analysis*\n\n👥 Members: ${participants.length}\n🌟 Top Active: ${activeUsers.join(", ")}`);
});

// File Converter
cmd({
    pattern: "convertfile",
    desc: "Convert file formats",
    category: "tools",
    react: "🔄"
}, async (conn, mek, m, { text, quoted, reply }) => {
    if (!quoted || !text) return reply("Reply to a file with format\nExample: !convertfile pdf");
    
    try {
        const buffer = await quoted.download();
        const tempPath = path.join(TEMP_DIR, `file_${Date.now()}.${text}`);
        fs.writeFileSync(tempPath, buffer);
        
        await conn.sendMessage(m.chat, {
            document: { url: tempPath },
            mimetype: `application/${text}`,
            fileName: `converted.${text}`
        }, { quoted: mek });
    } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
});

// Reminder System
const reminders = {};
cmd({
    pattern: "remind",
    desc: "Set reminders",
    category: "tools",
    react: "⏰"
}, async (conn, mek, m, { text, reply, sender }) => {
    const [time, ...task] = text.split(" ");
    if (!time || !task.length) return reply("Example: !remind 30m Buy milk");
    
    const minutes = parseInt(time) * 60000;
    if (isNaN(minutes)) return reply("Invalid time format");
    
    const reminderId = Date.now();
    reminders[reminderId] = setTimeout(() => {
        conn.sendMessage(m.chat, { 
            text: `⏰ REMINDER: ${task.join(" ")}\n\nSet ${msToTime(minutes)} ago`
        }, { quoted: mek });
        delete reminders[reminderId];
    }, minutes);
    
    await reply(`⏰ Reminder set for ${time} from now!`);
});

// Text-to-Speech
cmd({
    pattern: "tts",
    desc: "Convert text to speech",
    category: "tools",
    react: "🗣️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Example: !tts Hello world");
    await conn.sendMessage(m.chat, { 
        audio: { 
            url: `https://api.ttsmp3.com/v1/voice?text=${encodeURIComponent(text)}&lang=en` 
        },
        mimetype: 'audio/mpeg',
        ptt: true
    }, { quoted: mek });
});

// Text Animator
cmd({
    pattern: "animate",
    desc: "Create bouncing text",
    category: "fun",
    react: "💫"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Example: !animate Hello");
    const animated = text.split("").map((char, i) => " ".repeat(i) + char).join("\n");
    await reply(animated);
});

// Steganography
cmd({
    pattern: "hide",
    desc: "Hide text in images",
    category: "security",
    react: "🕵️"
}, async (conn, mek, m, { text, quoted, reply }) => {
    if (!quoted?.image || !text) return reply("Reply to image with text");
    
    try {
        const buffer = await quoted.download();
        const image = await Jimp.read(buffer);
        image.bitmap.hiddenMessage = text;
        await conn.sendMessage(m.chat, await image.getBufferAsync(Jimp.MIME_JPEG), { 
            quoted: mek 
        });
    } catch (e) {
        reply("Error processing image");
    }
});

// Morse Code Translator
const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    // ... complete morse alphabet ...
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----'
};

cmd({
    pattern: "morse",
    desc: "Text ↔ Morse code",
    category: "tools",
    react: "✉️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text/morse code");
    
    const isMorse = /[.-]/.test(text);
    let result;
    
    if (isMorse) {
        const reverseMap = Object.fromEntries(
            Object.entries(morseMap).map(([k, v]) => [v, k])
        );
        result = text.split(' ').map(c => reverseMap[c] || '?').join('');
    } else {
        result = text.toUpperCase().split('')
            .map(c => morseMap[c] || '')
            .filter(Boolean).join(' ');
    }
    
    await reply(`*${isMorse ? "DECODED" : "MORSE"}*\n\n${result}`);
});

// ASCII Art Generator
cmd({
    pattern: "ascii",
    desc: "Convert text to ASCII art",
    category: "fun",
    react: "🖼️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter short text");
    
    figlet.text(text, {
        font: 'Standard',
        width: 80
    }, (err, data) => {
        conn.sendMessage(m.chat, { 
            text: err ? "Error" : `\`\`\`${data}\`\`\`` 
        }, { quoted: mek });
    });
});

// Language Detector
cmd({
    pattern: "lang",
    desc: "Detect text language",
    category: "tools",
    react: "🌐"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text to analyze");
    
    try {
        const { data } = await axios.get(`https://api.languagedetector.com/detect?text=${encodeURIComponent(text)}`);
        await reply(`*Language Detection*\n\n${
            data.languages.map(l => `${l.language}: ${Math.round(l.confidence*100)}%`).join('\n')
        }`);
    } catch {
        reply("Detection service unavailable");
    }
});
*/
