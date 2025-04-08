const axios = require('axios');
const { cmd } = require("../command");

cmd({
  pattern: "wastalk",
  alias: ["channelstalk", "wachannel"],
  react: '📢',
  desc: "Get WhatsApp channel information",
  category: "utility",
  use: ".wastalk <channel-invite-link>"
}, async (client, message, { reply, args }) => {
  try {
    const input = args[0];
    if (!input) return reply("Please provide a WhatsApp channel invite link\nExample: .wastalk https://whatsapp.com/channel/0029VaGvk6XId7nHNGfiRs0m");

    // Extract channel ID from various URL formats
    const channelId = input.match(/(?:whatsapp\.com\/channel\/)([A-Za-z0-9]+)/)?.[1];
    if (!channelId) return reply("Invalid WhatsApp channel link format");

    const apiUrl = `https://api.maher-zubair.tech/channel_info?id=${channelId}`;
    const response = await axios.get(apiUrl);

    if (response.data.status !== 200) {
      return reply(`Error: ${response.data.message || "Failed to fetch channel info"}`);
    }

    const channel = response.data.result;
    const infoMsg = `
📢 *${channel.title}* 📢

👥 *Followers:* ${channel.followers}
🔗 *Link:* ${channel.link}

📝 *Description:*
${channel.description}

📸 *Channel Preview:*
`;

    // Send channel image with caption
    await client.sendMessage(message.chat, {
      image: { url: channel.image },
      caption: infoMsg
    }, { quoted: message });

  } catch (error) {
    console.error('WhatsApp Channel Stalk Error:', error);
    reply(`❌ Error: ${error.message || "Failed to fetch channel information"}`);
  }
});
