const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getbio2",
    react: "📝",
    alias: ["bio"],
    desc: "Get user's bio/status",
    category: "utility",
    use: '.getbio [@tag/reply/number]',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, quoted }) => {
    try {
        // Determine target user
        const userJid = quoted?.sender || 
                       mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       (m.args[0]?.includes('@') ? m.args[0] : `${m.args[0]}@s.whatsapp.net`) || 
                       sender;

        // Verify user exists
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // Get bio/status
        let bioData;
        try {
            // Try personal status first
            bioData = await conn.fetchStatus(userJid);
            if (bioData?.status) {
                const formattedTime = bioData.setAt ? new Date(bioData.setAt * 1000).toLocaleString() : 'Unknown';
                return reply(`📝 *Bio/Status for ${userJid.split('@')[0]}*\n\n` +
                           `${bioData.status}\n\n` +
                           `⏰ Last Updated: ${formattedTime}`);
            }

            // Try business profile if personal status not found
            const businessProfile = await conn.getBusinessProfile(userJid);
            if (businessProfile?.description) {
                return reply(`🏢 *Business Bio for ${userJid.split('@')[0]}*\n\n` +
                           `${businessProfile.description}\n\n` +
                           `📞 Contact: ${businessProfile.email || 'Not provided'}`);
            }

            reply("ℹ️ This user doesn't have a bio or status set.");
        } catch (error) {
            console.error("Bio fetch error:", error);
            reply("❌ Failed to fetch bio. The account may be private or have no bio set.");
        }
    } catch (e) {
        console.error("Getbio command error:", e);
        reply(`❌ Error: ${e.message || "Failed to process request"}`);
    }
});

cmd({
    pattern: "getpp2",
    react: "🖼️",
    alias: ["profilepic", "getpic"],
    desc: "Get user's profile picture",
    category: "utility",
    use: '.getpp [@tag/reply/number]',
    filename: __filename
},
async (conn, mek, m, { from, sender, reply, quoted }) => {
    try {
        // Determine target user
        const userJid = quoted?.sender || 
                       mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       (m.args[0]?.includes('@') ? m.args[0] : `${m.args[0]}@s.whatsapp.net`) || 
                       sender;

        // Verify user exists
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // Get profile picture
        try {
            const ppUrl = await conn.profilePictureUrl(userJid, 'image');
            await conn.sendMessage(from, {
                image: { url: ppUrl },
                caption: `🖼️ Profile picture for ${userJid.split('@')[0]}`,
                mentions: [userJid]
            }, { quoted: mek });
        } catch (error) {
            console.error("PP fetch error:", error);
            // Send default avatar if no profile picture
            const defaultAvatar = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            await conn.sendMessage(from, {
                image: { url: defaultAvatar },
                caption: `ℹ️ ${userJid.split('@')[0]} doesn't have a profile picture set`,
                mentions: [userJid]
            }, { quoted: mek });
        }
    } catch (e) {
        console.error("Getpp command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile picture"}`);
    }
});
