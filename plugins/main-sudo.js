const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const sudoPath = path.join(__dirname, '../lib/sudo.json');

// Helper functions for JSON handling
function loadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf-8');
            return [];
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.error('Error loading JSON:', e);
        return [];
    }
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving JSON:', e);
        return false;
    }
}

// Command to add a sudo user
cmd({
    pattern: 'addsudo',
    alias: ['asudo'],
    desc: 'Add user as sudo (owner-level)',
    category: 'owner',
    react: '👑',
    filename: __filename
}, async (conn, mek, m, { isOwner, reply, quoted, q, sender }) => {
    try {
        if (!isOwner) return reply("*🚫 Access Denied!*\nOnly the bot owner can use this command.");

        let target = q || (quoted ? quoted.sender : '');
        if (!target) return reply("*⚠️ Please reply to a user or mention a number!*\nExample: .addsudo @user");

        // Clean and format the JID
        target = target.replace(/[@\s]/g, '');
        if (!target.includes('@')) target += '@s.whatsapp.net';

        const sudoList = loadJSON(sudoPath);
        if (sudoList.includes(target)) {
            return reply(`*ℹ️ @${target.split('@')[0]} is already a sudo user!*`, {
                mentions: [target]
            });
        }

        sudoList.push(target);
        if (saveJSON(sudoPath, sudoList)) {
            return reply(`*✅ Success!*\nAdded @${target.split('@')[0]} as sudo user!`, {
                mentions: [target]
            });
        } else {
            return reply("*❌ Failed to save sudo list!*");
        }
    } catch (error) {
        console.error('Addsudo error:', error);
        return reply("*⚠️ An error occurred while processing your request!*");
    }
});

// Command to remove a sudo user
cmd({
    pattern: 'delsudo',
    alias: ['rsudo'],
    desc: 'Remove sudo user',
    category: 'owner',
    react: '🗑️',
    filename: __filename
}, async (conn, mek, m, { isOwner, reply, quoted, q, sender }) => {
    try {
        if (!isOwner) return reply("*🚫 Access Denied!*\nOnly the bot owner can use this command.");

        let target = q || (quoted ? quoted.sender : '');
        if (!target) return reply("*⚠️ Please reply to a user or mention a number!*\nExample: .delsudo @user");

        // Clean and format the JID
        target = target.replace(/[@\s]/g, '');
        if (!target.includes('@')) target += '@s.whatsapp.net';

        const sudoList = loadJSON(sudoPath);
        if (!sudoList.includes(target)) {
            return reply(`*ℹ️ @${target.split('@')[0]} is not in sudo list!*`, {
                mentions: [target]
            });
        }

        const newList = sudoList.filter(u => u !== target);
        if (saveJSON(sudoPath, newList)) {
            return reply(`*✅ Success!*\nRemoved @${target.split('@')[0]} from sudo users!`, {
                mentions: [target]
            });
        } else {
            return reply("*❌ Failed to update sudo list!*");
        }
    } catch (error) {
        console.error('Delsudo error:', error);
        return reply("*⚠️ An error occurred while processing your request!*");
    }
});

// Command to list sudo users
cmd({
    pattern: 'listsudo',
    alias: ['lsudo'],
    desc: 'List all sudo users',
    category: 'owner',
    react: '📋',
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    try {
        if (!isOwner) return reply("*🚫 Access Denied!*\nOnly the bot owner can use this command.");

        const sudoList = loadJSON(sudoPath);
        if (sudoList.length === 0) return reply("*ℹ️ No sudo users found!*");

        let text = "*👑 Sudo Users List:*\n\n";
        sudoList.forEach((user, i) => {
            text += `${i+1}. @${user.split('@')[0]}\n`;
        });

        return reply(text, {
            mentions: sudoList.map(u => u)
        });
    } catch (error) {
        console.error('Listsudo error:', error);
        return reply("*⚠️ An error occurred while fetching sudo list!*");
    }
});
