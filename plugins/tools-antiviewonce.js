const { cmd } = require("../command");

cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive','👀','💀'],
  react: '😏',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) {
      return await client.sendMessage(from, {
        text: "*❌ Bro command for owner only.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*Baka🐦 !, reply to a view once message jeish !*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});


// 2viewonce
const { cmd } = require("../command");
const { isJidGroup } = require('@whiskeysockets/baileys');

cmd({
  pattern: "vv2",
  alias: ["viewonce2", 'retrieve','😷','🤭'],
  react: '😏',
  desc: "Owner Only - retrieve quoted message to bot's inbox",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) return; // Silent fail for non-owners
    
    if (!match.quoted) return; // Silent fail if no quoted message

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const botInbox = client.user.id; // Bot's own JID
    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Minimal context info
    const contextInfo = `🕒 ${currentTime}\n👤 ${message.sender.split('@')[0]}`;

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: contextInfo,
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: contextInfo,
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return; // Silent fail for unsupported types
    }

    // Directly forward to bot's inbox without confirmation
    await client.sendMessage(botInbox, messageContent);
    
  } catch (error) {
    console.error("vv Error:", error); // Silent error logging
  }
});
