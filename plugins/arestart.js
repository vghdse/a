// ===== CORE DEPENDENCIES =====
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const config = require('../config');

//const { cmd } = require('../command');

cmd({
    pattern: "active",
    desc: "List members by last interaction time",
    category: "group",
    react: "🕒",
    filename: __filename
}, async (conn, mek, m, { groupMetadata, reply }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    // Get members with last message timestamps
    const members = await Promise.all(
        groupMetadata.participants.map(async p => {
            const msgs = await conn.loadMessages(m.chat, { limit: 1, fromMe: false, userId: p.id });
            return {
                id: p.id,
                admin: p.isAdmin,
                lastActive: msgs[0]?.messageTimestamp || 0
            };
        })
    );

    // Sort by last activity
    const sorted = members.sort((a,b) => b.lastActive - a.lastActive);
    
    // Format output
    const list = sorted.map((p,i) => 
        `${i+1}. @${p.id.split('@')[0]}${p.admin ? ' 👑' : ''} - ${p.lastActive ? 
        new Date(p.lastActive * 1000).toLocaleString() : 'Never'}`);
    
    reply(`🕒 *Last Active Members*\n\n${list.join('\n')}`);
});

cmd({
    pattern: "online",
    desc: "Detect currently online users",
    category: "utility",
    react: "🟢",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    await reply("🕵️ Scanning online status for 60 seconds...");
    
    const onlineUsers = new Map(); // Store with last seen timestamp
    
    const presenceHandler = ({ id, status }) => {
        if (id !== conn.user.id) {
            onlineUsers.set(id, { 
                status,
                lastUpdated: Date.now() 
            });
        }
    };
    
    // Start listening
    conn.ev.on('presence-update', presenceHandler);
    
    // Scan for 60 seconds
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Stop listening
    conn.ev.off('presence-update', presenceHandler);
    
    // Filter users seen online in last 2 minutes
    const recentlyOnline = Array.from(onlineUsers.entries())
        .filter(([_, data]) => 
            data.status === 'online' || 
            (data.status === 'available' && Date.now() - data.lastUpdated < 120000)
        );
    
    // Get contact details
    const results = await Promise.all(
        recentlyOnline.map(async ([id]) => {
            try {
                const contact = await conn.getContactById(id);
                return `• ${contact?.notify || id.split('@')[0]}`;
            } catch {
                return `• ${id.split('@')[0]}`;
            }
        })
    );
    
    reply(`🟢 *Recently Online* (${results.length})\n\n${results.join('\n') || "None"}\n\nScan duration: 60s`);
});
