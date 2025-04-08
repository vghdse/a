const axios = require('axios');
const { cmd } = require("../command");

cmd({
  pattern: "wastalk",
  alias: ["channelstalk", "wastatus"],
  react: '📢',
  desc: "Get WhatsApp channel information",
  category: "utility",
  use: ".wastalk <channel-invite-link>"
}, async (client, message, { reply, args }) => {
  try {
    // Get the full message text including the command
    const fullText = message.text || '';
    
    // Extract the link (works whether user replies or types normally)
    const urlMatch = fullText.match(/(https?:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+)/i);
    
    if (!urlMatch) {
      return reply("❌ Invalid format! Please send:\n.wastalk https://whatsapp.com/channel/...");
    }

    const channelUrl = urlMatch[0];
    const channelId = channelUrl.split('/').pop();
    
    if (!channelId || channelId.length < 5) {
      return reply("❌ Invalid channel ID detected in the URL");
    }

    // Using a more reliable API endpoint
    const apiUrl = `https://api.maher-zubair.tech/channel_info?id=${channelId}`;
    
    const response = await axios.get(apiUrl, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.data?.status === 200) {
      return reply("🔴 Channel not found or API error");
    }

    const channel = response.data.result || {};
    
    const infoMsg = `
📢 *${channel.title || 'Unknown Channel'}*

👥 Followers: ${channel.followers || 'N/A'}
🔗 Link: ${channel.link || channelUrl}

📝 Description:
${channel.description || 'No description available'}
`.trim();

    // Send image if available, otherwise just send info
    if (channel.image) {
      await client.sendMessage(message.chat, {
        image: { url: channel.image },
        caption: infoMsg
      }, { quoted: message });
    } else {
      await reply(infoMsg);
    }

  } catch (error) {
    console.error('Channel Stalk Error:', error);
    reply(`❌ Error: ${error.message || 'Failed to fetch channel info'}\n\nPlease try a different channel link.`);
  }
});
