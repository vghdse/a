const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "person",
    react: "👤",
    alias: ["userinfo", "profile"],
    desc: "Get complete user profile information",
    category: "utility",
    use: '.person [@tag or reply]',
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
        // ─── Determine Target User ──────────────────
        let userJid = quoted?.sender || 
                     mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     sender;

        // ─── Verify User Exists ────────────────────
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp");

        // ─── Get Profile Picture ───────────────────
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        // ─── Get User Name ─────────────────────────
        let userName = userJid.split('@')[0];
        try {
            const contact = await conn.contactDB.get(userJid).catch(() => null);
            if (contact?.name) userName = contact.name;
            else if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }
        } catch (e) {
            console.log("Name fetch error:", e);
        }

        // ─── Get Bio/Status ───────────────────────
        let bio = "No bio available";
        try {
            const status = await conn.fetchStatus(userJid).catch(() => null);
            if (status?.status) bio = `📌 Status: ${status.status}\n🕒 Last Updated: ${new Date(status.setAt * 1000).toLocaleString()}`;
        } catch (e) {
            console.log("Bio fetch error:", e);
        }

        // ─── Get Group Role ───────────────────────
        let groupRole = "";
        if (isGroup) {
            const participant = participants.find(p => p.id === userJid);
            groupRole = participant?.admin ? "👑 Admin" : "👥 Member";
        }

        // ─── Format Output ────────────────────────
        const userInfo = `
*👤 USER PROFILE INFORMATION*

🆔 *Username:* ${userName}
📞 *Number:* ${userJid.replace(/@.+/, '')}
📌 *Account Type:* ${user.isBusiness ? "💼 Business" : "👤 Personal"}

📝 *Bio/Status:*
${bio}

⚙️ *Account Details:*
✅ *Registered:* Yes
🛡️ *Verified:* ${user.verifiedName ? "✅ Yes" : "❌ No"}
${isGroup ? `👥 *Group Role:* ${groupRole}` : ''}

🌐 *WhatsApp Link:*
https://wa.me/${userJid.replace('@s.whatsapp.net', '')}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ
`.trim();

        // ─── Send Result ──────────────────────────
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: userInfo,
            mentions: [userJid]
        }, { quoted: mek });

    } catch (e) {
        console.error("Person command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile"}\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`);
    }
});
