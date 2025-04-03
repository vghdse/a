const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'readqr',
  alias: ['scanqr', 'qrdecode'],
  react: '🔍',
  desc: 'Read QR codes from images',
  category: 'utility',
  use: '<reply to image>',
  filename: __filename
}, async (client, message, args, { reply, quoted }) => {
  try {
    // Check if message has media
    const mediaMsg = quoted || message;
    if (!mediaMsg.msg?.mimetype?.includes('image')) {
      return reply('❌ Please reply to an image containing a QR code');
    }

    // Download the image
    const mediaBuffer = await mediaMsg.download();
    const tempPath = path.join(__dirname, '../temp', `qr_${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, mediaBuffer);

    // Upload to free image host (Catbox)
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempPath), 'qr.jpg';
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });
    const imageUrl = uploadResponse.data;

    // Process QR code using free API
    const qrApiUrl = `https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(imageUrl)}`;
    const scanResponse = await axios.get(qrApiUrl, { timeout: 15000 });

    if (!scanResponse.data?.[0]?.symbol?.[0]?.data) {
      throw new Error('No QR code found or could not be read');
    }

    const qrData = scanResponse.data[0].symbol[0].data;
    
    // Clean up temp file
    fs.unlinkSync(tempPath);

    // Send result
    await reply(`*QR Code Content:*\n\n${qrData}\n\n> © Powered by SUBZERO`);

  } catch (error) {
    console.error('QR Read Error:', error);
    reply(`❌ Failed to read QR code: ${error.message}\n\nPlease ensure:\n1. Image is clear\n2. QR code is centered\n3. Not blurry`);
    
    // Clean up temp file if it exists
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
});

// Helper to ensure temp directory exists
if (!fs.existsSync(path.join(__dirname, '../temp'))) {
  fs.mkdirSync(path.join(__dirname, '../temp'), { recursive: true });
}
