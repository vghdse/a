const config = require('../config');
const axios = require('axios');
const { cmd } = require('../command');
const FormData = require('form-data'); // Add this at top

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

        if (!quoted?.image && !m.text) {
            return reply(`Please provide either:
1. An image URL: *${config.PREFIX}updatebotimage [url]*
2. Or quote an image with the command`);
        }

        let imageUrl = m.text?.trim();

        // Handle quoted image
        if (quoted?.image) {
            const buffer = await conn.downloadMediaMessage(quoted);
            const uploaded = await uploadImage(buffer);
            if (!uploaded) return reply('Failed to upload image');
            imageUrl = uploaded;
        }

        // Improved URL validation
        if (!isValidImageUrl(imageUrl)) {
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

// Better URL validation function
function isValidImageUrl(url) {
    try {
        new URL(url); // First validate it's a proper URL
        
        // Check for image extensions (case insensitive)
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(?:$|\?)/i;
        return imageExtensions.test(url);
    } catch {
        return false;
    }
}

// Improved upload function
async function uploadImage(buffer) {
    try {
        const form = new FormData();
        form.append('image', buffer.toString('base64'));
        
        // Using free image hosting service (replace with your own if needed)
        const { data } = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', form, {
            headers: form.getHeaders()
        });
        
        return data.data.url || data.data.display_url;
    } catch (e) {
        console.error('Upload failed:', e);
        return null;
    }
}
