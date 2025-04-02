// ban.js
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const { loadJSON, saveJSON, isSudo } = require('../index'); // Adjust path as needed
const banPath = path.join(__dirname, '../lib/ban.json');

// Command to ban a user
cmd({
  pattern: 'ban',
  alias: ['addban'],
  desc: 'Ban a user from using bot commands',
  category: 'owner',
  react: '🚫',
  filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
  // Only the primary owner or a sudo user can ban
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner && !isSudo(senderNumber)) {
    return reply("❌ You don't have permission to use this command.");
  }
  if (!q) return reply("❌ Please provide a user JID or number to ban.");
  
  let target = q.replace(/[@\s]/g, '');
  if (!target.includes('@')) target += '@s.whatsapp.net';
  
  let banList = loadJSON(banPath);
  if (banList.includes(target)) {
    return reply("User is already banned.");
  }
  banList.push(target);
  saveJSON(banPath, banList);
  reply(`✅ Successfully banned ${target}`);
});

// Command to unban a user
cmd({
  pattern: 'unban',
  alias: [],
  desc: 'Remove ban from a user',
  category: 'owner',
  react: '✅',
  filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner && !isSudo(senderNumber)) {
    return reply("❌ You don't have permission to use this command.");
  }
  if (!q) return reply("❌ Please provide a user JID or number to unban.");
  
  let target = q.replace(/[@\s]/g, '');
  if (!target.includes('@')) target += '@s.whatsapp.net';
  
  let banList = loadJSON(banPath);
  if (!banList.includes(target)) {
    return reply("User is not banned.");
  }
  banList = banList.filter(u => u !== target);
  saveJSON(banPath, banList);
  reply(`✅ Successfully unbanned ${target}`);
});

// Command to list banned users
cmd({
  pattern: 'listban',
  alias: ['banlist'],
  desc: 'List banned users',
  category: 'owner',
  react: '📜',
  filename: __filename
}, async (conn, mek, m, { senderNumber, reply }) => {
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner && !isSudo(senderNumber)) {
    return reply("❌ You don't have permission to use this command.");
  }
  let banList = loadJSON(banPath);
  if (banList.length === 0) return reply("No users are banned.");
  let text = "Banned users:\n" + banList.join('\n');
  reply(text);
});
