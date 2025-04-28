// test-plugin.js
const { cmd } = require('../command');
const Config = require('../config');

cmd({
    pattern: "testplugin",
    alias: ["testp"],
    desc: "Test plugin functionality",
    category: "test",
    react: "🧪",
    filename: __filename,
    use: ""
}, async (conn, mek, m, { reply }) => {
    try {
        await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });
        
        const testMessage = `🧪 *Test Plugin Working!*\n\n` +
                           `⚡ Bot Name: ${Config.BOT_NAME}\n` +
                           `🆔 Command: testplugin\n` +
                           `📂 File: ${__filename}\n\n` +
                           `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`;
        
        await conn.sendMessage(mek.chat, { 
            text: testMessage,
            contextInfo: {
                externalAdReply: {
                    title: "Test Plugin",
                    body: "Successful Installation",
                    thumbnail: await getTestImage(),
                    mediaType: 1,
                    mediaUrl: "https://github.com",
                    sourceUrl: "https://github.com"
                }
            }
        }, { quoted: mek });
        
        await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });
    } catch (error) {
        console.error('Test plugin error:', error);
        await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        reply('🧪 *Test Failed* - ' + error.message);
    }
});

async function getTestImage() {
    try {
        const response = await axios.get('https://i.imgur.com/3JGVB7X.jpg', { 
            responseType: 'arraybuffer' 
        });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null;
    }
}
