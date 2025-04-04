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
  desc: "Remove the background from an image using Catbox upload",
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

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), 'image.jpg');
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    if (!uploadResponse.data) {
      throw new Error("❌ Error uploading to Catbox.");
    }

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath);

    // Inform user about background removal
    await reply('```Subzero Removing Background...🦄```');

    // Prepare the NexOracle API URL
    const apiUrl = `https://api.nexoracle.com/image-processing/remove-bg`;
    const params = {
      apikey: 'free_key@maher_apis',
      img: imageUrl,
    };

    // Call the NexOracle API
    const response = await axios.get(apiUrl, { 
      params, 
      responseType: 'arraybuffer',
      timeout: 30000 // 30 seconds timeout
    });

    if (!response.data || response.status !== 200) {
      return reply('❌ Unable to remove the background. Please try again later.');
    }

    // Save result to temporary file
    const resultFilePath = path.join(os.tmpdir(), `subzero_removed_bg_${Date.now()}.png`);
    fs.writeFileSync(resultFilePath, response.data);

    // Send the result
    await conn.sendMessage(from, {
      image: fs.readFileSync(resultFilePath),
      caption: '> 🖼️ *Background Removed Successfully!*\n> 🔗 *Source:* ' + imageUrl,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363304325601080@newsletter',
          newsletterName: '『 𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐌𝐃 』',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Clean up
    fs.unlinkSync(resultFilePath);

  } catch (error) {
    console.error('Error in removebg command:', error);
    reply(`❌ Error: ${error.message || 'Failed to process image'}`);
  }
});
