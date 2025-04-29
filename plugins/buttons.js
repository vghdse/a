const { cmd } = require('../command');

cmd({
    pattern: 'group',
    alias: ['gp'],
    desc: 'Group management tools',
    category: 'admin',
    react: '👥',
    use: '<action> (add/remove/promote/demote/info)',
    filename: __filename
}, async (message, reply, text) => {
    if (!message.isGroup) return reply('This command only works in groups');

    const [action, ...args] = text.split(' ');
    const participants = message.mentionedJid || [];
    
    try {
        switch(action?.toLowerCase()) {
            case 'add':
                if (participants.length === 0) return reply('Mention users to add');
                await message.groupParticipantsUpdate(participants, 'add');
                return reply(`Added ${participants.length} members`);
                
            case 'remove':
                if (participants.length === 0) return reply('Mention users to remove');
                await message.groupParticipantsUpdate(participants, 'remove');
                return reply(`Removed ${participants.length} members`);
                
            case 'promote':
                if (participants.length === 0) return reply('Mention users to promote');
                await message.groupParticipantsUpdate(participants, 'promote');
                return reply(`Promoted ${participants.length} members to admin`);
                
            case 'demote':
                if (participants.length === 0) return reply('Mention users to demote');
                await message.groupParticipantsUpdate(participants, 'demote');
                return reply(`Demoted ${participants.length} admins`);
                
            case 'info':
                const metadata = await message.groupMetadata();
                return reply(
                    `*Group Info:*\n` +
                    `Name: ${metadata.subject}\n` +
                    `Created: ${new Date(metadata.creation * 1000)}\n` +
                    `Participants: ${metadata.participants.length}\n` +
                    `Admins: ${metadata.participants.filter(p => p.admin).length}`
                );
                
            default:
                return reply('Invalid action. Use add/remove/promote/demote/info');
        }
    } catch (e) {
        console.error(e);
        return reply('Group operation failed: ' + e.message);
    }
});
