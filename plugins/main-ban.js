const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const banPath = path.join(__dirname, '../lib/ban.json');

// Helper functions for JSON handling
function loadBanList() {
    try {
        if (!fs.existsSync(banPath)) {
            fs.writeFileSync(banPath, '[]', 'utf-8');
            return [];
        }
        return JSON.parse(fs.readFileSync(banPath, 'utf-8'));
    } catch (e) {
        console.error('Error loading ban list:', e);
        return [];
    }
}

function saveBanList(data) {
    try {
        fs.writeFileSync(banPath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving ban list:', e);
        return false;
    }
}

// Command to ban a user
cmd({
    pattern: 'ban',
    alias: ['block', 'addban'],
    desc: 'Ban a user from using bot commands',
    category: 'owner',
    react: '🚫',
    filename: __filename
}, async (conn, mek, m, { isOwner, isSudo, reply, quoted, q, sender }) => {
    try {
        if (!isOwner && !isSudo) {
            return reply("*🚫 Access Denied!*\nOnly owner and sudo users can ban users.");
        }

        let target = q || (quoted ? quoted.sender : '');
        if (!target) return reply("*⚠️ Please reply to a user or mention a number!*\nExample: .ban @user");

        // Clean and format the JID
        target = target.replace(/[@\s]/g, '');
        if (!target.includes('@')) target += '@s.whatsapp.net';

        const banList = loadBanList();
        if (banList.includes(target)) {
            return reply(`*ℹ️ @${target.split('@')[0]} is already banned!*`, {
                mentions: [target]
            });
        }

        banList.push(target);
        if (saveBanList(banList)) {
            return reply(`*✅ Success!*\nBanned @${target.split('@')[0]} from using bot commands!`, {
                mentions: [target]
            });
        } else {
            return reply("*❌ Failed to update ban list!*");
        }
    } catch (error) {
        console.error('Ban command error:', error);
        return reply("*⚠️ An error occurred while processing your request!*");
    }
});

// Command to unban a user
cmd({
    pattern: 'unban',
    alias: ['unblock', 'removeban'],
    desc: 'Unban a user to allow bot commands',
    category: 'owner',
    react: '✅',
    filename: __filename
}, async (conn, mek, m, { isOwner, isSudo, reply, quoted, q, sender }) => {
    try {
        if (!isOwner && !isSudo) {
            return reply("*🚫 Access Denied!*\nOnly owner and sudo users can unban users.");
        }

        let target = q || (quoted ? quoted.sender : '');
        if (!target) return reply("*⚠️ Please reply to a user or mention a number!*\nExample: .unban @user");

        // Clean and format the JID
        target = target.replace(/[@\s]/g, '');
        if (!target.includes('@')) target += '@s.whatsapp.net';

        const banList = loadBanList();
        if (!banList.includes(target)) {
            return reply(`*ℹ️ @${target.split('@')[0]} is not banned!*`, {
                mentions: [target]
            });
        }

        const newList = banList.filter(u => u !== target);
        if (saveBanList(newList)) {
            return reply(`*✅ Success!*\nUnbanned @${target.split('@')[0]}! They can now use bot commands.`, {
                mentions: [target]
            });
        } else {
            return reply("*❌ Failed to update ban list!*");
        }
    } catch (error) {
        console.error('Unban command error:', error);
        return reply("*⚠️ An error occurred while processing your request!*");
    }
});

// Command to list banned users
cmd({
    pattern: 'listban',
    alias: ['banlist', 'banned'],
    desc: 'List all banned users',
    category: 'owner',
    react: '📜',
    filename: __filename
}, async (conn, mek, m, { isOwner, isSudo, reply }) => {
    try {
        if (!isOwner && !isSudo) {
            return reply("*🚫 Access Denied!*\nOnly owner and sudo users can view ban list.");
        }

        const banList = loadBanList();
        if (banList.length === 0) return reply("*ℹ️ No users are currently banned!*");

        let text = "*🚫 Banned Users List:*\n\n";
        banList.forEach((user, i) => {
            text += `${i+1}. @${user.split('@')[0]}\n`;
        });

        return reply(text, {
            mentions: banList.map(u => u)
        });
    } catch (error) {
        console.error('Listban command error:', error);
        return reply("*⚠️ An error occurred while fetching ban list!*");
    }
});
