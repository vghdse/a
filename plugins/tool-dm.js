const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const { cmd } = require("../command");

// APK Downloader
cmd({
  pattern: "apk2",
  alias: ["apkdl"],
  react: '📱',
  desc: "Download APK files",
  category: "download",
  use: ".apk <app name>"
}, async (client, message, { reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("Which apk do you want to download?");

    const searchUrl = `https://bk9.fun/search/apk?q=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const dlUrl = `https://bk9.fun/download/apk?id=${searchRes.data.BK9[0].id}`;
    const dlRes = await axios.get(dlUrl);

    await client.sendMessage(message.chat, {
      document: { url: dlRes.data.BK9.dllink },
      fileName: dlRes.data.BK9.name,
      mimetype: "application/vnd.android.package-archive"
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Failed to download APK");
  }
});

// Generic Downloader
cmd({
  pattern: "download",
  react: '⬇️',
  desc: "Download files from direct links",
  category: "download",
  use: ".download <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Enter download URL");

    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const contentType = res.headers['content-type'];
    
    await client.sendMessage(message.chat, {
      document: res.data,
      mimetype: contentType
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// Facebook Downloader
cmd({
  pattern: "facebook2",
  alias: ["fbdl2"],
  react: '📹',
  desc: "Download Facebook videos",
  category: "download",
  use: ".facebook <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a Facebook video url!");

    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${url}`;
    const response = await axios.get(apiUrl);
    
    await client.sendMessage(message.chat, {
      video: { url: response.data.data.high }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Failed to download video");
  }
});

// Google Drive Downloader
cmd({
  pattern: "gdrive2",
  react: '🚀',
  desc: "Download Google Drive files",
  category: "download",
  use: ".gdrive <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a Google Drive file URL");

    const apiUrl = `https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.status) return reply("Download failed");

    const tempPath = path.join(os.tmpdir(), `gdrive_${Date.now()}`);
    const writer = fs.createWriteStream(tempPath);
    const dlRes = await axios.get(response.data.data.download, { responseType: 'stream' });

    dlRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await client.sendMessage(message.chat, {
      document: fs.readFileSync(tempPath),
      fileName: response.data.data.name
    }, { quoted: message });

    fs.unlinkSync(tempPath);

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// GitHub Clone
cmd({
  pattern: "gitclone2",
  react: '👨‍💻',
  desc: "Clone GitHub repositories",
  category: "download",
  use: ".gitclone <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("GitHub link to clone?\nExample: .gitclone https://github.com/user/repo");

    const match = url.match(/github\.com[\/:]([^\/:]+)\/(.+)/i);
    if (!match) return reply("Invalid GitHub URL");

    const zipUrl = `https://api.github.com/repos/${match[1]}/${match[2]}/zipball`;
    
    await client.sendMessage(message.chat, {
      document: { url: zipUrl },
      mimetype: "application/zip"
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Clone failed");
  }
});

// Image Search
cmd({
  pattern: "image2",
  alias: ["img2"],
  react: '🖼️',
  desc: "Search images",
  category: "search",
  use: ".image <query>"
}, async (client, message, { reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("Please provide a search query");

    const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.data) return reply("No results found");

    for (let i = 0; i < Math.min(5, response.data.data.length); i++) {
      await client.sendMessage(message.chat, {
        image: { url: response.data.data[i].images_url }
      });
    }

  } catch (error) {
    console.error(error);
    reply("Search failed");
  }
});

// Instagram Downloader
cmd({
  pattern: "instagram2",
  alias: ["igdl2"],
  react: '📷',
  desc: "Download Instagram content",
  category: "download",
  use: ".instagram <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide an Instagram URL!");

    const apiUrl = `https://xploader-apis-5f424ea8f0da.herokuapp.com/igdl?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    await client.sendMessage(message.chat, {
      video: { url: response.data.url }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// iTunes Search
cmd({
  pattern: "itunes",
  react: '🎵',
  desc: "Search iTunes music",
  category: "search",
  use: ".itunes <song>"
}, async (client, message, { reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("Please provide a song name");

    const apiUrl = `https://api.popcat.xyz/itunes?q=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    
    const info = `*Song Information:*
• *Name:* ${response.data.name}
• *Artist:* ${response.data.artist}
• *Album:* ${response.data.album}
• *Release Date:* ${response.data.release_date}
• *Price:* ${response.data.price}
• *Length:* ${response.data.length}
• *Genre:* ${response.data.genre}
• *URL:* ${response.data.url}`;

    await client.sendMessage(message.chat, {
      image: { url: response.data.thumbnail },
      caption: info
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Search failed");
  }
});

// MediaFire Downloader
cmd({
  pattern: "mediafire2",
  react: '📂',
  desc: "Download MediaFire files",
  category: "download",
  use: ".mediafire <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a MediaFire file URL");

    const apiUrl = `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.status) return reply("Download failed");

    const tempPath = path.join(os.tmpdir(), `mediafire_${Date.now()}`);
    const writer = fs.createWriteStream(tempPath);
    const dlRes = await axios.get(response.data.data.downloadLink, { responseType: 'stream' });

    dlRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await client.sendMessage(message.chat, {
      document: fs.readFileSync(tempPath),
      fileName: response.data.data.fileName
    }, { quoted: message });

    fs.unlinkSync(tempPath);

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// Pinterest Search
cmd({
  pattern: "pinterest2",
  react: '📌',
  desc: "Search Pinterest images",
  category: "search",
  use: ".pinterest <query>"
}, async (client, message, { reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("Please provide a search query");

    const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.data) return reply("No results found");

    await client.sendMessage(message.chat, {
      image: { url: response.data.data[0].images_url },
      caption: `Title: ${response.data.data[0].grid_title}`
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Search failed");
  }
});

// Song Downloader
cmd({
  pattern: "songm",
  alias: ["musict", "mp3t"],
  react: '🎶',
  desc: "Download songs",
  category: "download",
  use: ".song <query>"
}, async (client, message, { reply, args }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("Please provide a song name!");

    const search = await yts(query);
    if (!search.all.length) return reply("Song not found");

    const apiUrl = `https://xploader-apis-5f424ea8f0da.herokuapp.com/ytmp3buffer?url=${encodeURIComponent(search.all[0].url)}`;
    const response = await axios.get(apiUrl);
    const buffer = Buffer.from(response.data.downloadBuffer, 'base64');

    await client.sendMessage(message.chat, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${search.all[0].title}.mp3`
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// TikTok Downloader
cmd({
  pattern: "tiktok2",
  alias: ["tikdl2"],
  react: '🎵',
  desc: "Download TikTok videos",
  category: "download",
  use: ".tiktok <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a TikTok video url!");

    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/tiktok?url=${url}`;
    const response = await axios.get(apiUrl);
    
    await client.sendMessage(message.chat, {
      video: { url: response.data.data.video }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// YouTube MP3 Downloader
cmd({
  pattern: "ytmp3",
  react: '🎧',
  desc: "Download YouTube audio",
  category: "download",
  use: ".ytmp3 <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a YouTube link!");

    const apiUrl = `https://xploader-apis-5f424ea8f0da.herokuapp.com/ytmp3?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    await client.sendMessage(message.chat, {
      audio: { url: response.data.downloadLink },
      mimetype: "audio/mpeg"
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});

// YouTube MP4 Downloader
cmd({
  pattern: "ytmp42",
  react: '🎬',
  desc: "Download YouTube videos",
  category: "download",
  use: ".ytmp4 <url>"
}, async (client, message, { reply, args }) => {
  try {
    const url = args[0];
    if (!url) return reply("Please provide a YouTube link!");

    const apiUrl = `https://xploader-apis-5f424ea8f0da.herokuapp.com/ytmp4?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    
    await client.sendMessage(message.chat, {
      video: { url: response.data.downloadLink }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("Download failed");
  }
});
