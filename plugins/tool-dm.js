const { cmd } = require('../command');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');
const Config = require('../config');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAia39sa6pruiJ0kVmOz7FhoLXdgYs226w",
  authDomain: "stmarys-db.firebaseapp.com",
  projectId: "stmarys-db",
  storageBucket: "stmarys-db.firebasestorage.app",
  messagingSenderId: "703545528908",
  appId: "1:703545528908:web:95428a13eaafb572551ae9"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

cmd(
    {
        pattern: 'dm',
        alias: ['messages', 'inbox'],
        desc: 'Fetch messages from Firebase',
        category: 'utility',
        react: '📩',
        filename: __filename,
    },
    async (conn, mek, m, { reply }) => {
        try {
            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Get messages from Firebase
            const messagesRef = collection(db, "messages");
            const q = query(messagesRef, orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return reply('📭 No messages found in the database');
            }

            // Format messages with emojis
            let formattedMessages = querySnapshot.docs.map((doc, index) => {
                const data = doc.data();
                return `
📌 *Message ${index + 1}*
👤 ${data.name || 'Anonymous'}
📧 ${data.email || 'No email'}
📱 ${data.phone || 'No phone'}
⏰ ${data.timestamp?.toDate().toLocaleString() || 'Unknown date'}
📝 ${data.message || 'No content'}
                `;
            }).join('\n━━━━━━━━━━━━━━\n');

            // Final message with header
            const finalOutput = `
📬 *MESSAGE INBOX* 📬
━━━━━━━━━━━━━━
${formattedMessages}
━━━━━━━━━━━━━━
✅ ${querySnapshot.size} messages loaded
            `;

            await reply(finalOutput);
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('Firebase error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('⚠️ Error fetching messages. Check console for details.');
        }
    }
);
