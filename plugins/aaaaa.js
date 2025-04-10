const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { cmd } = require("../command");

cmd({
  pattern: "ghibli",
  alias: ["ghiblify", "studioghibli"],
  react: '🎨',
  desc: "Transform images into Ghibli-style artwork",
  category: "image",
  use: "Reply to an image with .ghibli or upload with caption",
  filename: __filename
}, async (client, message, { reply, quoted }) => {
  try {
    // Check for media in quoted message or current message
    const media = quoted ? quoted : message;
    const mimeType = media.mimetype || '';

    if (!mimeType.startsWith('image/')) {
      return reply("❌ Please reply to an image (JPEG/PNG)");
    }

    // Download the image
    const imageBuffer = await media.download();
    const tempPath = `./temp/ghibli_${Date.now()}.jpg`;
    fs.writeFileSync(tempPath, imageBuffer);

    // Prepare form data
    const form = new FormData();
    form.append('image', fs.createReadStream(tempPath), {
      filename: 'input.jpg',
      contentType: 'image/jpeg'
    };

    // Show processing message
    await reply("🔄 Transforming your image into Ghibli art...");

    // Call Ghibli AI API
    const response = await axios.post(
      'https://ghibliai-worker.ahmadjandal.workers.dev/generate',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    // Save the transformed image
    const outputPath = `./temp/ghibli_output_${Date.now()}.png`;
    fs.writeFileSync(outputPath, response.data);

    // Send the result
    await client.sendMessage(message.chat, {
      image: fs.readFileSync(outputPath),
      caption: "✨ Your Ghibli-style artwork!"
    }, { quoted: message });

    // Clean up
    fs.unlinkSync(tempPath);
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Ghibli Error:', error);
    reply(`❌ Failed to transform image: ${error.message || 'Server error'}`);
  }
});
