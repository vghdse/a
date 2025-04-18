const { cmd } = require('../command');

cmd({
    pattern: "groupstats",
    alias: ["gstats"],
    desc: "Advanced group analytics",
    category: "group",
    react: "📊", 
    filename: __filename
}, async (conn, mek, m, { groupMetadata, reply }) => {
    if (!m.isGroup) return reply("❌ Group only command");

    // 1. Member Activity Analysis
    const activeThreshold = Date.now() - 7 * 86400 * 1000; // 7 days
    const members = await Promise.all(
        groupMetadata.participants.map(async p => {
            const msgs = await conn.loadMessages(m.chat, { 
                limit: 100,
                fromMe: false,
                userId: p.id 
            });
            return {
                id: p.id,
                name: p.notify || p.id.split('@')[0],
                admin: p.isAdmin,
                messageCount: msgs.length,
                lastActive: msgs[0]?.messageTimestamp || 0
            };
        })
    );

    // 2. Generate Stats
    const stats = {
        total: members.length,
        admins: members.filter(m => m.admin).length,
        active: members.filter(m => m.lastActive > activeThreshold).length,
        topPoster: members.sort((a,b) => b.messageCount - a.messageCount)[0],
        ghost: members.filter(m => m.messageCount === 0).length
    };

    // 3. Format Output
    const analysis = [
        `👥 *Total Members:* ${stats.total}`,
        `👑 *Admins:* ${stats.admins}`,
        `💬 *Active (7d):* ${stats.active}`,
        `👻 *Inactive:* ${stats.ghost}`,
        `🏆 *Top Poster:* @${stats.topPoster.name} (${stats.topPoster.messageCount} msgs)`,
        `📅 *Last Activity Range:* ${
            new Date(Math.min(...members.map(m => m.lastActive * 1000)).toLocaleDateString()
        } to ${
            new Date(Math.max(...members.map(m => m.lastActive * 1000)).toLocaleDateString()
        }`
    ];

    reply(`📊 *Group Analysis*\n\n${analysis.join('\n')}`);
});
