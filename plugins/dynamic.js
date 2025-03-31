const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Define the keywords that trigger the menu
const menuKeywords = ["menupro", "help", "commands"];

// Listen to all messages
cmd({
  on: "message",
  fromMe: false, // Set to true if you want only the bot owner to trigger it
}, async (conn, mek, m, { from, body, reply }) => {
  try {
    // Check if the message matches any of the keywords
    if (menuKeywords.includes(body.toLowerCase().trim())) {
      // Fetch the menu.json file from GitHub
      const menuUrl = "https://raw.githubusercontent.com/mrfrank-ofc/SUBZERO-MD-DATABASE/main/menu.json";
      const response = await fetch(menuUrl);

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Failed to fetch menu.json: ${response.statusText}`);
      }

      // Parse the JSON data
      const menuData = await response.json();

      // Prepare the menu message
      let menuMessage = `*${menuData.title}*\n\n${menuData.description}\n\n`;

      // Add sections to the menu
      menuData.sections.forEach(section => {
        menuMessage += `*${section.title}*\n`;
        menuMessage += section.commands.join("\n") + "\n\n";
      });

      // Add footer
      menuMessage += `*━━━━━━━━━━━━━━━━━━━━*\n> ＭＡＤＥ ＢＹ ＭＲ ＦＲＡＮＫ\n*━━━━━━━━━━━━━━━━━━━━━*`;

      // Send the menu as an image with caption
      await conn.sendMessage(
        from,
        {
          image: { url: menuData.image },
          caption: menuMessage,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363304325601080@newsletter',
              newsletterName: '❄️『 𝐒𝐔𝐁𝐙𝐄𝐑𝐎 𝐌𝐃 』❄️',
              serverMessageId: 143
            }
          }
        },
        { quoted: mek }
      );

      // Send the audio
      await conn.sendMessage(
        from,
        {
          audio: { url: menuData.audio },
          mimetype: "audio/mp4",
          ptt: true
        },
        { quoted: mek }
      );
    }
  } catch (error) {
    console.error("Error displaying menu:", error);
    reply("❌ Unable to display the menu. Please try again later.");
  }
});
