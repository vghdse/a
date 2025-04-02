const { cmd } = require('../command')

cmd({
  pattern: "delete",
  alias: ["del", "mistake"],
  react: "❌",
  desc: "Delete messages (Admin only)",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { reply, isGroup, isAdmins, isOwner }) => {
  try {
    // Permission checks
    if (!isOwner) {
      if (isGroup && !isAdmins) return reply("❌ Admin privileges required!");
      if (!isGroup) return reply("❌ Owner privileges required!");
    }

    if (!m.quoted) return reply("❌ Reply to a message to delete it!");

    // Delete the quoted message
    await conn.sendMessage(m.chat, { 
      delete: {
        remoteJid: m.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    });

    // Delete the command message itself
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: true,
        id: m.id
      }
    });

  } catch (e) {
    console.error('Delete error:', e);
    reply("❌ Failed to delete message!");
  }
})
