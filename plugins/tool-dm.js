const { cmd } = require('../command');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');
const Config = require('../config');

// Initialize Firebase with error handling
let db;
try {
    const firebaseConfig = {
        apiKey: "AIzaSyAia39sa6pruiJ0kVmOz7FhoLXdgYs226w",
        authDomain: "stmarys-db.firebaseapp.com",
        projectId: "stmarys-db",
        storageBucket: "stmarys-db.firebasestorage.app",
        messagingSenderId: "703545528908",
        appId: "1:703545528908:web:95428a13eaafb572551ae9"
    };
    
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
} catch (firebaseError) {
    console.error('🔥 Firebase initialization error:', firebaseError);
}

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
            // Check if Firebase initialized properly
            if (!db) {
                return reply('🚨 Firebase connection failed. Please check server logs.');
            }

            // Send processing reaction
            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Get messages from Firebase with timeout
            let querySnapshot;
            try {
                const messagesRef = collection(db, "messages");
                const q = query(messagesRef, orderBy("timestamp", "desc"));
                querySnapshot = await Promise.race([
                    getDocs(q),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Firebase timeout')), 10000)
                    )
                ]);
            } catch (dbError) {
                console.error('📦 Database error:', dbError);
                return reply('⏱️ Database request timed out or failed');
            }
            
            if (querySnapshot.empty) {
                return reply('📭 No messages found in the database');
            }

            // Format messages safely
            let formattedMessages;
            try {
                formattedMessages = querySnapshot.docs.map((doc, index) => {
                    const data = doc.data();
                    const timestamp = data.timestamp ? 
                        new Date(data.timestamp.seconds * 1000).toLocaleString() : 
                        'Unknown date';
                    
                    return `
📌 *Message ${index + 1}*
👤 ${data.name || 'Anonymous'}
📧 ${data.email || 'No email'}
📱 ${data.phone || data.whatsapp || 'No contact'}
⏰ ${timestamp}
📝 ${data.message || data.content || 'No message text'}
                    `.trim();
                }).join('\n━━━━━━━━━━━━━━\n');
            } catch (formatError) {
                console.error('💅 Formatting error:', formatError);
                return reply('🔄 Error formatting messages');
            }

            // Final output
            const finalOutput = `
📬 *MESSAGE INBOX* 📬
━━━━━━━━━━━━━━
${formattedMessages}
━━━━━━━━━━━━━━
✅ Loaded ${querySnapshot.size} messages
            `.trim();

            await reply(finalOutput);
            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('💥 Command error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('⚠️ An unexpected error occurred');
        }
    }
);
