// ==========================
// Required Modules
// ==========================
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

// Override sleep if needed; if the library version is sufficient, you can remove this override
// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// ==========================
// Leave Group Command
// ==========================
cmd({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc"],
    desc: "Leave the group",
    react: "🎉",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }
        
        const botOwner = conn.user.id.split(":")[0]; 
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        reply("Leaving group...");
        await sleep(1500);
        await conn.groupLeave(from);
        reply("Goodbye! 👋");
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e}`);
    }
});


// ==========================
// Add Member Command
// ==========================
cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isBotAdmins, reply, quoted, senderNumber }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else if (q && /^\d+$/.test(q)) {
        number = q;
    } else {
        return reply("❌ Please reply to a message, mention a user, or provide a number to add.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "add");
        reply(`✅ Successfully added @${number}`, { mentions: [jid] });
    } catch (error) {
        console.error("Add command error:", error);
        reply("❌ Failed to add the member.");
    }
});


// ==========================
// Remove Member (Kick) Command
// ==========================
cmd({
    pattern: "remove",
    alias: ["kick", "k", "out"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isBotAdmins, reply, quoted, senderNumber }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else {
        return reply("❌ Please reply to a message or mention a user to remove.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");
        reply(`✅ Successfully removed @${number}`, { mentions: [jid] });
    } catch (error) {
        console.error("Remove command error:", error);
        reply("❌ Failed to remove the member.");
    }
});


// ==========================
// Promote Member Command
// ==========================
cmd({
    pattern: "promote",
    alias: ["p", "admin", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, isGroup, sender, senderNumber, botNumber, isAdmins, isBotAdmins, reply }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else {
        return reply("❌ Please reply to a message or provide a number to promote.");
    }

    if (number === botNumber) return reply("❌ The bot cannot promote itself.");

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "promote");
        reply(`✅ Successfully promoted @${number} to admin.`, { mentions: [jid] });
    } catch (error) {
        console.error("Promote command error:", error);
        reply("❌ Failed to promote the member.");
    }
});


// ==========================
// Demote Admin Command
// ==========================
cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, isGroup, sender, senderNumber, botNumber, isAdmins, isBotAdmins, reply }) => {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ Only group admins can use this command.");
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else {
        return reply("❌ Please reply to a message or provide a number to demote.");
    }

    if (number === botNumber) return reply("❌ The bot cannot demote itself.");

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        reply(`✅ Successfully demoted @${number} to a normal member.`, { mentions: [jid] });
    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote the member.");
    }
});


// ==========================
// Unmute Group Command
// ==========================
cmd({
    pattern: "unmute",
    alias: ["groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, senderNumber, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to unmute the group.");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply("✅ Group has been unmuted. Everyone can send messages.");
    } catch (e) {
        console.error("Error unmuting group:", e);
        reply("❌ Failed to unmute the group. Please try again.");
    }
});


// ==========================
// Lock Group Command
// ==========================
cmd({
    pattern: "lockgc",
    alias: ["lock","close","mute"],
    react: "🔒",
    desc: "Lock the group (Prevents new members from joining).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to lock the group.");

        await conn.groupSettingUpdate(from, "locked");
        reply("✅ Group has been locked. New members cannot join.");
    } catch (e) {
        console.error("Error locking group:", e);
        reply("❌ Failed to lock the group. Please try again.");
    }
});

    
// ==========================
// Update Group Description Command
// ==========================
cmd({
    pattern: "updategdesc",
    alias: ["upgdesc", "gdesc"],
    react: "📜",
    desc: "Change the group description.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to update the group description.");
        if (!q) return reply("❌ Please provide a new group description.");

        await conn.groupUpdateDescription(from, q);
        reply("✅ Group description has been updated.");
    } catch (e) {
        console.error("Error updating group description:", e);
        reply("❌ Failed to update the group description. Please try again.");
    }
});


// ==========================
// Update Group Name Command
// ==========================
cmd({
    pattern: "updategname",
    alias: ["upgname", "gname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to update the group name.");
        if (!q) return reply("❌ Please provide a new group name.");

        await conn.groupUpdateSubject(from, q);
        reply(`✅ Group name has been updated to: *${q}*`);
    } catch (e) {
        console.error("Error updating group name:", e);
        reply("❌ Failed to update the group name. Please try again.");
    }
});


// ==========================
// Join Group via Invite Link Command
// ==========================
cmd({
    pattern: "join",
    react: "📬",
    alias: ["joinme","f_join"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, sender, senderNumber, isCreator, isDev, isOwner, isMe, reply }) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

        if (!isCreator && !isDev && !isOwner && !isMe) return reply(msr.own_cmd)
        if (!q) return reply("*Please write the Group Link*️ 🖇️")
        let result = args[0].split('https://chat.whatsapp.com/')[1]
        await conn.groupAcceptInvite(result)
        await conn.sendMessage(from, { text: `✔️ *Successfully Joined*` }, { quoted: mek })
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.error(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
});


// ==========================
// Get Group Invite Link Command
// ==========================
cmd({
    pattern: "invite",
    react: "🖇️",
    alias: ["grouplink","glink"],
    desc: "To Get the Group Invite link",
    category: "group",
    use: '.invite',
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isDev, isBotAdmins, reply }) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

        if (!isGroup) return reply(msr.only_gp)
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek })
        if (!isBotAdmins) return reply(msr.give_adm)
        const code = await conn.groupInviteCode(from)

        await conn.sendMessage(from, { text: `🖇️ *Group Link*\n\nhttps://chat.whatsapp.com/${code}` }, { quoted: mek })
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.error(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
});


