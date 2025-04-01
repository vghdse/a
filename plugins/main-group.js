/*

$$$$$$\            $$\                                               
$$  __$$\           $$ |                                              
$$ /  \__|$$\   $$\ $$$$$$$\  $$$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$\  
\$$$$$$\  $$ |  $$ |$$  __$$\ \____$$  |$$  __$$\ $$  __$$\ $$  __$$\ 
 \____$$\ $$ |  $$ |$$ |  $$ |  $$$$ _/ $$$$$$$$ |$$ |  \__|$$ /  $$ |
$$\   $$ |$$ |  $$ |$$ |  $$ | $$  _/   $$   ____|$$ |      $$ |  $$ |
\$$$$$$  |\$$$$$$  |$$$$$$$  |$$$$$$$$\ \$$$$$$$\ $$ |      \$$$$$$  |
 \______/  \______/ \_______/ \________| \_______|\__|       \______/

Project Name : SubZero MD
Creator      : Darrell Mucheri ( Mr Frank OFC )
Repo         : https//github.com/mrfrank-ofc/SUBZERO-MD
Support      : wa.me/18062212660
*/










































































































































































































const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const config = require('../config')
const { cmd, commands } = require('../command')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



cmd({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc"],
    desc: "Leave the group",
    react: "🎉",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply
}) => {
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


cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If manually typing a number with '@'
    } else if (q && /^\d+$/.test(q)) {
        number = q; // If directly typing a number
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


// KICK


cmd({
    pattern: "remove",
    alias: ["kick", "k", "out"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If mentioning a user
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


// PROMOTE



cmd({
    pattern: "promote",
    alias: ["p", "admin", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Check if the user is an admin
    if (!isAdmins) return reply("❌ Only group admins can use this command.");

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If manually typing a number
    } else {
        return reply("❌ Please reply to a message or provide a number to promote.");
    }

    // Prevent promoting the bot itself
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

// DEMOTE



cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async(conn, mek, m, {
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Check if the user is an admin
    if (!isAdmins) return reply("❌ Only group admins can use this command.");

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0]; // If replying to a message, get the sender's number
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, ''); // If manually typing a number
    } else {
        return reply("❌ Please reply to a message or provide a number to demote.");
    }

    // Prevent demoting the bot itself
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



// OPEN GC


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


// CLOSE GC


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
    
    
    // ST DESCRIPTION
    
    

cmd({
    pattern: "updategdesc",
    alias: ["upgdesc", "gdesc"],
    react: "📜",
    desc: "Change the group description.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, q, reply }) => {
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

// SET GROUP NAME


cmd({
    pattern: "updategname",
    alias: ["upgname", "gname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, q, reply }) => {
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

// OTHER GC


cmd({
    pattern: "join",
    react: "📬",
    alias: ["joinme","f_join"],
    desc: "To Join a Group from Invite link",
    category: "group",
    use: '.join < Group Link >',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isCreator && !isDev && !isOwner && !isMe) return reply(msr.own_cmd)
if (!q) return reply("*Please write the Group Link*️ 🖇️")
 let result = args[0].split('https://chat.whatsapp.com/')[1]
 await conn.groupAcceptInvite(result)
     await conn.sendMessage(from , { text: `✔️ *Successfully Joined*`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )



cmd({
    pattern: "invite",
    react: "🖇️",
    alias: ["grouplink","glink"],
    desc: "To Get the Group Invite link",
    category: "group",
    use: '.invite',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
const code = await conn.groupInviteCode(from)

 await conn.sendMessage(from , { text: `🖇️ *Group Link*\n\nhttps://chat.whatsapp.com/${code}`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )



cmd({
    pattern: "revoke",
    react: "🖇️",
    alias: ["revokegrouplink","resetglink","revokelink","f_revoke"],
    desc: "To Reset the group link",
    category: "group",
    use: '.revoke',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
await conn.groupRevokeInvite(from)
 await conn.sendMessage(from , { text: `*Group link Reseted* ⛔`}, { quoted: mek } )
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "hidetag",
    react: "🔊",
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/XdTechPro/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isGroup) return reply(msr.only_gp)
if (!isAdmins) { if (!isDev) return reply(msr.you_adm),{quoted:mek }} 
if (!isBotAdmins) return reply(msr.give_adm)
	
		if(!q) return reply('*Please add a Message* ℹ️')
		let teks = `${q}`
                conn.sendMessage(from, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
                
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

cmd({
    pattern: "taggp",
    react: "🔊",
    alias: ["tggp","tagall"],
    desc: "To Tag all Members for Message",
    category: "group",
    use: '.tag Hi',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, mentionByTag , args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
		if ( !m.quoted ) return reply('*Please mention a message* ℹ️')
		if(!q) return reply('*Please add a Group Jid* ℹ️')
		//if ( q == "120363174739054837@g.us" ) { if ( !isDev ) return reply("❌ *Acai wage ! You can send Tag messages to Official Support Group*") }
		let teks = `${m.quoted.msg}`
        conn.sendMessage(q, { text: teks, mentions: participants.map(a => a.id) }, { quoted: mek })
                
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
} )

// KICKALL

// remove only member

cmd({
    pattern: "removemembers",
    alias: ["kickall", "endgc", "endgroup"],
    desc: "Remove all non-admin members from the group.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, groupMetadata, groupAdmins, isBotAdmins, senderNumber, reply, isGroup
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
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
                await sleep(2000); // 2-second delay between removals
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

// remove only admins
 
cmd({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "Remove all admin members from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, groupAdmins, isBotAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
        const botOwner = conn.user.id.split(":")[0];
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        if (!isBotAdmins) {
            return reply("I need to be an admin to execute this command.");
        }

        const allParticipants = groupMetadata.participants;
        const adminParticipants = allParticipants.filter(member => groupAdmins.includes(member.id) && member.id !== conn.user.id && member.id !== `${botOwner}@s.whatsapp.net`);

        if (adminParticipants.length === 0) {
            return reply("There are no admin members to remove.");
        }

        reply(`Starting to remove ${adminParticipants.length} admin members, excluding the bot and bot owner...`);

        for (let participant of adminParticipants) {
            try {
                await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000); // 2-second delay between removals
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

// remove admins and memeber both

cmd({
    pattern: "removeall2",
    alias: ["kickall2", "endgc2", "endgroup2"],
    desc: "Remove all members and admins from the group, excluding the bot and bot owner.",
    react: "🎉",
    category: "group",
    filename: __filename,
}, 
async (conn, mek, m, {
    from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply("This command can only be used in groups.");
        }

        // Get the bot owner's number dynamically
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

        // Filter out the bot and bot owner from the list
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
                await sleep(2000); // 2-second delay between removals
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




