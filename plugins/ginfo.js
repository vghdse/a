const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "ginfo2",
    react: "📌",
    alias: ["groupinfo"],
    desc: "Get detailed group information",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{
const msr = (await fetchJson('https://raw.githubusercontent.com/JawadTech3/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg

if (!isGroup) return reply(`*🌍 This command only works in groups!*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`)
if (!isAdmins) { if (!isDev) return reply(`*⚠️ You need to be admin to use this!*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`),{quoted:mek }} 
if (!isBotAdmins) return reply(`*🤖 Please make me admin first!*\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`)

const ppUrls = [
        'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
      ];
let ppUrl = await conn.profilePictureUrl(from, 'image')
if (!ppUrl) { ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];}

const metadata = await conn.groupMetadata(from)
const groupAdmins = participants.filter(p => p.admin);
const listAdmin = groupAdmins.map((v, i) => `➤ @${v.id.split('@')[0]}`).join('\n');
const owner = metadata.owner

const gdata = `*〄━━━━━━━ GROUP INFO ━━━━━━━〄*

📛 *Name*: ${metadata.subject}
🆔 *JID*: ${metadata.id}
👥 *Members*: ${metadata.size}
👑 *Owner*: @${owner.split('@')[0]}
📝 *Description*: ${metadata.desc?.toString() || 'No description'}

*👮‍♂️ Admins List*:
${listAdmin}

*〄━━━━━━━━━━━━━━━━━━━━〄*\n
> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`

await conn.sendMessage(from, {
    image: { url: ppUrl },
    caption: gdata,
    mentions: groupAdmins.map(a => a.id)
},{quoted:mek })

} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`*❌ Error Occurred!*\n\n${e}\n\n> © Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ`)
}
})
