// sudo.js
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const { loadJSON, saveJSON } = require('../index'); // Adjust path as needed
const sudoPath = path.join(__dirname, '../lib/sudo.json');

// Command to add a sudo user
cmd({
  pattern: 'addsudo',
  alias: [],
  desc: 'Add a user as sudo (owner-level privileges)',
  category: 'owner',
  react: '💪',
  filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
  // Only the primary owner can add sudo users
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner) {
    return reply("❌ Only the owner can add sudo users.");
  }
  if (!q) return reply("❌ Please provide a user JID or number to add as sudo.");
  
  let target = q.replace(/[@\s]/g, '');
  if (!target.includes('@')) target += '@s.whatsapp.net';
  
  let sudoList = loadJSON(sudoPath);
  if (sudoList.includes(target)) {
    return reply("User is already a sudo user.");
  }
  sudoList.push(target);
  saveJSON(sudoPath, sudoList);
  reply(`✅ Successfully added ${target} as sudo.`);
});

// Command to remove a sudo user
cmd({
  pattern: 'delsudo',
  alias: [],
  desc: 'Remove a sudo user',
  category: 'owner',
  react: '🗑️',
  filename: __filename
}, async (conn, mek, m, { q, senderNumber, reply }) => {
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner) {
    return reply("❌ Only the owner can remove sudo users.");
  }
  if (!q) return reply("❌ Please provide a user JID or number to remove from sudo.");
  
  let target = q.replace(/[@\s]/g, '');
  if (!target.includes('@')) target += '@s.whatsapp.net';
  
  let sudoList = loadJSON(sudoPath);
  if (!sudoList.includes(target)) {
    return reply("User is not in the sudo list.");
  }
  sudoList = sudoList.filter(u => u !== target);
  saveJSON(sudoPath, sudoList);
  reply(`✅ Successfully removed ${target} from sudo.`);
});

// Command to list sudo users
cmd({
  pattern: 'listsudo',
  alias: [],
  desc: 'List sudo users',
  category: 'owner',
  react: '📜',
  filename: __filename
}, async (conn, mek, m, { senderNumber, reply }) => {
  const owner = conn.user.id.split(":")[0];
  if (senderNumber !== owner) {
    return reply("❌ Only the owner can list sudo users.");
  }
  let sudoList = loadJSON(sudoPath);
  if (sudoList.length === 0) return reply("No sudo users set.");
  let text = "Sudo users:\n" + sudoList.join('\n');
  reply(text);
});
