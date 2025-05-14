const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const config = require('../config');
const updateDbPath = path.join(__dirname, '../lib/updatedb.js');

cmd({
  pattern: "update",
  alias: ["upgrade", "sync"],
  react: '🚀',
  desc: "Update the bot to the latest version",
  category: "system",
  filename: __filename
}, async (client, message, args, { from, reply, sender, isOwner }) => {
  if (!isOwner) return reply("❌ Owner only command!");

  const repo = config.REPO || "https://github.com/mrfraank/SUBZERO";
  const repoOwner = repo.split('/')[3];
  const repoName = repo.split('/')[4];
  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/commits/main`;

  try {
    const { data: commitData } = await axios.get(apiURL);
    const latestHash = commitData.sha;

    let localUpdateInfo = require(updateDbPath);
    if (localUpdateInfo.lastUpdateHash === latestHash) {
      return reply("✅ Bot is already up-to-date.");
    }

    await reply("📥 Downloading and applying updates...");

    const zipRes = await axios.get(`${repo}/archive/refs/heads/main.zip`, {
      responseType: "arraybuffer"
    });

    const zip = new AdmZip(zipRes.data);
    const zipEntries = zip.getEntries();
    const basePath = `${repoName}-main/`;
    const protectedFiles = ["config.js", "app.json", "data", "lib/updatedb.js"];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      const relativePath = entry.entryName.replace(basePath, '');
      const destPath = path.join(__dirname, '..', relativePath);

      if (protectedFiles.some(f => destPath.includes(f))) continue;

      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      zip.extractEntryTo(entry, dir, false, true, entry.name);
    }

    // Update the local version hash in `updatedb.js`
    const newDbContent = `module.exports = {\n  lastUpdateHash: "${latestHash}"\n};\n`;
    fs.writeFileSync(updateDbPath, newDbContent);

    await reply("✅ Update complete! Restarting...");
    setTimeout(() => process.exit(0), 2000);

  } catch (err) {
    console.error("Update failed:", err);
    reply(`❌ Update failed: ${err.message}`);
  }
});


/* const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const config = require('../config');

cmd({  
  pattern: "update",  
  alias: ["upgrade", "sync"],  
  react: '🚀',  
  desc: "Update the bot to the latest version",  
  category: "system",  
  filename: __filename
}, async (client, message, args, { from, reply, sender, isOwner }) => {  
  if (!isOwner) return reply("❌ Owner only command!");
  
  try {
    const repoUrl = config.REPO || "https://github.com/mrfraank/SUBZERO";
    const repoName = repoUrl.split('/').pop();
    
    await reply("```📥 Downloading updates directly...```");
    
    // 1. Download the ZIP directly to memory
    const { data } = await axios.get(`${repoUrl}/archive/main.zip`, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    // 2. Process ZIP directly in memory
    const zip = new AdmZip(data);
    const zipEntries = zip.getEntries();
    
    // 3. Find and process files directly from ZIP
    const protectedFiles = ["config.js", "app.json", "data"];
    const basePath = `${repoName}-main/`;
    
    await reply("```🔄 Applying updates...```");
    
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const relativePath = entry.entryName.replace(basePath, '');
      const destPath = path.join(__dirname, '..', relativePath);
      
      // Skip protected files
      if (protectedFiles.some(f => destPath.includes(f))) continue;
      
      // Ensure directory exists
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file directly from ZIP
      zip.extractEntryTo(entry, dir, false, true, entry.name);
    }

    await reply("```✅ Update complete! Restarting...```");
    setTimeout(() => process.exit(0), 2000);

  } catch (error) {
    console.error("Update error:", error);
    reply(`❌ Update failed: ${error.message}\n\nPlease update manually from:\n${config.REPO || "https://github.com/mrfraank/SUBZERO"}`);
  }
});

*/
