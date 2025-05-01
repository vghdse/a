const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// Game database path
const GAME_DB = path.join(__dirname, '../lib/game.json');

// Initialize game database
if (!fs.existsSync(GAME_DB)) {
    fs.writeFileSync(GAME_DB, JSON.stringify({
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
        },
        bank: {
            interestRate: 0.05,
            loanRate: 0.1
        }
    }, null, 2));
}

// Helper functions
const getGameData = () => JSON.parse(fs.readFileSync(GAME_DB));
const saveGameData = (data) => fs.writeFileSync(GAME_DB, JSON.stringify(data, null, 2));

// Register player if not exists
function registerPlayer(userId) {
    const game = getGameData();
    if (!game.players[userId]) {
        game.players[userId] = {
            wallet: 100,
            bank: 0,
            items: [],
            job: null,
            lastWorked: 0,
            debt: 0
        };
        saveGameData(game);
    }
}

// Economy Game Commands
cmd({
    pattern: 'register',
    alias: ['start'],
    desc: 'Join the economy game',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    registerPlayer(m.sender);
    m.reply(`🎉 Welcome to the economy game!\n\n`
        + `💰 You received 100 credits as starting bonus!\n`
        + `Use *.work* to get a job and start earning!`);
});

cmd({
    pattern: 'balance',
    alias: ['bal'],
    desc: 'Check your balance',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    const game = getGameData();
    registerPlayer(m.sender);
    const player = game.players[m.sender];
    
    m.reply(`💳 *Account Balance*\n\n`
        + `💰 Wallet: ${player.wallet} credits\n`
        + `🏦 Bank: ${player.bank} credits\n`
        + `💸 Debt: ${player.debt} credits\n`
        + `🛒 Items: ${player.items.length > 0 ? player.items.join(', ') : 'None'}`);
});

cmd({
    pattern: 'work',
    alias: ['jobs'],
    desc: 'Get a job to earn money',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    const game = getGameData();
    registerPlayer(m.sender);
    
    let jobsList = '🔧 *Available Jobs*\n\n';
    Object.entries(game.jobs).forEach(([job, details]) => {
        jobsList += `*${job.charAt(0).toUpperCase() + job.slice(1)}*\n`
                 + `Income: ${details.income} credits\n`
                 + `Cooldown: ${details.cooldown} mins\n\n`;
    });
    
    jobsList += `Reply with *.takejob [job]* to select one`;
    m.reply(jobsList);
});

cmd({
    pattern: 'takejob',
    alias: ['acceptjob'],
    desc: 'Accept a job',
    category: 'game',
    filename: __filename
}, async (m, conn, args) => {
    const job = args[0]?.toLowerCase();
    const game = getGameData();
    registerPlayer(m.sender);
    
    if (!job || !game.jobs[job]) {
        return m.reply('❌ Invalid job! Use *.work* to see available jobs');
    }
    
    game.players[m.sender].job = job;
    saveGameData(game);
    
    m.reply(`🎉 You're now a *${job}*!\n`
          + `Use *.labor* to work and earn ${game.jobs[job].income} credits every ${game.jobs[job].cooldown} mins`);
});

cmd({
    pattern: 'labor',
    alias: ['worknow'],
    desc: 'Do your job to earn money',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    const game = getGameData();
    registerPlayer(m.sender);
    const player = game.players[m.sender];
    
    if (!player.job) {
        return m.reply('❌ You need a job first! Use *.work*');
    }
    
    const jobDetails = game.jobs[player.job];
    const now = Date.now();
    const cooldown = jobDetails.cooldown * 60 * 1000;
    
    if (now - player.lastWorked < cooldown) {
        const remaining = Math.ceil((cooldown - (now - player.lastWorked)) / (60 * 1000));
        return m.reply(`⏳ You can work again in ${remaining} minutes`);
    }
    
    // Special handling for thief (risk of getting caught)
    if (player.job === 'thief' && Math.random() < jobDetails.risk) {
        const fine = Math.floor(jobDetails.income * 2);
        player.wallet = Math.max(0, player.wallet - fine);
        player.job = null;
        saveGameData(game);
        return m.reply(`🚨 You got caught stealing!\n`
                    + `💰 Paid ${fine} credits fine\n`
                    + `🔥 Lost your job as thief!`);
    }
    
    // Successful work
    player.wallet += jobDetails.income;
    player.lastWorked = now;
    saveGameData(game);
    
    m.reply(`💼 You worked as ${player.job} and earned ${jobDetails.income} credits!\n`
          + `💰 New balance: ${player.wallet} credits`);
});

// Bank system
cmd({
    pattern: 'deposit',
    alias: ['dep'],
    desc: 'Deposit money to bank',
    category: 'game',
    filename: __filename
}, async (m, conn, args) => {
    const amount = parseInt(args[0]) || 0;
    const game = getGameData();
    registerPlayer(m.sender);
    const player = game.players[m.sender];
    
    if (amount <= 0) return m.reply('❌ Please specify a valid amount');
    if (amount > player.wallet) return m.reply('❌ Not enough money in wallet');
    
    player.wallet -= amount;
    player.bank += amount;
    saveGameData(game);
    
    m.reply(`🏦 Deposited ${amount} credits to bank\n`
          + `💰 Wallet: ${player.wallet} | Bank: ${player.bank}`);
});

// Add more commands like withdraw, shop, buy, rob, etc...

// Daily bonus system
cmd({
    pattern: 'daily',
    alias: ['bonus'],
    desc: 'Claim daily bonus',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    const game = getGameData();
    registerPlayer(m.sender);
    const player = game.players[m.sender];
    
    const now = Date.now();
    const lastDaily = player.lastDaily || 0;
    const dailyCooldown = 24 * 60 * 60 * 1000;
    
    if (now - lastDaily < dailyCooldown) {
        const remaining = Math.ceil((dailyCooldown - (now - lastDaily)) / (60 * 60 * 1000));
        return m.reply(`⏳ Come back in ${remaining} hours for your next daily bonus`);
    }
    
    const bonus = 200 + Math.floor(Math.random() * 300);
    player.wallet += bonus;
    player.lastDaily = now;
    saveGameData(game);
    
    m.reply(`🎁 Daily bonus claimed!\n`
          + `💰 +${bonus} credits\n`
          + `💳 New balance: ${player.wallet} credits`);
});

// Leaderboard command
cmd({
    pattern: 'leaderboard',
    alias: ['lb', 'rich'],
    desc: 'Show wealth leaderboard',
    category: 'game',
    filename: __filename
}, async (m, conn) => {
    const game = getGameData();
    const players = Object.entries(game.players)
        .map(([id, data]) => ({
            id,
            total: data.wallet + data.bank - data.debt
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    
    let leaderboard = '🏆 *Top 10 Richest Players*\n\n';
    players.forEach((player, index) => {
        leaderboard += `${index + 1}. @${player.id.split('@')[0]} - ${player.total} credits\n`;
    });
    
    m.reply(leaderboard);
});
