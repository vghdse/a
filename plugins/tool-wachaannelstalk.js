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
    // Proper args handling
    if (!args || args.length === 0) {
      return reply("Please provide a WhatsApp channel invite link\nExample: .wastalk https://whatsapp.com/channel/0029VaGvk6XId7nHNGfiRs0m");
    }

    const input = args[0].trim();
    if (!input) return reply("Please provide a valid WhatsApp channel link");

    // Extract channel ID from various URL formats
    const channelMatch = input.match(/(?:whatsapp\.com\/channel\/)([A-Za-z0-9_-]+)/i);
    if (!channelMatch || !channelMatch[1]) {
      return reply("Invalid WhatsApp channel link format\nPlease provide a full link like: https://whatsapp.com/channel/0029VaGvk6XId7nHNGfiRs0m");
    }

    const channelId = channelMatch[1];
    const apiUrl = `https://api.maher-zubair.tech/channel_info?id=${channelId}`;
    
    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    if (!response.data || response.data.status !== 200 || !response.data.result) {
      return reply("Failed to fetch channel information. The channel may not exist or the API is down.");
    }

    const channel = response.data.result;
    const infoMsg = `
📢 *${channel.title || 'No Title'}* 📢

👥 *Followers:* ${channel.followers || 'Not Available'}
🔗 *Link:* ${channel.link || 'Not Available'}

📝 *Description:*
${channel.description || 'No description available'}

📸 *Channel Preview:*
`.trim();

    // Send channel image with caption if available
    if (channel.image) {
      await client.sendMessage(message.chat, {
        image: { url: channel.image },
        caption: infoMsg
      }, { quoted: message });
    } else {
      await reply(infoMsg);
    }

  } catch (error) {
    console.error('WhatsApp Channel Stalk Error:', error);
    let errorMsg = "An error occurred while fetching channel information";
    
    if (error.response) {
      errorMsg += `\nAPI Error: ${error.response.status} - ${error.response.data?.message || 'No details'}`;
    } else if (error.request) {
      errorMsg += "\nThe request was made but no response was received";
    } else {
      errorMsg += `\n${error.message}`;
    }
    
    reply(errorMsg);
  }
});
