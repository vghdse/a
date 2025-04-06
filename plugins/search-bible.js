/*

$$$$$$\            $$\                                               
$$  __$$\           $$ |                                              
$$ /  \__|$$\   $$\ $$$$$$$\  $$$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$\  
\$$$$$$\  $$ |  $$ |$$  __$$\ \____$$  |$$  __$$\ $$  __$$\ $$  __$$\ 
 \____$$\ $$ |  $$ |$$ |  $$ |  $$$$ _/ $$$$$$$$ |$$ |  \__|$$ /  $$ |
$$\   $$ |$$ |  $$ |$$ |  $$ | $$  _/   $$   ____|$$ |      $$ |  $$ |
\$$$$$$  |\$$$$$$  |$$$$$$$  |$$$$$$$$\ \$$$$$$$\ $$ |      \$$$$$$  |
 \______/  \______/ \_______/ \________| \_______|\__|       \______/

Project Name : SubZero MD
Creator      : Darrell Mucheri ( Mr Frank OFC )
Repo         : https//github.com/mrfrank-ofc/SUBZERO-MD
Support      : wa.me/18062212660
*/





































































































































































































const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd(
    {
        pattern: 'bible',
        alias: ['verse', 'scripture'],
        desc: 'Fetch Bible verses with beautiful formatting',
        category: 'utility',
        react: '📖',
        use: '<book> <chapter>:<verse> or <search term>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply(`📖 *Please specify a Bible reference*\nExample: .bible John 3:16\nOr: .bible love`);

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Call Kaizenji Bible API
            const apiUrl = `https://kaiz-apis.gleeze.com/api/bible?q=${encodeURIComponent(q)}`;
            const response = await axios.get(apiUrl);
            
            if (!response.data || !response.data.verse || !response.data.verse.length) {
                return reply('❌ *No results found* - Please check your reference and try again.');
            }

            const verseData = response.data.verse[0];
            const reference = `${verseData.book_name} ${verseData.chapter}:${verseData.verse}`;

            // Format with beautiful emojis
            const message = `
✨ *Bible Verse* ✨

📜 *Reference:* ${reference}
🙏 *Text:* ${verseData.text.trim()}

📖 *Full Reference:* ${response.data.reference}
✍️ *Author:* ${response.data.author}

🕊️ May this verse bless your day! 🕊️
            `;

            await conn.sendMessage(mek.chat, { 
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: `Bible Verse: ${reference}`,
                        body: 'Fetched via Kaizenji API',
                        mediaType: 1,
                        thumbnail: await getBibleImage(),
                        sourceUrl: 'https://www.bible.com'
                    }
                }
            }, { quoted: mek });

            // Send success reaction
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Error in bible command:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('⛔ *Error fetching verse* - Please try again later.');
        }
    }
);

// Helper function to get a Bible-related image
async function getBibleImage() {
    try {
        // You can replace this with any Bible-related image URL
        const imageUrl = 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null;
    }
}

// BIBLE SEARCH
// Command: bible
cmd({
    pattern: "biblesearch",
    desc: "Fetch Bible verses by reference.",
    category: "fun",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { args, reply }) => {
    try {
        // Vérifiez si une référence est fournie
        if (args.length === 0) {
            return reply(`⚠️ *Please provide a Bible reference.*\n\n📝 *Example:*\n.bible John 1:1`);
        }

        // Joindre les arguments pour former la référence
        const reference = args.join(" ");

        // Appeler l'API avec la référence
        const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
        const response = await axios.get(apiUrl);

        // Vérifiez si la réponse contient des données
        if (response.status === 200 && response.data.text) {
            const { reference: ref, text, translation_name } = response.data;

            // Envoyez la réponse formatée avec des emojis
            reply(
                `📜 *Bible Verse Found!*\n\n` +
                `📖 *Reference:* ${ref}\n` +
                `📚 *Text:* ${text}\n\n` +
                `🗂️ *Translation:* ${translation_name}\n\n © SUBZERO BIBLE`
            );
        } else {
            reply("❌ *Verse not found.* Please check the reference and try again.");
        }
    } catch (error) {
        console.error(error);
        reply("⚠️ *An error occurred while fetching the Bible verse.* Please try again.");
    }
});
