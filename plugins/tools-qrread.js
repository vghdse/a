const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

cmd({
  pattern: "readqr",
  alias: ["scanqr", "qrread"],
  react: '🔍',
  desc: "Read QR code from image",
  category: "tools",
  use: "Reply to QR image with .readqr",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Check if replying to image
    if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.startsWith('image')) {
      return reply("❌ Please reply to a QR code image");
    }

    // Download image
    const imageBuffer = await m.quoted.download();
    const tempPath = path.join(__dirname, '../temp/qr_temp.jpg');
    fs.writeFileSync(tempPath, imageBuffer);

    // Prepare for API
    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath));

    // Send to QR API
    const { data } = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
      headers: form.getHeaders()
    });

    // Clean up
    fs.unlinkSync(tempPath);

    // Get result
    const qrText = data[0]?.symbol[0]?.data;
    if (!qrText) return reply("🔍 No QR code found");

    // Send result
    await conn.sendMessage(from, {
      text: `*QR CODE RESULT:*\n\n${qrText}\n\n📋 _Click to copy_`,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: mek });

  } catch (error) {
    console.error('QR Error:', error);
    reply("❌ Error reading QR code");
  }
});
