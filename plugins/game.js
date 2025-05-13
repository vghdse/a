/*// MineRush Full Game Bot 
const fs = require("fs"); 
const path = require("path"); 
const { cmd } = require("../command");

const DB_PATH = path.resolve(__dirname, "../lib/empire.json");

function loadDB() { if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2)); return JSON.parse(fs.readFileSync(DB_PATH)); }

function saveDB(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }

function getUser(db, id) { if (!db.users[id]) { db.users[id] = { id, coins: 0, gems: 0, level: 1, lastMine: 0, lastClaim: 0, inventory: [], isPro: false, robbed: 0, robbedBy: 0 }; } return db.users[id]; }

cmd({ pattern: "mine", desc: "Mine for coins and gems", category: "game", react: "⛏️", filename: __filename }, async (conn, mek, m, { sender, reply }) => { const db = loadDB(); const user = getUser(db, sender); const now = Date.now(); const cooldown = user.isPro ? 10 * 60 * 1000 : 30 * 60 * 1000; if (now - user.lastMine < cooldown) { const wait = ((cooldown - (now - user.lastMine)) / 60000).toFixed(1); return reply(⏳ Wait ${wait} minutes before mining again.); } const coins = Math.floor(Math.random() * 200) + 50; const gems = Math.random() < 0.3 ? 1 : 0; user.coins += coins; user.gems += gems; user.lastMine = now; saveDB(db); reply(⛏️ You mined ${coins} coins${gems ? " and 1 gem" : ""}!); });

cmd({ pattern: "claim", desc: "Claim daily rewards", category: "game", react: "🎁", filename: __filename }, async (conn, mek, m, { sender, reply }) => { const db = loadDB(); const user = getUser(db, sender); const now = Date.now(); const oneDay = 24 * 60 * 60 * 1000; if (now - user.lastClaim < oneDay) { return reply("⏳ You've already claimed today. Come back later!"); } const bonus = 150 + Math.floor(Math.random() * 100); user.coins += bonus; user.lastClaim = now; saveDB(db); reply(🎉 You claimed ${bonus} coins!); });

cmd({ pattern: "wallet", desc: "Check your balance", category: "game", react: "💼", filename: __filename }, async (conn, mek, m, { sender, reply }) => { const db = loadDB(); const user = getUser(db, sender); reply(💼 Wallet: Coins: ${user.coins} Gems: ${user.gems} Level: ${user.level} Pro: ${user.isPro ? "Yes" : "No"}); });

cmd({ pattern: "rob", desc: "Rob another user", category: "game", react: "🦹", filename: __filename }, async (conn, mek, m, { sender, args, reply }) => { const db = loadDB(); const targetId = m.mentionedJid?.[0] || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net"); if (!targetId || targetId === sender) return reply("❌ Invalid target."); const user = getUser(db, sender); const target = getUser(db, targetId); if (target.coins < 100) return reply("❌ Target doesn't have enough coins."); const success = Math.random() < 0.5; if (success) { const amount = Math.floor(target.coins * 0.2); user.coins += amount; target.coins -= amount; user.robbed++; target.robbedBy++; saveDB(db); reply(🦹 Success! You stole ${amount} coins from @${targetId.split("@")[0]}); } else { reply("❌ Rob failed. Better luck next time!"); } });

cmd({ pattern: "top", desc: "Show leaderboard", category: "game", react: "🏆", filename: __filename }, async (conn, mek, m, { reply }) => { const db = loadDB(); const sorted = Object.values(db.users).sort((a, b) => b.coins - a.coins).slice(0, 10); let msg = "🏆 Top Miners Leaderboard:\n\n"; sorted.forEach((u, i) => { msg += ${i + 1}. ${u.id.split("@")[0]} - ${u.coins} coins\n; }); reply(msg); });

cmd({ pattern: "promote", desc: "Promote user to Pro", category: "owner", react: "🚀", filename: __filename }, async (conn, mek, m, { isCreator, args, reply }) => { if (!isCreator) return reply("❗ Owner only command."); const db = loadDB(); const targetId = m.mentionedJid?.[0] || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net"); if (!targetId) return reply("❌ No target specified."); const user = getUser(db, targetId); user.isPro = true; saveDB(db); reply(🚀 @${targetId.split("@")[0]} has been promoted to Pro!); });

cmd({ pattern: "pro", desc: "Check pro benefits", category: "game", react: "✨", filename: __filename }, async (conn, mek, m, { sender, reply }) => { const db = loadDB(); const user = getUser(db, sender); if (user.isPro) { reply("✨ You are a Pro user! Benefits: 3x faster mining, rob protection, and more!"); } else { reply("🔓 Unlock Pro to enjoy faster mining and exclusive features!"); } });

*/
