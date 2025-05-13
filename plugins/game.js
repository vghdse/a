const fs = require("fs"); const path = require("path");

const DATA_PATH = path.join(__dirname, "../lib/empire.json"); if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify({}));

const getData = () => JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")); const saveData = (data) => fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2)); const getUser = (data, group, id, name = "") => { if (!data[group]) data[group] = {}; if (!data[group][id]) { data[group][id] = { name, coins: 0, xp: 0, lastClaim: 0, lastWork: 0, lastMine: 0 }; } return data[group][id]; };

const formatNumber = (num) => num.toLocaleString();

const cmds = [ { cmd: "work", cooldown: 60, reward: () => Math.floor(Math.random() * 50 + 50), desc: "Work to earn coins" }, { cmd: "mine", cooldown: 120, reward: () => Math.floor(Math.random() * 100 + 80), desc: "Mine resources for coins" }, { cmd: "claim", cooldown: 86400, reward: () => 250, desc: "Daily reward" } ];

for (let { cmd, cooldown, reward, desc } of cmds) { cmd({ pattern: cmd, desc, category: "games", react: "⛏️", filename: __filename }, async (conn, mek, m, { sender, pushName, reply }) => { const group = m.chat; const data = getData(); const user = getUser(data, group, sender, pushName);

const now = Math.floor(Date.now() / 1000);
const lastTime = user[`last${cmd.charAt(0).toUpperCase() + cmd.slice(1)}`] || 0;

if (now - lastTime < cooldown) {
  const wait = cooldown - (now - lastTime);
  return reply(`⏳ Please wait ${wait} more seconds to use *${cmd}* again.`);
}

const amt = reward();
user.coins += amt;
user.xp += Math.floor(amt / 10);
user[`last${cmd.charAt(0).toUpperCase() + cmd.slice(1)}`] = now;
saveData(data);

reply(`✅ You used *${cmd}* and earned 💰 ${formatNumber(amt)} coins.`);

}); }

// Rob Command cmd({ pattern: "rob", desc: "Rob another user", category: "games", react: "💣", filename: __filename }, async (conn, mek, m, { sender, pushName, args, reply }) => { const group = m.chat; const target = m.mentionedJid?.[0]; if (!target || target === sender) return reply("❌ Tag someone to rob.");

const data = getData(); const user = getUser(data, group, sender, pushName); const victim = getUser(data, group, target);

if (victim.coins < 100) return reply("❌ That user doesn't have enough to rob.");

const steal = Math.floor(Math.random() * (victim.coins * 0.3)); victim.coins -= steal; user.coins += steal;

saveData(data); reply(💥 You robbed ${victim.name || "a user"} and stole 💰 ${formatNumber(steal)} coins!); });

// Leaderboard cmd({ pattern: "leaderboard", desc: "Show top players", category: "games", react: "🏆", filename: __filename }, async (conn, mek, m, { reply }) => { const group = m.chat; const data = getData(); if (!data[group]) return reply("No one has started playing yet.");

const sorted = Object.entries(data[group]) .map(([id, user]) => ({ ...user, id })) .sort((a, b) => b.coins - a.coins) .slice(0, 10);

const board = sorted.map((u, i) => ${i + 1}. ${u.name || u.id.split("@")[0]} - 💰 ${formatNumber(u.coins)} ).join("\n");

reply(🏆 *Leaderboard*\n\n${board}); });

// Wallet cmd({ pattern: "wallet", alias: ["bal", "balance", "profile"], desc: "Check your wallet and game stats", category: "games", react: "💼", filename: __filename }, async (conn, mek, m, { sender, pushName, reply }) => { const group = m.chat; const data = getData(); const user = getUser(data, group, sender, pushName);

const level = Math.floor(user.xp / 100) + 1; const progress = user.xp % 100;

const msg = 👛 *Your Wallet*\n\n + 👤 Name: ${user.name || "Unknown"}\n + 💰 Coins: ${formatNumber(user.coins)}\n + ⭐ XP: ${formatNumber(user.xp)}\n + 📈 Level: ${level} (${progress}/100 XP);

reply(msg); });

