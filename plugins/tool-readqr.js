const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const jimp = require('jimp');
const qrcode = require('qrcode-reader');

cmd({
    pattern: "qrread",
    desc: "Read QR codes from images",
    alias: ["scanqr", "qrdetect"],
    category: "tools",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, reply, quoted }) => {
    try {
        if (!quoted?.image) return reply('❌ Please reply to an image containing a QR code');

        // Download the image
        const buffer = await conn.downloadMediaMessage(quoted);
        const image = await jimp.read(buffer);

        // Process with QR reader
        const qr = new qrcode();
        const decodedText = await new Promise((resolve, reject) => {
            qr.callback = (err, value) => err ? reject(err) : resolve(value?.result);
            qr.decode(image.bitmap);
        });

        if (!decodedText) return reply('❌ No QR code found in the image');

        // Send the decoded content
        await reply(`✅ QR Code Content:\n\n${decodedText}`);

    } catch (error) {
        console.error('QR Read Error:', error);
        reply('❌ Failed to read QR code. ' + (
            error.message.includes('find') 
            ? 'No QR code detected' 
            : 'Please send a clearer image'
        ));
    }
});
