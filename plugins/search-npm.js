/* npm search plugin - with beautiful formatting */
const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "npms",
    alias: ["npmsearch", "searchnpm"],
    react: "🔍",
    desc: "Search npm packages with beautiful formatting",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args.join(' ');
        if (!query) return reply("Please provide a search term\nExample: .npms express");

        // Show searching indicator with animation
        await reply(`🔄 *Searching npm registry...*\n▰▰▰▰▰▰▰▰▰ 0%`);
        await sleep(500);
        await conn.sendMessage(from, { 
            text: `🔄 *Searching npm registry...*\n▰▰▰▱▱▱▱▱▱ 30%`,
            edit: m.key 
        });
        await sleep(500);
        await conn.sendMessage(from, { 
            text: `🔄 *Searching npm registry...*\n▰▰▰▰▰▰▱▱▱ 60%`,
            edit: m.key 
        });
        await sleep(500);
        await conn.sendMessage(from, { 
            text: `🔄 *Searching npm registry...*\n▰▰▰▰▰▰▰▰▱ 90%`,
            edit: m.key 
        });

        // Scrape npmjs.com
        const searchUrl = `https://www.npmjs.com/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);
        const results = [];
        
        $('div[data-testid="search-result"]').each((i, el) => {
            if (i >= 5) return;
            
            const name = $(el).find('h3').text().trim();
            const version = $(el).find('span[data-testid="version"]').text().trim();
            const description = $(el).find('p[data-testid="description"]').text().trim();
            const weeklyDownloads = $(el).find('span[data-testid="weekly-downloads"]').text().trim();
            
            results.push({ name, version, description, weeklyDownloads });
        });

        if (results.length === 0) {
            return reply(`*No results found for* "${query}"\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴜʙᴢᴇʀᴏ`);
        }

        // Create beautiful output
        let response = `╭─「 *📦 NPM SEARCH RESULTS* 」\n`;
        response += `│\n`;
        response += `│ *🔍 Query:* ${query}\n`;
        response += `│ *📊 Found:* ${results.length} packages\n`;
        response += `│\n`;

        results.forEach((pkg, i) => {
            response += `╭─「 *${i+1}. ${pkg.name}* 」\n`;
            response += `│ *✨ Version:* ${pkg.version}\n`;
            response += `│ *📝 Description:* ${pkg.description}\n`;
            response += `│ *⬇️ Weekly Downloads:* ${pkg.weeklyDownloads || 'N/A'}\n`;
            response += `│ *🔗 Link:* https://www.npmjs.com/package/${pkg.name}\n`;
            response += `╰───────────────\n`;
        });

        response += `\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴜʙᴢᴇʀᴏ`;

        // Send final message
        await conn.sendMessage(from, { 
            text: response,
            contextInfo: {
                mentionedJid: [],
                forwardingScore: 999,
                isForwarded: false
            }
        }, { quoted: mek });

    } catch (error) {
        console.error('npm search error:', error);
        reply(`*❌ Error searching npm*\n${error.message}\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴜʙᴢᴇʀᴏ`);
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*const axios = require("axios");
const config = require("../config");
const {
  cmd,
  commands
} = require("../command");


const _0x50a4a6 = {
  pattern: "npm",
  desc: "Search for a package on npm.",
  react: '📦',
  use: ".npm < name >"
};
function _0x44eff2(_0x4311d2, _0x3babb0, _0x904d87, _0x18ffad, _0x1c70c8) {
  return _0x479a(_0x3babb0 - 0x348, _0x18ffad);
}
_0x50a4a6.category = "convert";
_0x50a4a6.filename = __filename;
cmd(_0x50a4a6, async (_0x45c3e3, _0x534cf5, _0x3c9af3, {
  from: _0x4a8b86,
  args: _0xfde2e1,
  reply: _0x5ddb6d
}) => {
  if (!_0xfde2e1.length) {
    return _0x5ddb6d("Please provide the name of the npm package you want to search for. Example: !npm express");
  }
  const _0x71d130 = _0xfde2e1.join(" ");
  const _0x2b9e87 = "https://registry.npmjs.org/" + encodeURIComponent(_0x71d130);
  try {
    let _0x38bc8e = await fetch(_0x2b9e87);
    if (!_0x38bc8e.ok) {
      throw new Error("Package not found or an error occurred.");
    }
    let _0x27bf7a = await _0x38bc8e.json();
    const _0x39dfb0 = _0x27bf7a["dist-tags"].latest;
    const _0x4a0adb = _0x27bf7a.description || "No description available.";
    const _0x484c23 = "https://www.npmjs.com/package/" + _0x71d130;
    const _0x1f70c0 = _0x27bf7a.license || "Unknown";
    const _0x3a52c7 = _0x27bf7a.repository ? _0x27bf7a.repository.url || "Not available" : "Not available";
    let _0x1a1dc5 = "\n*SUBZERO NPM SEARCH*\n\n\n*🔰NPM PACKAGE :* " + _0x71d130 + "\n\n*📄DESCRIPTION :* " + _0x4a0adb + "\n\n*⏸️ LAST VERSION :* " + _0x39dfb0 + "\n\n*🪪 LICENSE :* " + _0x1f70c0 + "\n\n*🪩REPOSITORY :* " + _0x3a52c7 + "\n\n*🔗NPM URL :* " + _0x484c23 + "\n\n";
    const _0x25a4fa = {
      text: _0x1a1dc5
    };
    const _0x4ab6e6 = {
      quoted: _0x534cf5
    };
    await _0x45c3e3.sendMessage(_0x4a8b86, _0x25a4fa, _0x4ab6e6);
  } catch (_0x5b358e) {
    console.error(_0x5b358e);
    _0x5ddb6d("An error occurred: " + _0x5b358e.message);
  }
});
*/
