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
    const repoName = repoUrl.split('/').pop();
    
    await reply("```📥 Downloading updates...```");
    
    // 1. Download the latest code
    const zipPath = path.join(__dirname, "../update.zip");
    const { data } = await axios.get(`${repoUrl}/archive/main.zip`, {
      responseType: "arraybuffer",
      timeout: 30000
    });
    fs.writeFileSync(zipPath, data);

    // 2. Create temp directory
    const extractPath = path.join(__dirname, '../temp_update');
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    fs.mkdirSync(extractPath);

    // 3. Extract the ZIP
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    // 4. Find the extracted folder
    const extractedFolders = fs.readdirSync(extractPath);
    const sourcePath = path.join(extractPath, extractedFolders[0]);
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Extracted files not found");
    }

    // 5. Copy files (skip config and other protected files)
    const protectedFiles = ["config.js", "app.json", "data"];
    const destinationPath = path.join(__dirname, '..');
    
    const copyFiles = (src, dest) => {
      const files = fs.readdirSync(src);
      for (const file of files) {
        if (protectedFiles.includes(file)) continue;
        
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        const stat = fs.lstatSync(srcPath);
        if (stat.isDirectory()) {
          if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
          copyFiles(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    await reply("```🔄 Applying updates...```");
    copyFiles(sourcePath, destinationPath);

    // 6. Cleanup
    fs.unlinkSync(zipPath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    await reply("```✅ Update complete! Restarting...```");
    setTimeout(() => process.exit(0), 2000);

  } catch (error) {
    console.error("Update error:", error);
    reply(`❌ Update failed: ${error.message}\n\nPlease update manually from:\n${config.REPO || "https://github.com/mrfraank/SUBZERO"}`);
  }
});
