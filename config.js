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

config = loadConfig();
config["SESSION_ID"] = process.env.SESSION_ID || "";

async function watchFiles() {
    try {
        if (config.autoload) {
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
module.exports = config;
