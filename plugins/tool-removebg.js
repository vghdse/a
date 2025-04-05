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
  desc: "Remove the background from an image",
  category: "tools",
  use: ".removebg (reply to an image)",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Check if message contains image
    const quotedMessage = m.quoted ? m.quoted : m;
    const mimeType = (quotedMessage.msg || quotedMessage).mimetype || '';

    if (!mimeType || !mimeType.startsWith('image')) {
      return reply("❌ Please reply to an image (JPEG/PNG)");
    }

    // Download image
    await reply('⬇️ Downloading image...');
    const mediaBuffer = await quotedMessage.download();
    const tempFilePath = path.join(os.tmpdir(), `removebg_input_${Date.now()}.${mimeType.includes('png') ? 'png' : 'jpg'}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Process image
    await reply('🔄 Removing background...');

    // Method 1: Direct upload to API
    try {
      const form = new FormData();
      form.append('image', fs.createReadStream(tempFilePath));
      
      const { data } = await axios.post(
        'https://api.nexoracle.com/image-processing/remove-bg?apikey=free_key@maher_apis',
        form,
        {
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 60000
        }
      );

      // Verify the response is actually an image
      if (!data || data.length < 100) {
        throw new Error("Invalid image response");
      }

      // Send the result
      await conn.sendMessage(from, {
        image: data,
        caption: '✅ Background removed successfully!\nPowered by SubZero-MD',
        mentions: [m.sender]
      }, { quoted: mek });

      // Cleanup
      fs.unlinkSync(tempFilePath);
      return;

    } catch (e) {
      console.log('Method 1 failed:', e.message);
    }

    // Method 2: Fallback using URL upload
    try {
      await reply('⚡ Trying alternative method...');
      
      // Upload to temp host
      const uploadForm = new FormData();
      uploadForm.append('file', fs.createReadStream(tempFilePath));
      
      const uploadRes = await axios.post(
        'https://tmpfiles.org/api/v1/upload',
        uploadForm,
        { headers: uploadForm.getHeaders() }
      );

      const imageUrl = uploadRes.data?.data?.url;
      if (!imageUrl) throw new Error("Upload failed");

      // Process with NexOracle
      const { data } = await axios.get(
        `https://api.nexoracle.com/image-processing/remove-bg?apikey=free_key@maher_apis&img=${encodeURIComponent(imageUrl)}`,
        { responseType: 'arraybuffer' }
      );

      // Send result
      await conn.sendMessage(from, {
        image: data,
        caption: '✅ Background removed successfully!\nPowered by SubZero-MD',
        mentions: [m.sender]
      }, { quoted: mek });

    } catch (e) {
      console.log('Method 2 failed:', e.message);
      throw e;
    } finally {
      // Cleanup
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

  } catch (error) {
    console.error('RemoveBG error:', error);
    reply(`❌ Failed to process image: ${error.message}`);
  }
});
