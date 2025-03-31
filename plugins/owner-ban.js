/* const { cmd } = require('../command');
const User = require('../models/User');
const connectDB = require('../lib/db'); // Require the db.js function

cmd({
    pattern: "ban",
    alias: ["banuser"],
    desc: "Ban a user from using the bot.",
    react: "🔨",
    category: "admin",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Ensure the database is connected
        await connectDB();

        let user, number;

        // Helper function to clean the number
        function no(number) {
            return number.replace(/\s/g, '').replace(/([@+-])/g, '');
        }

        // If a quoted message exists, prioritize it
        if (m.quoted && m.quoted.sender) {
            user = m.quoted.sender;
            number = user.split('@')[0];
        } else {
            // Clean the input text
            text = no(q);

            // Determine if the input is a number or mention
            if (isNaN(text)) {
                number = text.split`@`[1];
            } else if (!isNaN(text)) {
                number = text;
            }

            // Build the user ID
            if (number) {
                user = number + '@s.whatsapp.net';
            }
        }

        // Default response if no valid input or quoted message is provided
        if (!user) {
            return reply(`Please provide a valid user number or quote a user's message to ban.`);
        }

        let botName = conn.user.jid.split`@`[0];

        // Prevent banning the bot itself
        if (user === conn.user.jid) {
            return reply(`You cannot ban the bot (${botName}).`);
        }

        // Check if the target is the owner
        for (let i = 0; i < global.owner.length; i++) {
            let ownerNumber = global.owner[i][0];
            if (user.replace(/@s\.whatsapp\.net$/, '') === ownerNumber) {
                return reply(`You cannot ban the bot owner (${ownerNumber}).`);
            }
        }

        // Find or create the user in the database
        let userData = await User.findOne({ jid: user });
        if (!userData) {
            userData = new User({ jid: user });
        }

        // Check if the user is already banned
        if (userData.banned) {
            return reply(`The user ${number} is already banned.`);
        }

        // Ban the user
        userData.banned = true;
        await userData.save();

        // Notify about the ban
        await reply(`User ${number} has been successfully banned.`);
    } catch (e) {
        console.error(e);
        reply(`An error occurred while trying to ban the user. Please try again.`);
    }
}); */
