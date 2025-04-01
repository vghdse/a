const { cmd } = require("../command");
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
    // Use config.REPO or default to original repo
    const repoUrl = config.REPO || "https://github.com/mrfraank/SUBZERO";
    const repoPath = repoUrl.replace('https://github.com/', '');
    
    await reply("```📥 Downloading updates...```");
    
    // 1. Download the latest code
    const zipPath = path.join(__dirname, "update.zip");
    const { data } = await axios.get(`${repoUrl}/archive/main.zip`, {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(zipPath, data);

    // 2. Extract the ZIP
    const extractPath = path.join(__dirname, 'temp_update');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // 3. Copy files (skip config.js and app.json)
    const sourcePath = path.join(extractPath, `${repoPath.split('/')[1]}-main`);
    const destinationPath = path.join(__dirname, '..');
    
    const files = fs.readdirSync(sourcePath);
    for (const file of files) {
      // Skip these important files
      if (file === "config.js" || file === "app.json") continue;
      
      const src = path.join(sourcePath, file);
      const dest = path.join(destinationPath, file);
      
      if (fs.lstatSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        copyFiles(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }

    // 4. Cleanup
    fs.unlinkSync(zipPath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    await reply("```✅ Update complete! Restarting...```");
    setTimeout(() => process.exit(0), 2000);

  } catch (error) {
    console.error(error);
    reply("❌ Update failed. Please update manually.");
  }
});

// Simple file copy helper
function copyFiles(source, target) {
  const files = fs.readdirSync(source);
  for (const file of files) {
    // Skip these important files in subdirectories too
    if (file === "config.js" || file === "app.json") continue;
    
    const src = path.join(source, file);
    const dest = path.join(target, file);
    
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      copyFiles(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}
