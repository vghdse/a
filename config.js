let config = {};

const fs = require("fs-extra");
const path = require("path");
if (fs.existsSync("config.env"))
    require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
    return text === fault ? true : false;
}

const loadConfig = async () => {
    try {
        const data = await fs.readFile(
            path.join(__dirname, "./config.json"),
            "utf-8"
        );
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error("config data not found");
        }
    } catch (e) {
        throw new Error(e.message);
    }
};

async function watchFiles() {
    try {
        if (global.client.config.autoload) {
            fs.watch("./config.json", async () => {
                console.log(
                    "detected change to config file reloading configurations"
                );
                config = {};
                config = await loadConfig();
            });
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

config = loadConfig();
config["SESSION_ID"] = process.env.SESSION_ID || "";

module.exports = {
    SESSION_ID: process.env.SESSION_ID,
    // ===== MEDIA & AUTOMATION =====
    AUTO_VOICE: process.env.AUTO_VOICE || "false", // Auto-send voice messages?
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false", // Auto-record voice notes?
    AUTO_TYPING: process.env.AUTO_TYPING || "false", // Show typing indicator?
    BOT_IMAGE:
        process.env.BOT_IMAGE ||
        "https://i.postimg.cc/XNTmcqZ3/subzero-menu.png", // Bot's "alive" image

    // ===== SECURITY & ANTI-FEATURES =====
    ANTI_CALL: process.env.ANTI_CALL || "true",
    ANTI_BAD: process.env.ANTI_BAD || "false", // Block bad words?
    ANTI_LINK: process.env.ANTI_LINK || "true", // Block links in groups?
    ANTI_VV: process.env.ANTI_VV || "true", // Block view-once messages?
    DELETE_LINKS: process.env.DELETE_LINKS || "false", // Auto-delete links?
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log", // Log deleted messages (or 'same' to resend)
    ANTI_BOT: process.env.ANTI_BOT || "true",
    PM_BLOCKER: process.env.PM_BLOCKER || "true",

    // ===== BOT BEHAVIOR & APPEARANCE =====
    FOOTER: process.env.FOOTER || "*© Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ Sᴜʙᴢᴇʀᴏ*", // Bot description
    PUBLIC_MODE: process.env.PUBLIC_MODE || "true", // Allow public commands?
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false", // Show bot as always online?
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "false", // React to status updates?
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true", // VIEW to status updates?
    AUTO_BIO: process.env.AUTO_BIO || "false",
    WELCOME_GOODBYE: process.env.WELCOME_GOODBYE || "false",
    AMDIN_EVENTS: process.env.ADMIN_EVENTS || "true"
};
module.exports = config;
