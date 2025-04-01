const { cmd } = require("../command");

cmd({
  pattern: "vv3",
  alias: ["viewonce3", 'retrieve','👀','💀'],
  react: '😏',
  desc: "Owner Only - retrieve quoted message to bot's inbox",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) {
      return await client.sendMessage(from, {
        text: "*❌ Command for owner only.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*Reply to a view once message!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net'; // Get bot's JID
    
    // Create a caption with context info
    const contextInfo = `*Forwarded from:* ${message.pushName || 'Unknown'} (${message.sender.split('@')[0]})\n` +
                       `*Original chat:* ${message.isGroup ? message.groupMetadata.subject : 'Private Chat'}\n` +
                       `*Time:* ${new Date().toLocaleString()}`;

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: (match.quoted.text || '') + '\n\n' + contextInfo,
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: (match.quoted.text || '') + '\n\n' + contextInfo,
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false,
          contextInfo: {
            mentionedJid: [message.sender],
            forwardingScore: 999,
            isForwarded: true
          }
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    // Forward to bot's inbox instead of current chat
    await client.sendMessage(botNumber, messageContent);
    
    // Notify user in original chat
    await client.sendMessage(from, {
      text: "✅ View-once media has been forwarded to my inbox"
    }, { quoted: message });
    
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error retrieving view-once message:\n" + error.message
    }, { quoted: message });
  }
});
