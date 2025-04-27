import axios from 'axios';
import { cmd } from '../command.js';
import config from '../config.js';

cmd({
    pattern: "wall",
    alias: ["wallpapersearch"],
    desc: "Search anime wallpapers",
    category: "media",
    filename: __filename,
    usage: "wall <query>"
}, async (m, conn, { args }) => {
    try {
        if (!args[0]) return m.reply("Please provide a search query\nExample: *" + config.PREFIX + "wall kakashi*");

        const apiUrl = `https://draculazyx-xyzdrac.hf.space/api/Wall?q=${encodeURIComponent(args[0])}`;
        
        // Show loading message
        const loadingMsg = await m.reply("🔍 Searching wallpapers...");

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.STATUS || data.STATUS !== 200 || !data.RESULTS || data.RESULTS.length === 0) {
            return m.reply("❌ No wallpapers found for your query");
        }

        const wallpapers = data.RESULTS.slice(0, 10); // Get first 10 results
        const totalFound = data.RESULTS.length;

        // Prepare selection message
        let selectionMsg = `🎨 Found ${totalFound} wallpapers for *${data.QUERY}*\n\n`;
        selectionMsg += `📋 Showing first 10 results:\n\n`;
        
        wallpapers.forEach((wall, index) => {
            selectionMsg += `${index+1}. ${wall.title}\n`;
        });
        
        selectionMsg += `\nReply with:\n`;
        selectionMsg += `- *all* to send all wallpapers\n`;
        selectionMsg += `- *number* (1-10) to send specific wallpaper\n`;
        selectionMsg += `- *cancel* to abort`;

        // Send selection menu
        await conn.sendMessage(m.chat, { 
            text: selectionMsg,
            footer: "Anime Wallpaper Search"
        }, { quoted: m });

        // Delete loading message
        await conn.sendMessage(m.chat, { 
            delete: loadingMsg.key 
        });

        // Wait for user response
        const filter = (msg) => 
            msg.sender === m.sender && 
            (msg.body.toLowerCase() === 'all' || 
             msg.body.toLowerCase() === 'cancel' ||
             (!isNaN(msg.body) && parseInt(msg.body) >= 1 && parseInt(msg.body) <= 10));

        const collector = conn.ev.createPromise({
            filter,
            timeout: 60000, // 60 seconds timeout
            max: 1
        });

        collector.then(async ([response]) => {
            const choice = response.body.toLowerCase();

            if (choice === 'cancel') {
                return m.reply("🚫 Search cancelled");
            }

            if (choice === 'all') {
                // Send all wallpapers with 3-second delay between each
                for (const [index, wall] of wallpapers.entries()) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: wall.image },
                        caption: `🖼️ ${index+1}/${wallpapers.length}: ${wall.title}`
                    }, { quoted: m });
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                return;
            }

            // Send specific wallpaper
            const selectedIndex = parseInt(choice) - 1;
            const selectedWall = wallpapers[selectedIndex];
            
            await conn.sendMessage(m.chat, { 
                image: { url: selectedWall.image },
                caption: `🖼️ ${selectedIndex+1}/${wallpapers.length}: ${selectedWall.title}`
            }, { quoted: m });

        }).catch(() => {
            m.reply("⏱️ Selection timed out. Please try the command again.");
        });

    } catch (error) {
        console.error("Wallpaper search error:", error);
        m.reply("❌ Error processing your request. Please try again later.");
    }
});
