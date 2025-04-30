const { cmd } = require('../command');

cmd({
    pattern: "art",
    alias: ["ascii", "textart"],
    desc: "Generate text art from your message",
    category: "fun",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args) return reply("Please provide text. Example: .art Hello");

        // Text art generator function
        const generateArt = (text) => {
            const artStyles = [
                // Bubble style
                text.split('').map(c => `⓿ ${c}`).join(' '),
                
                // Reverse style
                `▁▂▃▄▅▆▇${text.toUpperCase()}▇▆▅▄▃▂▁`,
                
                // Box style
                `╭┉┉┉┉┉┉┉┉┉╮\n┋ ${text} ┋\n╰┉┉┉┉┉┉┉┉┉╯`,
                
                // Arrow style
                `✦ ${text.split('').join(' ✦ ')} ✦`,
                
                // Sparkle style
                `•॰॰•${text}•॰॰•`,
                
                // Code style
                `┏━━━━━┓\n┃ ${text} ┃\n┗━━━━━┛`
            ];
            
            return artStyles.join('\n\n');
        };

        const art = generateArt(args);
        await reply(`🎨 *Text Art Generated* 🎨\n\n${art}`);

    } catch (e) {
        console.error("Art generator error:", e);
        reply("⚠️ Failed to generate art. Please try different text.");
    }
});
