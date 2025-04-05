const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "removebg",
  alias: ["rmbg","removeback","removebackground"],
  react: '🖼️',
  desc: "Remove the background from an image using direct upload",
  category: "tools",
  use: ".removebg (reply to an image)",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Check if the message is a quoted message or contains media
    const quotedMessage = m.quoted ? m.quoted : m;
    const mimeType = (quotedMessage.msg || quotedMessage).mimetype || '';

    if (!mimeType || !mimeType.startsWith('image')) {
      return reply("🌻 Please reply to an image (JPEG/PNG).");
    }

    // Download the media file
    const mediaBuffer = await quotedMessage.download();
    const tempFilePath = path.join(os.tmpdir(), `subzero_bg_${Date.now()}${mimeType.includes('png') ? '.png' : '.jpg'}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // First try direct upload to NexOracle with API key
    await reply('```Processing image... Please wait 🕒```');

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(tempFilePath));
      
      const response = await axios.post('https://api.nexoracle.com/image-processing/remove-bg?apikey=free_key@maher_apis', formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'image/png'
        },
        responseType: 'arraybuffer',
        timeout: 45000
      });

      if (response.status !== 200 || !response.data) {
        throw new Error('API response error');
      }

      const resultFilePath = path.join(os.tmpdir(), `subzero_removed_bg_${Date.now()}.png`);
      fs.writeFileSync(resultFilePath, response.data);

      await conn.sendMessage(from, {
        image: fs.readFileSync(resultFilePath),
        caption: '> 🖼️ *Background Removed Successfully!*\n> ✨ Powered by SubZero-MD',
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: mek });

      // Clean up
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(resultFilePath);
      return;

    } catch (uploadError) {
      console.log('Direct upload failed, trying fallback method...', uploadError);
    }

    // Fallback method using alternative upload
    await reply('```Using alternative method... 🔄```');

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(tempFilePath), 'image.jpg');

      const uploadResponse = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      if (!uploadResponse.data?.data?.url) {
        throw new Error("Upload service failed");
      }

      const imageUrl = uploadResponse.data.data.url;
      const apiUrl = `https://api.nexoracle.com/image-processing/remove-bg?apikey=free_key@maher_apis&img=${encodeURIComponent(imageUrl)}`;

      const bgResponse = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 45000
      });

      const resultFilePath = path.join(os.tmpdir(), `subzero_removed_bg_${Date.now()}.png`);
      fs.writeFileSync(resultFilePath, bgResponse.data);

      await conn.sendMessage(from, {
        image: fs.readFileSync(resultFilePath),
        caption: '> 🖼️ *Background Removed Successfully!*\n> ✨ Powered by SubZero-MD',
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: mek });

      // Clean up
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(resultFilePath);

    } catch (error) {
      console.error('Error in removebg command:', error);
      fs.unlinkSync(tempFilePath);
      reply(`❌ Error: ${error.message || 'Failed to process image. Please try again later.'}`);
    }

  } catch (error) {
    console.error('Main error in removebg command:', error);
    reply(`❌ Error: ${error.message || 'An unexpected error occurred'}`);
  }
});
