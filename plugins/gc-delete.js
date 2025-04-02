const { cmd } = require('../command')

cmd({
  pattern: "delete",
  alias: ["del", "d"],
  react: "🗑️",
  desc: "Delete messages (Admin only)",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { reply, isGroup, isAdmins, isOwner }) => {
  try {
    // Only allow in groups
    if (!isGroup) return reply("❌ This command only works in groups!");
    
    // Only admins/owner can use
    if (!isAdmins && !isOwner) return reply("❌ You need admin rights to delete messages!");
    
    if (!m.quoted) return reply("❌ Reply to a message to delete it!");

    // Delete the quoted message (works for any participant's messages)
    await conn.sendMessage(m.chat, { 
      delete: {
        remoteJid: m.chat,
        fromMe: false, // Important: Set to false to delete others' messages
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
    reply("❌ Failed to delete the message! I may need admin rights.");
  }
})
