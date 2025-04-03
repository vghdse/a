const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const { execSync } = require('child_process');
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
    const repoPath = repoUrl.replace('https://github.com/', '');
    
    await reply("```🔄 Updating from GitHub...```");
    
    // 1. Fetch latest changes directly from git
    execSync(`git fetch ${repoUrl}`, { stdio: 'inherit' });
    
    // 2. Reset to latest main branch
    execSync('git reset --hard origin/main', { stdio: 'inherit' });
    
    // 3. Clean any untracked files
    execSync('git clean -fd', { stdio: 'inherit' });
    
    await reply("```✅ Update complete! Restarting...```");
    setTimeout(() => process.exit(0), 2000);

  } catch (error) {
    console.error("Update error:", error);
    reply(`❌ Update failed: ${error.message}\n\nPlease update manually using:\n\`\`\`git pull ${config.REPO || "https://github.com/mrfraank/SUBZERO"} main\`\`\``);
  }
});
