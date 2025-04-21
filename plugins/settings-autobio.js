const { cmd } = require('../command');
const config = require('../config');

let autoBioEnabled = false;
let bioInterval;
const defaultBio = "🤖❄️ SUBZERO MD | Online 🕒 {time}";

cmd({
    pattern: "autobio",
    alias: ["autoabout"],
    desc: "Toggle automatic bio updates",
    category: "misc",
    filename: __filename,
    usage: `${config.PREFIX}autobio [on/off] [custom text]`
}, async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ Only the bot owner can use this command");

    const [action, ...bioParts] = args;
    const newBio = bioParts.join(' ') || defaultBio;
    const timeZone = 'Africa/Harare'; // Change to your preferred timezone

    try {
        if (action === 'on') {
            if (autoBioEnabled) {
                return reply("ℹ️ Auto-bio is already enabled");
            }

            autoBioEnabled = true;
            bioInterval = setInterval(async () => {
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { timeZone });
                const formattedBio = newBio.replace('{time}', timeString);
                
                try {
                    await conn.updateProfileStatus(formattedBio);
                } catch (error) {
                    console.error('Bio update error:', error);
                    clearInterval(bioInterval);
                    autoBioEnabled = false;
                }
            }, 10 * 1000); // Update every 10 seconds

            return reply(`✅ Auto-bio enabled with text:\n"${newBio}"`);

        } else if (action === 'off') {
            if (!autoBioEnabled) return reply("ℹ️ Auto-bio is already disabled");
            
            clearInterval(bioInterval);
            autoBioEnabled = false;
            return reply("✅ Auto-bio disabled");

        } else {
            return reply(`Usage:\n` +
                `${config.PREFIX}autobio on [text] - Enable with optional custom text\n` +
                `${config.PREFIX}autobio off - Disable auto-bio\n\n` +
                `Available placeholders:\n` +
                `{time} - Current time\n` +
                `Current status: ${autoBioEnabled ? 'ON' : 'OFF'}`);
        }
    } catch (error) {
        console.error('Auto-bio error:', error);
        return reply("❌ Failed to update auto-bio settings");
    }
});
