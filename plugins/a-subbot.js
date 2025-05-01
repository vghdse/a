const { cmd } = require('../command');
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const NodeCache = require('node-cache');

// Global to store active subbots
if (!global.subBots) global.subBots = [];

cmd({
    pattern: 'subbot',
    react: '🧲',
    alias: ['serbot', 'jadibot'],
    desc: 'Create a sub bot instance using phone verification',
    category: 'bot',
    filename: __filename,
}, async (m, conn, args) => {
    try {
        if (!m.isOwner) return m.reply('❌ This command is only for bot owners');

        // Create unique auth folder
        const authFolder = `subbot_${crypto.randomBytes(4).toString('hex')}`;
        const authPath = path.join(__dirname, '..', 'auth', authFolder);
        
        if (!fs.existsSync(authPath)) {
            fs.mkdirSync(authPath, { recursive: true });
        }

        // Initialize auth state
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const msgRetryCounterCache = new NodeCache();
        const { version } = await fetchLatestBaileysVersion();

        // Connection options - explicitly disable QR codes
        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false, // Disable QR codes
            mobile: true, // Force mobile mode
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino()),
            },
            markOnlineOnConnect: true,
            msgRetryCounterCache,
            version
        };

        // Create socket
        const subConn = makeWASocket(connectionOptions);

        // Handle connection updates
        subConn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
                
                if (code === DisconnectReason.loggedOut) {
                    m.reply('🔴 SubBot logged out. Please create a new instance.');
                } else {
                    m.reply('🔄 SubBot disconnected. Reconnecting...');
                    setTimeout(() => initializeSubBot(authPath), 5000);
                }
                
                // Remove from active bots
                global.subBots = global.subBots.filter(bot => bot !== subConn);
            }

            if (connection === 'open') {
                m.reply('✅ SubBot connected successfully!');
                
                // Send credentials back to owner
                try {
                    const creds = JSON.parse(fs.readFileSync(path.join(authPath, 'creds.json'), 'utf8'));
                    await m.reply(`🔑 SubBot credentials saved:\n\`\`\`${JSON.stringify(creds, null, 2)}\`\`\``);
                } catch (err) {
                    console.error('Failed to read credentials:', err);
                }
            }
        });

        // Save credentials when updated
        subConn.ev.on('creds.update', saveCreds);

        // Request pairing code for phone number
        if (!subConn.authState.creds.registered) {
            const phoneNumber = m.sender.split('@')[0];
            const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');

            try {
                const code = await subConn.requestPairingCode(cleanedNumber);
                const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
                
                await m.reply(`📱 Pairing code for ${cleanedNumber}:\n\n*${formattedCode}*\n\n` +
                    'How to link this device:\n' +
                    '1. Open WhatsApp on your phone\n' +
                    '2. Go to Settings > Linked Devices\n' +
                    '3. Tap "Link a Device"\n' +
                    '4. Select "Link with phone number"\n' +
                    '5. Enter this code when prompted\n\n' +
                    '⚠️ Code expires in 2 minutes');
            } catch (error) {
                console.error('Pairing code error:', error);
                await m.reply('❌ Failed to generate pairing code. Error: ' + error.message);
                
                // Clean up failed connection
                try {
                    subConn.ws.close();
                    fs.rmdirSync(authPath, { recursive: true });
                } catch (cleanupErr) {
                    console.error('Cleanup error:', cleanupErr);
                }
            }
        }

        // Store connection
        global.subBots.push(subConn);

    } catch (error) {
        console.error('SubBot creation error:', error);
        m.reply(`❌ Failed to create SubBot: ${error.message}`);
    }
});

// Helper function to reconnect
function initializeSubBot(authPath) {
    // Similar connection logic but without user interaction
    // Would use the saved credentials in authPath
}
