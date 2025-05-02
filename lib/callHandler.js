const config = require('../config');
const { sms } = require('./lib/functions');

module.exports = {
    rejectCall: async (conn, call) => {
        const callId = call.id;
        const callerJid = call.peerJid;
        const m = sms(conn, { key: { remoteJid: callerJid } });
        
        try {
            // Send rejection message first
            await m.reply(`🚫 *${config.BOT_NAME || 'This bot'} cannot receive calls*\n\nPlease send a text message instead.`);
            
            // Then reject the call
            await conn.rejectCall(callId, callerJid);
            
            console.log(`[❄️] Call rejected from ${callerJid}`);
        } catch (error) {
            console.error('[❄️] Call rejection failed:', error);
            // Fallback to silent rejection
            try {
                await conn.rejectCall(callId, callerJid);
            } catch (err) {
                console.error('[❄️] Complete call rejection failure:', err);
            }
        }
    }
};
