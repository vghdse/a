const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

// Bio Command
cmd({
    pattern: "getbio",
    react: "📝",
    alias: ["bio"],
    desc: "Get user's bio/status",
    category: "utility",
    use: '.getbio [@tag/reply/number]',
    filename: __filename
},
async (Void, citel, text, { isGroup, participants }) => {
    try {
        // Determine target user
        let userJid;
        if (citel.quoted) {
            userJid = citel.quoted.sender;
        } else if (text.includes('@')) {
            userJid = text.split('@')[0] + '@s.whatsapp.net';
        } else if (text.match(/\d+/g)) {
            userJid = text.match(/\d+/g)[0] + '@s.whatsapp.net';
        } else {
            userJid = citel.sender;
        }

        // Verify user exists
        const [user] = await Void.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return citel.reply("❌ User not found on WhatsApp");

        // Get bio/status
        try {
            // Try personal status first
            const statusData = await Void.fetchStatus(userJid);
            if (statusData?.status) {
                const formattedTime = statusData.setAt ? new Date(statusData.setAt * 1000).toLocaleString() : 'Unknown';
                return citel.reply(`📝 *Bio/Status for ${userJid.split('@')[0]}*\n\n` +
                                `${statusData.status}\n\n` +
                                `⏰ Last Updated: ${formattedTime}`);
            }

            // Try business profile
            const businessProfile = await Void.getBusinessProfile(userJid);
            if (businessProfile?.description) {
                return citel.reply(`🏢 *Business Bio for ${userJid.split('@')[0]}*\n\n` +
                                `${businessProfile.description}\n\n` +
                                `📞 Contact: ${businessProfile.email || 'Not provided'}`);
            }

            citel.reply("ℹ️ This user doesn't have a bio or status set.");
        } catch (error) {
            console.error("Bio fetch error:", error);
            citel.reply("❌ Failed to fetch bio. The account may be private or have no bio set.");
        }
    } catch (e) {
        console.error("Getbio command error:", e);
        citel.reply(`❌ Error: ${e.message || "Failed to process request"}`);
    }
});

// Profile Picture Command
cmd({
    pattern: "getpp",
    react: "🖼️",
    alias: ["profilepic", "getpic"],
    desc: "Get user's profile picture",
    category: "utility",
    use: '.getpp [@tag/reply/number]',
    filename: __filename
},
async (Void, citel, text) => {
    try {
        // Determine target user
        let userJid;
        if (citel.quoted) {
            userJid = citel.quoted.sender;
        } else if (text.includes('@')) {
            userJid = text.split('@')[0] + '@s.whatsapp.net';
        } else if (text.match(/\d+/g)) {
            userJid = text.match(/\d+/g)[0] + '@s.whatsapp.net';
        } else {
            userJid = citel.sender;
        }

        // Verify user exists
        const [user] = await Void.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return citel.reply("❌ User not found on WhatsApp");

        // Get profile picture
        try {
            const ppUrl = await Void.profilePictureUrl(userJid, 'image');
            await Void.sendMessage(citel.chat, {
                image: { url: ppUrl },
                caption: `🖼️ Profile picture for ${userJid.split('@')[0]}`,
                mentions: [userJid]
            }, { quoted: citel });
        } catch (error) {
            console.error("PP fetch error:", error);
            // Send default avatar if no profile picture
            const defaultAvatar = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            await Void.sendMessage(citel.chat, {
                image: { url: defaultAvatar },
                caption: `ℹ️ ${userJid.split('@')[0]} doesn't have a profile picture set`,
                mentions: [userJid]
            }, { quoted: citel });
        }
    } catch (e) {
        console.error("Getpp command error:", e);
        citel.reply(`❌ Error: ${e.message || "Failed to fetch profile picture"}`);
    }
});
