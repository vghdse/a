const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// Database setup
const DB_PATH = path.join(__dirname, '../lib/game.json');

// Initialize database
function initDB() {
    if (!fs.existsSync(DB_PATH)) {
        const defaultData = {
            players: {},
            jobs: {
                miner: { income: 50, cooldown: 30 },
                fisher: { income: 30, cooldown: 20 },
                thief: { income: 80, cooldown: 60, risk: 0.3 }
            },
            shops: {
                phone: { price: 500, emoji: '📱' },
                car: { price: 5000, emoji: '🚗' },
                house: { price: 20000, emoji: '🏠' }
            }
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    }
}

// Read database
function readDB() {
    initDB();
    return JSON.parse(fs.readFileSync(DB_PATH));
}

// Write to database
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Register player
function registerPlayer(userId) {
    const db = readDB();
    if (!db.players[userId]) {
        db.players[userId] = {
            wallet: 100,
            bank: 0,
            items: [],
            job: null,
            lastWorked: 0,
            lastDaily: 0
        };
        writeDB(db);
    }
}

// Game commands
cmd({
    pattern: 'register',
    alias: ['start'],
    desc: 'Join the economy game',
    category: 'game',
    filename: __filename
}, async (m) => {
    registerPlayer(m.sender);
    m.reply(`🎉 Welcome to the economy game!\n💰 You received 100 credits!\nUse *.work* to get a job!`);
});

cmd({
    pattern: 'balance',
    alias: ['bal'],
    desc: 'Check your balance',
    category: 'game',
    filename: __filename
}, async (m) => {
    registerPlayer(m.sender);
    const db = readDB();
    const player = db.players[m.sender];
    
    m.reply(`💳 *Balance*\n\n💰 Wallet: ${player.wallet}\n🏦 Bank: ${player.bank}\n🛒 Items: ${player.items.length || 'None'}`);
});

cmd({
    pattern: 'work',
    alias: ['jobs'],
    desc: 'View available jobs',
    category: 'game',
    filename: __filename
}, async (m) => {
    const db = readDB();
    let jobsList = '🔧 *Available Jobs*\n\n';
    
    for (const [job, details] of Object.entries(db.jobs)) {
        jobsList += `*${job.toUpperCase()}*\nIncome: ${details.income}\nCooldown: ${details.cooldown} mins\n\n`;
    }
    
    m.reply(jobsList + 'Reply with *.takejob [job]* to select');
});

cmd({
    pattern: 'takejob',
    alias: ['acceptjob'],
    desc: 'Accept a job',
    category: 'game',
    filename: __filename
}, async (m, _, args) => {
    const job = args[0]?.toLowerCase();
    if (!job) return m.reply('❌ Please specify a job');
    
    const db = readDB();
    if (!db.jobs[job]) return m.reply('❌ Invalid job! Use *.work* to see options');
    
    registerPlayer(m.sender);
    db.players[m.sender].job = job;
    writeDB(db);
    
    m.reply(`🎉 You're now a ${job}!\nUse *.labor* to work and earn ${db.jobs[job].income} credits`);
});

cmd({
    pattern: 'labor',
    alias: ['worknow'],
    desc: 'Work to earn money',
    category: 'game',
    filename: __filename
}, async (m) => {
    const db = readDB();
    registerPlayer(m.sender);
    const player = db.players[m.sender];
    
    if (!player.job) return m.reply('❌ Get a job first with *.work*');
    
    const job = db.jobs[player.job];
    const now = Date.now();
    const cooldown = job.cooldown * 60 * 1000;
    
    if (now - player.lastWorked < cooldown) {
        const remaining = Math.ceil((cooldown - (now - player.lastWorked)) / 60000);
        return m.reply(`⏳ Come back in ${remaining} minutes`);
    }
    
    // Handle thief risk
    if (player.job === 'thief' && Math.random() < job.risk) {
        const fine = job.income * 2;
        player.wallet = Math.max(0, player.wallet - fine);
        player.job = null;
        writeDB(db);
        return m.reply(`🚨 Caught stealing! Fined ${fine} credits and lost your job!`);
    }
    
    // Successful work
    player.wallet += job.income;
    player.lastWorked = now;
    writeDB(db);
    
    m.reply(`💼 Earned ${job.income} credits as ${player.job}!\n💰 New balance: ${player.wallet}`);
});

cmd({
    pattern: 'daily',
    alias: ['bonus'],
    desc: 'Claim daily reward',
    category: 'game',
    filename: __filename
}, async (m) => {
    const db = readDB();
    registerPlayer(m.sender);
    const player = db.players[m.sender];
    
    const now = Date.now();
    const dailyCooldown = 24 * 60 * 60 * 1000;
    
    if (now - player.lastDaily < dailyCooldown) {
        const remaining = Math.ceil((dailyCooldown - (now - player.lastDaily)) / 3600000);
        return m.reply(`⏳ Come back in ${remaining} hours`);
    }
    
    const bonus = 200 + Math.floor(Math.random() * 300);
    player.wallet += bonus;
    player.lastDaily = now;
    writeDB(db);
    
    m.reply(`🎁 Daily bonus: ${bonus} credits!\n💰 New balance: ${player.wallet}`);
});

cmd({
    pattern: 'shop',
    alias: ['store'],
    desc: 'View shop items',
    category: 'game',
    filename: __filename
}, async (m) => {
    const db = readDB();
    let shopList = '🛍️ *Shop Items*\n\n';
    
    for (const [item, details] of Object.entries(db.shops)) {
        shopList += `${details.emoji} *${item}* - ${details.price} credits\n`;
    }
    
    m.reply(shopList + '\nUse *.buy [item]* to purchase');
});

cmd({
    pattern: 'buy',
    desc: 'Purchase an item',
    category: 'game',
    filename: __filename
}, async (m, _, args) => {
    const item = args[0]?.toLowerCase();
    if (!item) return m.reply('❌ Specify an item to buy');
    
    const db = readDB();
    if (!db.shops[item]) return m.reply('❌ Invalid item! Use *.shop*');
    
    registerPlayer(m.sender);
    const player = db.players[m.sender];
    
    if (player.wallet < db.shops[item].price) {
        return m.reply(`❌ You need ${db.shops[item].price - player.wallet} more credits!`);
    }
    
    player.wallet -= db.shops[item].price;
    player.items.push(item);
    writeDB(db);
    
    m.reply(`✅ Purchased ${db.shops[item].emoji} ${item} for ${db.shops[item].price} credits!`);
});

cmd({
    pattern: 'leaderboard',
    alias: ['lb'],
    desc: 'View richest players',
    category: 'game',
    filename: __filename
}, async (m) => {
    const db = readDB();
    const players = Object.entries(db.players)
        .map(([id, data]) => ({
            id: id.split('@')[0],
            total: data.wallet + data.bank
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    
    let leaderboard = '🏆 *Top 10 Richest Players*\n\n';
    players.forEach((p, i) => {
        leaderboard += `${i+1}. @${p.id} - ${p.total} credits\n`;
    });
    
    m.reply(leaderboard);
});
