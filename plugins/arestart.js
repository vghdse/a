// ===== CORE DEPENDENCIES =====
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const config = require('../config');

// ===== UTILITY FUNCTIONS =====
function formatTime(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// ===== ACTIVE GROUP MEMBERS PLUGIN =====
cmd({
    pattern: "active",
    alias: ["activelist"],
    desc: "List all active group members",
    category: "group",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { groupMetadata, reply }) => {
    if (!m.isGroup) return reply("❌ Group command only");
    
    const activeMembers = groupMetadata.participants
        .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
        .map((p, i) => `${i+1}. @${p.id.split('@')[0]} ${p.isAdmin ? '👑' : ''} (Last: ${formatTime(p.lastSeen)})`);

    await reply(`🔄 *Active Members* (${activeMembers.length})\n\n${activeMembers.join('\n')}`);
});

// ===== ONLINE CONTACTS TRACKER PLUGIN =====
cmd({
    pattern: "online",
    alias: ["whosonline"],
    desc: "Check who's online in your contacts",
    category: "utility",
    react: "🟢",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    await reply("🔍 Scanning online contacts (30 seconds)...");
    
    const onlineUsers = new Set();
    const startTime = Date.now();
    
    const statusHandler = (update) => {
        if (update.status === "online" && update.id !== conn.user.id) {
            onlineUsers.add(update.id);
        }
    };
    
    conn.ev.on('presence.update', statusHandler);
    
    await new Promise(resolve => setTimeout(resolve, 30000));
    conn.ev.off('presence.update', statusHandler);
    
    const results = [];
    for (const id of onlineUsers) {
        try {
            const contact = await conn.getContactById(id);
            results.push(`• ${contact?.notify || id.split('@')[0]}`);
        } catch (e) {
            results.push(`• ${id.split('@')[0]}`);
        }
    }
    
    await reply(`🟢 *Online Contacts* (${results.length})\n\n${results.join('\n') || "None detected"}\n\n⏳ Scanned for 30 seconds`);
});

// ===== EXPORTS =====
module.exports = {
    formatTime
};
