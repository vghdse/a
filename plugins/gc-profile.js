 const { cmd } = require('../command');

cmd({
    pattern: "person",
    react: "👤",
    alias: ["userinfo", "profile"],
    desc: "Get instant user profile info",
    category: "utility",
    filename: __filename
}, async (m, conn) => {
    try {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. CONSTANT DECLARATIONS (All variables defined at top)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const FALLBACK_IMAGE = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        const DEFAULT_BIO = 'No bio available';
        const FOOTER = '> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ';

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2. TARGET USER RESOLUTION (REPLY > MENTION > SENDER)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const targetUser = m.quoted?.sender || m.mentioned[0] || m.sender;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. PARALLEL DATA FETCHING (FASTEST POSSIBLE)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const [userData, profilePic] = await Promise.all([
            conn.onWhatsApp(targetUser).then(res => res[0]),
            conn.profilePictureUrl(targetUser, 'image').catch(() => FALLBACK_IMAGE)
        ]);

        if (!userData?.exists) return m.reply("❌ User not found " + FOOTER);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4. NAME RESOLUTION (GROUP > CONTACT > NUMBER)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const contactName = await conn.getName(targetUser).catch(() => null);
        const groupName = m.isGroup 
            ? m.groupMetadata.participants.find(p => p.id === targetUser)?.notify 
            : null;
        const userName = groupName || contactName || targetUser.split('@')[0];

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 5. BIO/STATUS FETCH (WITH TIMEOUT SAFETY)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const bioFetch = await Promise.race([
            conn.fetchStatus(targetUser),
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        const userBio = bioFetch?.status || DEFAULT_BIO;
        const bioUpdateTime = bioFetch?.setAt 
            ? new Date(bioFetch.setAt * 1000).toLocaleString() 
            : null;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 6. GROUP ROLE DETECTION (IF IN GROUP)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const userRole = m.isGroup 
            ? m.groupMetadata.participants.find(p => p.id === targetUser)?.admin 
                ? "👑 Admin" 
                : "👥 Member"
            : null;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 7. COMPILE FINAL MESSAGE (WITH PERFECT FORMATTING)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        const finalMessage = `
*👤 USER PROFILE INFORMATION*

🆔 *Name:* ${userName}
📞 *Number:* ${targetUser.replace('@s.whatsapp.net', '')}
📌 *Account Type:* ${userData.isBusiness ? '💼 Business' : '👤 Personal'}

📝 *Bio/Status:*
${userBio}
${bioUpdateTime ? `🕒 *Updated:* ${bioUpdateTime}` : ''}

${userRole ? `👥 *Group Role:* ${userRole}` : ''}

🌐 *Chat Link:* https://wa.me/${targetUser.replace('@s.whatsapp.net', '')}

${FOOTER}
`.trim();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 8. SEND FINAL RESULT (WITH PROPER MENTIONS)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await conn.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: finalMessage,
            mentions: [targetUser]
        }, { quoted: m });

    } catch (error) {
        const errorMessage = `❌ Error: ${error.message}\n${FOOTER}`;
        m.reply(errorMessage);
    }
});