// ==========================
// Reset (Revoke) Group Invite Link Command
// ==========================
cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink","resetglink","revokelink","f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isDev, isBotAdmins, reply }) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

        if (!isGroup) return reply(msr.only_gp)
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek })
        if (!isBotAdmins) return reply(msr.give_adm)
        await conn.groupRevokeInvite(from)
        await conn.sendMessage(from, { text: `*Group link Reset* ⛔` }, { quoted: mek })
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.error(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
});


// ==========================
// Hidetag (Tag All Members) Command
// ==========================
cmd({
    pattern: "hidetag",
    react: "🔊",
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isDev, isBotAdmins, reply, participants }) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

        if (!isGroup) return reply(msr.only_gp)
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek })
        if (!isBotAdmins) return reply(msr.give_adm)
        if (!q) return reply('*Please add a Message* ℹ️')
        let teks = `${q}`
        conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.error(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
});


// ==========================
// Tag Group (Reply and Tag All) Command
// ==========================
cmd({
    pattern: "taggp",
    react: "🔊",
    alias: ["tggp","tagall"],
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, reply, participants }) => {
    try {
        if (!m.quoted) return reply('*Please mention a message* ℹ️')
        if (!q) return reply('*Please add a Group Jid* ℹ️')
        let teks = `${m.quoted.msg}`
        conn.sendMessage(q, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
        console.error(e)
        reply(`❌ *Error Occurred !!*\n\n${e}`)
    }
});


// ==========================
// Remove All Non-Admin Members Command
// ==========================
cmd({
    pattern: "removemembers",
    alias: ["kickall", "endgc", "endgroup"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, groupMetadata, groupAdmins, isBotAdmins, senderNumber, reply, isGroup }) => {
    try {
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        const nonAdminParticipants = allParticipants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdminParticipants.length === 0) {
            return reply("There are no non-admin members to remove.");
        }

        reply(`Starting to remove ${nonAdminParticipants.length} non-admin members...`);

        for (let participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all non-admin members from the group.");
    } catch (e) {
        console.error("Error removing non-admin users:", e);
        reply("An error occurred while trying to remove non-admin members. Please try again.");
    }
});


