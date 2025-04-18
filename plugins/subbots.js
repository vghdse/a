const { cmd } = require('../command');
const { generateWALinkMessage } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "subbot",
    alias: ["createsubbot"],
    desc: "Generate WhatsApp pairing code for subbot",
    category: "owner",
    react: "🤖",
    filename: __filename,
    use: "<phone_with_country_code>"
}, async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("*📛 Owner only command!*");

    // Validate phone number
    const phoneNumber = args[0]?.replace(/[^0-9]/g, '');
    if (!phoneNumber || phoneNumber.length < 10) {
        return reply("❌ Please provide valid phone number with country code\n*Example:* .subbot 919876543210");
    }

    try {
        // Generate pairing code
        const pairingCode = await conn.requestPairingCode(phoneNumber);
        const formattedCode = pairingCode.match(/.{1,4}/g)?.join('-') || pairingCode;

        // Create session folder
        const sessionId = crypto.randomBytes(3).toString('hex');
        const sessionDir = path.join(__dirname, '../subbots', sessionId);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        // Save session info
        fs.writeFileSync(
            path.join(sessionDir, 'pairing.json'),
            JSON.stringify({
                phone: phoneNumber,
                code: formattedCode,
                timestamp: Date.now(),
                requestedBy: m.sender
            }, null, 2)
        );

        // Send instructions
        await reply(
            `🔗 *Subzero  MD Subbot Pairing*\n\n` +
            `• Phone: *${phoneNumber}*\n` +
            `• Pair Code: *${formattedCode}*\n\n` +
            `_How to link:_\n` +
            `1. Open WhatsApp on your *${phoneNumber}* device\n` +
            `2. Go to *Settings → Linked Devices → Link Device*\n` +
            `3. Enter this code:\n\n` +
            `*${formattedCode}*\n\n` +
            `⚠️ Code expires in 20 minutes`
        );

        // Send direct link as fallback
        const linkMsg = generateWALinkMessage(phoneNumber, `Prince MD Pairing Code: ${formattedCode}`);
        await conn.relayMessage(m.chat, linkMsg.message, { messageId: linkMsg.key.id });

    } catch (error) {
        console.error('Subbot error:', error);
        reply("❌ Failed to generate pairing code. WhatsApp may be rate limiting.");
    }
});
