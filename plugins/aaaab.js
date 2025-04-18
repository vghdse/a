const config = require('../config');
const axios = require('axios');
const { cmd } = require('../command');
const FormData = require('form-data');

cmd({
    pattern: "updatebotimage",
    desc: "Update the bot image URL for menu",
    alias: ["setbotimage", "changebotimage"],
    category: "Owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, isOwner, reply }) => {
    try {
        if (!isOwner) return reply('❌ Owner only command!');

        // Check for quoted image or URL
        if (!quoted?.image && !m.text) {
            return reply(`📌 How to use:
• Send ${config.PREFIX}updatebotimage [image-url]
• Or reply to an image with this command`);
        }

        let imageUrl = m.text?.trim();

        // Handle quoted image
        if (quoted?.image) {
            reply('⬆️ Uploading image...');
            const buffer = await conn.downloadMediaMessage(quoted);
            imageUrl = await uploadImage(buffer);
            if (!imageUrl) return reply('❌ Image upload failed!');
        }

        // Basic URL format check
        if (!imageUrl.startsWith('http')) {
            return reply('❌ Invalid URL format! Must start with http/https');
        }

        // Update config
        config.BOT_IMAGE = imageUrl;
        process.env.BOT_IMAGE = imageUrl;

        reply(`✅ *Bot image updated!*\n\nNew image: ${imageUrl}`);

    } catch (error) {
        console.error('Update error:', error);
        reply(`❌ Error: ${error.message}`);
    }
});

// Simple image uploader
async function uploadImage(buffer) {
    try {
        const form = new FormData();
        form.append('image', buffer.toString('base64'));
        
        // Using free image host (replace with your own)
        const { data } = await axios.post('https://api.imgbb.com/1/upload?key=7b46d3cddc9b67ef690ed03dce9cb7d5', form);
        return data.data.url || data.data.display_url;
    } catch (e) {
        console.error('Upload error:', e);
        return null;
    }
}