// ==========================
// Remove All Admin Members (Excluding Bot & Owner) Command
// ==========================
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        const adminParticipants = allParticipants.filter(member => 
            groupAdmins.includes(member.id) && 
            member.id !== conn.user.id && 
            member.id !== `${botOwner}@s.whatsapp.net`
        );

        if (adminParticipants.length === 0) {
            return reply("There are no admin members to remove.");
        }

        reply(`Starting to remove ${adminParticipants.length} admin members, excluding the bot and bot owner...`);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all admin members from the group, excluding the bot and bot owner.");
    } catch (e) {
        console.error("Error removing admins:", e);
        reply("An error occurred while trying to remove admins. Please try again.");
    }
});


// ==========================
// Remove All Members (Excluding Bot & Owner) Command
// ==========================
cmd({
    pattern: "removeall2",
    alias: ["kickall2", "endgc2", "endgroup2"],
    desc: "Remove all members and admins from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, { from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply }) => {
    try {
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        if (allParticipants.length === 0) {
            return reply("The group has no members to remove.");
        }

        const participantsToRemove = allParticipants.filter(
            participant => participant.id !== conn.user.id && participant.id !== `${botOwner}@s.whatsapp.net`
        );

        if (participantsToRemove.length === 0) {
            return reply("No members to remove after excluding the bot and bot owner.");
        }

        reply(`Starting to remove ${participantsToRemove.length} members, excluding the bot and bot owner...`);

        for (let participant of participantsToRemove) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
            } catch (e) {
                console.error(`Failed to remove ${participant.id}:`, e);
            }
        }

        reply("Successfully removed all members, excluding the bot and bot owner, from the group.");
    } catch (e) {
        console.error("Error removing members:", e);
        reply("An error occurred while trying to remove members. Please try again.");
    }
});

// OPEN TIME & CLOSE

cmd({
    pattern: "opentime",
    react: "🔑",
    desc: "To open group to a time",
    category: "group",
    use: '.opentime',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{   
if (!isGroup) return reply(ONLGROUP)
if (!isAdmins) return reply(ADMIN)	
  if (args[1] == 'second') {
                    var timer = args[0] * `1000`
                } else if (args[1] == 'minute') {
                    var timer = args[0] * `60000`
                } else if (args[1] == 'hour') {
                    var timer = args[0] * `3600000`
                } else if (args[1] == 'day') {
                    var timer = args[0] * `86400000`
                } else {
                    return reply('*select:*\nsecond\nminute\nhour\n\n*example*\n10 second')
                }
                reply(`_Group will automatically open after ${q}_`)
                setTimeout(() => {
                    var nomor = mek.participant
                    const open = `\`\`\`🔓Good News! Group has been opened Enjoy :)\`\`\`\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ`
                    conn.groupSettingUpdate(from, 'not_announcement')
                    reply(open)
                }, timer)
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "closetime",
    react: "🔒",
    desc: "To close group to a time",
    category: "group",
    use: '.closstime',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{   
if (!isGroup) return reply(ONLGROUP)
if (!isAdmins) return reply(ADMIN)	
                if (args[1] == 'second') {
                    var timer = args[0] * `1000`
                } else if (args[1] == 'minute') {
                    var timer = args[0] * `60000`
                } else if (args[1] == 'hour') {
                    var timer = args[0] * `3600000`
                } else if (args[1] == 'day') {
                    var timer = args[0] * `86400000`
                } else {
                    return reply('*select:*\nsecond\nminute\nhour\n\n*Example*\n10 second')
                }
                reply(`_Group will be automatically closed after ${q}_`)
                setTimeout(() => {
                    var nomor = m.participant
                    const close = `\`\`\`🔐 Time's Up !, Group Automatically Closed\`\`\` \n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ғʀᴀɴᴋ `
                    conn.groupSettingUpdate(from, 'announcement')
                    reply(close)
                }, timer)
await conn.sendMessage(from, { react: { text: `✅`, key: mek.key }}) 
} catch (e) {
reply('*Error !!*')
l(e)
}
})

