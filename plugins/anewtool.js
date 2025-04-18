
const { cmd } = require('../command');
const Jimp = require('jimp');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');

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

cmd({
    pattern: "convertfile",
    desc: "Convert file formats",
    category: "tools",
    react: "🔄"
}, async (conn, mek, m, { text, quoted, reply }) => {
    if (!quoted || !text) return reply("Reply to a file and specify format\nExample: !convertfile pdf");
    
    const buffer = await quoted.download();
    const tempPath = `./temp_${Date.now()}.${text}`;
    fs.writeFileSync(tempPath, buffer);
    
    await conn.sendMessage(m.chat, {
        document: { url: tempPath },
        mimetype: `application/${text}`,
        fileName: `converted.${text}`
    }, { quoted: mek });
    
    fs.unlinkSync(tempPath);
});

const reminders = {};
cmd({
    pattern: "remind",
    desc: "Set reminders",
    category: "tools",
    react: "⏰"
}, async (conn, mek, m, { text, reply, sender }) => {
    // Usage: !remind 30m Buy milk
    const [time, ...task] = text.split(" ");
    if (!time || !task.length) return reply("Example: !remind 30m Buy milk");
    
    const minutes = parseInt(time) * 60000;
    const reminderId = Date.now();
    
    reminders[reminderId] = setTimeout(() => {
        conn.sendMessage(m.chat, { 
            text: `⏰ REMINDER: ${task.join(" ")}\n\nSet ${msToTime(minutes)} ago`
        }, { quoted: mek });
        delete reminders[reminderId];
    }, minutes);
    
    await reply(`Reminder set for ${time} from now!`);
});

function msToTime(ms) {
    const minutes = Math.floor(ms / 60000);
    return minutes + " minute" + (minutes !== 1 ? "s" : "");
}

cmd({
    pattern: "tts",
    desc: "Convert text to speech",
    category: "tools",
    react: "🗣️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text. Example: !tts Hello world");
    const audioUrl = `https://api.ttsmp3.com/v1/voice?text=${encodeURIComponent(text)}&lang=en`;
    await conn.sendMessage(m.chat, { 
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg'
    }, { quoted: mek });
});

cmd({
    pattern: "animate",
    desc: "Create bouncing text animation",
    category: "fun",
    react: "💫"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text. Example: !animate Hello");
    const animated = text.split("").map((char, i) => 
        " ".repeat(i) + char
    ).join("\n");
    await reply(animated);
});
cmd({
    pattern: "hide",
    desc: "Hide secret text in images",
    category: "security",
    react: "🕵️"
}, async (conn, mek, m, { text, quoted, reply }) => {
    if (!quoted?.image || !text) return reply("Reply to image + provide secret text");
    const buffer = await quoted.download();
    const image = await Jimp.read(buffer);
    image.bitmap.hiddenMessage = text; // Simple steganography
    await conn.sendMessage(m.chat, await image.getBufferAsync(Jimp.MIME_JPEG), { quoted: mek });
});

cmd({
    pattern: "morse",
    desc: "Text ↔ Morse code converter",
    category: "tools",
    react: "✉️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text or morse code");
    const morseMap = { /* Morse code mapping */ };
    const isMorse = text.includes(".") || text.includes("-");
    
    const result = isMorse 
        ? text.split(" ").map(code => morseMap[code] || "?").join("")
        : text.toUpperCase().split("").map(char => morseMap[char] || "").join(" ");
    
    await reply(`*${isMorse ? "DECODED" : "MORSE"}*\n\n${result}`);
});
cmd({
    pattern: "ascii",
    desc: "Convert text to ASCII art",
    category: "fun",
    react: "🖼️"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter short text");
    const figlet = require('figlet');
    figlet.text(text, (err, data) => {
        conn.sendMessage(m.chat, { text: data || "Error" }, { quoted: mek });
    });
});

cmd({
    pattern: "lang",
    desc: "Detect text language",
    category: "tools",
    react: "🌐"
}, async (conn, mek, m, { text, reply }) => {
    if (!text) return reply("Enter text to analyze");
    const { data } = await axios.get(`https://api.languagedetector.com/detect?text=${encodeURIComponent(text)}`);
    await reply(`*Language Detection*\n\n${data.languages.map(l => 
        `${l.language} (${Math.round(l.confidence*100)}%)`
    ).join("\n")}`);
});
