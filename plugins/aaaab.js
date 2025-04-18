const config = require('../config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "updatebotimage",
    desc: "Update the bot image URL used in menu command",
    alias: ["setbotimage", "changebotimage"],
    category: "Owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, isOwner, reply }) => {
    try {
        if (!isOwner) return reply('Sorry, only the bot owner can use this command.');

        // Check if there's a quoted image or URL provided
        if (!quoted?.image && !m.text) {
            return reply(`Please provide either:
1. An image URL: *${config.PREFIX}updatebotimage [url]*
2. Or quote an image with the command`);
        }

        let imageUrl = m.text?.trim();

        // Handle quoted image
        if (quoted?.image) {
            const buffer = await conn.downloadMediaMessage(quoted);
            
            // Upload to temporary host (implement your preferred service)
            const uploaded = await uploadImage(buffer);
            if (!uploaded) return reply('Failed to upload image');
            imageUrl = uploaded;
        }

        // Validate URL
        if (!imageUrl.match(/^https?:\/\/.+\/.+\.(jpg|jpeg|png|gif|webp)/i)) {
            return reply('❌ Invalid image URL! Must be direct image link (jpg/png/gif/webp)');
        }

        // Verify the image exists
        try {
            const head = await axios.head(imageUrl);
            if (!head.headers['content-type']?.startsWith('image/')) {
                return reply('❌ URL does not point to a valid image');
            }
        } catch (e) {
            return reply('❌ Could not verify image URL. Please check the link');
        }

        // Update in-memory config
        config.BOT_IMAGE = imageUrl;
        process.env.BOT_IMAGE = imageUrl;

        reply(`✅ *Bot Menu Image Updated Successfully!*\n\nNew Image URL: ${imageUrl}`);

    } catch (error) {
        console.error('UpdateBotImage Error:', error);
        reply('❌ Failed to update image. Error: ' + error.message);
    }
});

// Implement your preferred image upload service
async function uploadImage(buffer) {
    try {
        // Example using ImgBB (replace with your preferred service)
        const form = new FormData();
        form.append('image', buffer.toString('base64'));
        
        const { data } = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', form, {
            headers: form.getHeaders()
        });
        
        return data.data.url;
    } catch (e) {
        console.error('Upload failed:', e);
        return null;
    }
}
