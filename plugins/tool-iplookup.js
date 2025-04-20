const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "ipstalk",
  alias: ["iplookup", "ipinfo"],
  react: "🕵️",
  desc: "Get detailed information about an IP address",
  category: "utility",
  use: '<IP address>',
  filename: __filename
}, async (m, { reply, args }) => {
  try {
    if (!args[0]) return reply("Please provide an IP address\nExample: .ipstalk 114.142.169.38");

    const ip = args[0];
    const apiKey = "e0a6483c508018877ac67326"; // Your LolHuman API key
    const apiUrl = `https://lolhuman.xyz/api/ipaddress/${ip}?apikey=${apiKey}`;

    await reply(`🔍 Tracking IP: ${ip}...`);

    const { data } = await axios.get(apiUrl, { timeout: 10000 });

    if (data.status !== 200 || !data.result) {
      return reply("❌ Invalid response from API");
    }

    const info = data.result;
    const location = `${info.city}, ${info.regionName}, ${info.country}`;
    const coordinates = `Latitude: ${info.lat}\nLongitude: ${info.lon}`;
    const network = `ISP: ${info.isp}\nAS: ${info.as}`;

    // Create Google Maps link
    const mapsUrl = `https://www.google.com/maps?q=${info.lat},${info.lon}`;

    const resultMessage = `
🕵️ *IP TRACKER RESULTS*

🔢 *IP Address:* ${info.query}
📍 *Location:* ${location}
🗺️ *Coordinates:* 
${coordinates}
⏰ *Timezone:* ${info.timezone}
📶 *Network Info:*
${network}

📌 *Google Maps:* ${mapsUrl}
`;

    await reply(resultMessage);

    // Optional: Send location thumbnail
    try {
      const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${info.lat},${info.lon}&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7C${info.lat},${info.lon}`;
      await m.reply({ image: { url: staticMapUrl }, caption: "Approximate location" });
    } catch (e) {
      console.log("Failed to send map image");
    }

  } catch (error) {
    console.error("IP Stalk error:", error);
    reply(`❌ Error: ${error.response?.data?.message || error.message}`);
  }
});
