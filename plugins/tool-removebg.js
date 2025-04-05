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
  desc: "Remove the background from an image.",
  category: "tools",
  use: ".removebg (reply to an image)",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Check if the message is a quoted message or contains media
    const quotedMessage = m.quoted ? m.quoted : m;
    const mimeType = (quotedMessage.msg || quotedMessage).mimetype || '';

    if (!mimeType || !mimeType.startsWith('image')) {
      return reply("🌻 Please reply to an image.");
    }

    // Download the media file
    const mediaBuffer = await quotedMessage.download();
    const tempFilePath = path.join(os.tmpdir(), `subzero_bg_${Date.now()}.jpg`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload the media to Catbox
    const formData = new FormData();
    formData.append('fileToUpload', fs.createReadStream(tempFilePath));
    formData.append('reqtype', 'fileupload');
    formData.append('userhash', ''); // Add if you have a userhash

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (!uploadResponse.data || typeof uploadResponse.data !== 'string' || !uploadResponse.data.startsWith('http')) {
      throw new Error("❌ Error uploading the image to Catbox.");
    }

    const imageUrl = uploadResponse.data;

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Inform the user that the background removal is in progress
    await reply('```Subzero Removing Background...🦄```');

    // Call the NexOracle API
    const apiUrl = `https://api.nexoracle.com/image-processing/remove-bg`;
    const params = {
      apikey: 'free_key@maher_apis',
      img: imageUrl,
    };

    const response = await axios.get(apiUrl, { 
      params, 
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Check if the API response is valid
    if (!response.data || response.status !== 200) {
      return reply('❌ Unable to remove the background. Please try again later.');
    }

    // Send the resulting image directly from buffer
    await conn.sendMessage(from, {
      image: response.data,
      caption: '> 🖼️ *Background Removed Successfully!*\n> ✨ Powered by SubZero-MD',
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: mek });

  } catch (error) {
    console.error('Error removing background:', error);
    reply('❌ Error: ' + (error.message || 'Failed to process image'));
    
    // Clean up any remaining temp files
    try {
      const files = fs.readdirSync(os.tmpdir());
      files.forEach(file => {
        if (file.startsWith('subzero_bg_') || file.startsWith('subzero_bot_removed_bg')) {
          fs.unlinkSync(path.join(os.tmpdir(), file));
        }
      });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
});
