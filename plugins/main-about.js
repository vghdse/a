/*╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺
    ⭐ ＰＲＯＪＥＣＴ ＮＡＭＥ:
    ＳＵＢＺＥＲＯ ＷＨＡＴＳＡＰＰ ＭＤ ＢＯＴ
    
    ⭐ ＤＥＶＥＬＯＰＥＲ
     ＭＲ ＦＲＡＮＫ 
     
    ⭐ ＭＹ ＴＥＡＭ
     ＸＥＲＯ ＣＯＤＥＲＳ
     
    ⭐ ＯＵＲ ＷＥＢＳＩＴＥ
     https://github.com/ZwSyntax/SUBZERO-MD

© ＴＲＹ ＤＥＣＲＹＰＴＩＮＧ ＩＦ ＹＯＵ ＣＡＮ⚠
╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺╺*/

const config = require('../config');
const {cmd} = require('../command');

cmd({
    pattern: "about",
    alias: ["mrfrank"],
    react: "🇿🇼",
    desc: "Get bot and owner information",
    category: "main",
    filename: __filename
},
async(conn, mek, m, {from, pushname, reply}) => {
    try {
        const aboutText = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
        
  *👋 HELLO ${pushname}* 😄

  *INTRODUCING SUBZERO MD* ❄️

  A versatile WhatsApp-based Multi Device Bot created by 
  Darrell Mucheri T from Zimbabwe.

  *Main Purpose*:
  Remove the burden of purchasing data bundles to download:
  - Songs
  - Apps
  - Videos
  - Movies

  *For More Visit*: 
  https://mrfrankinc.vercel.app/

╭━━━━━━━━━━━━━━━━━━━━━━╮

*🔗 SOURCE CODE* 
https://github.com/mrfrank-ofc/SUBZERO-MD

*👤 FOLLOW OWNER* 
https://github.com/mrfrank-ofc/

*📱 CONTACT DEVELOPERS* 
- Owner: https://wa.me/18062212660/?text=SubZero+Fan+Here
- Co-Dev: https://wa.me/265993702468/?text=SubZero+Fan+Here

*📢 SUPPORT CHANNEL* 
https://whatsapp.com/channel/0029VagQEmB002T7MWo3Sj1D

*🌐 SOCIAL MEDIA* 
- Instagram: https://instagram.com/mrfrankofc/
- YouTube: https://youtube.com/mrfr4nk/

╭━━━━━━━━━━━━━━━━━━━━━━╮
\`\`\`RELEASE DATE: 15 December 2024\`\`\`
> *MR FRANK OFC*
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

        await conn.sendMessage(
            from,
            {
                image: {url: config.ALIVE_IMG},
                caption: aboutText
            },
            {quoted: mek}
        );

    } catch(e) {
        console.error('Error in about command:', e);
        reply('❌ An error occurred while processing your request.');
    }
});
