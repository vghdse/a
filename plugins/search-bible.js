const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd(
    {
        pattern: 'bible',
        alias: ['verse', 'scripture'],
        desc: 'Fetch random Bible verses or search specific ones',
        category: 'utility',
        react: '📖',
        use: '[book chapter:verse] or [search term] (leave empty for random)',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            let apiUrl;
            if (!q) {
                // If no query, fetch a random verse
                apiUrl = 'https://kaiz-apis.gleeze.com/api/bible/random';
            } else {
                // If query provided, search for specific verse
                apiUrl = `https://kaiz-apis.gleeze.com/api/bible?q=${encodeURIComponent(q)}`;
            }

            const response = await axios.get(apiUrl);
            
            if (!response.data || !response.data.verse || !response.data.verse.length) {
                return reply('❌ *No results found* - Please try again.');
            }

            const verseData = response.data.verse[0];
            const reference = `${verseData.book_name} ${verseData.chapter}:${verseData.verse}`;

            // Format with beautiful emojis
            const message = `
✨ *Bible Verse* ✨

📜 *Reference:* ${reference}
🙏 *Text:* ${verseData.text.trim()}

${q ? '' : '🎲 *Random Verse Selected*'}
📖 *Full Reference:* ${response.data.reference || reference}
✍️ *Author:* Mr Frank

🕊️ May this verse bless your day! 🕊️
            `;

            await conn.sendMessage(mek.chat, { 
                text: message,
                contextInfo: {
                    externalAdReply: {
                        title: `Bible Verse: ${reference}`,
                        body: q ? 'Requested Verse' : 'Random Verse',
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
        const bibleImages = [
            'https://images.unsplash.com/photo-1589998059171-988d887df646',
            'https://images.unsplash.com/photo-1506459225024-1428097a7e18',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765'
        ];
        const randomImage = bibleImages[Math.floor(Math.random() * bibleImages.length)];
        const response = await axios.get(randomImage, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch {
        return null;
    }
}
