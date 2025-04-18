const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Jimp = require('jimp');
const qrCode = require('qrcode-reader');

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

        // Create temp directory if not exists
        const tempDir = './temp';
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Download and save the image
        const buffer = await conn.downloadMediaMessage(quoted);
        const tempPath = path.join(tempDir, `qr_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, buffer);

        try {
            // Process with Jimp and QR reader
            const image = await Jimp.read(fs.readFileSync(tempPath));
            const qr = new qrCode();
            
            const decodedText = await new Promise((resolve) => {
                qr.callback = (err, value) => {
                    if (err) {
                        console.error('QR Decode Error:', err);
                        resolve(null);
                    } else {
                        resolve(value?.result);
                    }
                };
                qr.decode(image.bitmap);
            });

            if (!decodedText) {
                return reply('❌ No QR code found or could not be read. Please send a clearer image.');
            }

            // Send the decoded content with safety check
            let response = `✅ *QR Code Content:*\n\n${decodedText}`;
            
            // If it's a URL, add safety warning
            if (decodedText.match(/^https?:\/\//i)) {
                response += `\n\n⚠️ *Warning:* This QR contains a link. Be careful visiting unknown URLs.`;
            }

            await reply(response);

        } finally {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }

    } catch (error) {
        console.error('QR Read Error:', error);
        reply('❌ Failed to process QR code. Please try with a different image.');
    }
});
