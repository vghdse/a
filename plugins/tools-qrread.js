const { cmd } = require('../command');
const axios = require('axios');
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
    // Check for media
    const mediaMsg = quoted || message;
    if (!mediaMsg.msg?.mimetype?.includes('image')) {
      return reply('❌ Please reply to a clear image containing a QR code');
    }

    // Download image directly to buffer
    const imageBuffer = await mediaMsg.download();
    
    // Use free QR decoding API that accepts direct uploads
    const form = new FormData();
    form.append('file', imageBuffer, { 
      filename: 'qr.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync()
      },
      timeout: 20000
    });

    // Parse response
    const result = response.data?.[0]?.symbol?.[0];
    if (!result?.data) {
      if (result?.error) {
        throw new Error(`QR API Error: ${result.error}`);
      }
      throw new Error('No QR code found in the image');
    }

    // Send successful result
    await reply(`*QR Code Content:*\n\n${result.data}\n\n> © SUBZERO QR Scanner`);

  } catch (error) {
    console.error('QR Scan Error:', error);
    reply(`❌ Failed to scan QR code:\n${error.message}\n\nPlease try with a clearer image`);
  }
});
