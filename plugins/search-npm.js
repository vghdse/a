const { cmd } = require('../command');
const axios = require('axios');

cmd(
    {
        pattern: 'npm',
        alias: ['npmpkg', 'npmsearch'],
        desc: 'Search for NPM packages (debug mode)',
        category: 'utilities',
        use: '<package name>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        try {
            if (!q) return reply('Please provide an NPM package name\nExample: .npm axios');

            await conn.sendMessage(mek.chat, { react: { text: "🔍", key: mek.key } });

            const apiUrl = `https://api.giftedtech.web.id/api/search/npmsearch?apikey=gifted&packagename=${encodeURIComponent(q)}`;
            
            // Make the API request
            const response = await axios.get(apiUrl);
            
            // Display the raw API response
            let debugMessage = `🔧 RAW API RESPONSE for "${q}":\n\n`;
            debugMessage += '```json\n';
            debugMessage += JSON.stringify(response.data, null, 2);
            debugMessage += '\n```';
            
            // Send the raw response
            await reply(debugMessage);

            // If response is successful, also show formatted info
            if (response.data.success && response.data.result) {
                const pkg = response.data.result;
                let infoMessage = `📦 Package: ${pkg.name}\n`;
                infoMessage += `🔄 Version: ${pkg.version}\n`;
                infoMessage += `📝 Description: ${pkg.description}\n`;
                infoMessage += `🔗 NPM: ${pkg.packageLink}\n`;
                
                await reply(infoMessage);
            }

            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('NPM search error:', error);
            
            let errorMessage = '❌ Error occurred:\n';
            errorMessage += '```\n';
            errorMessage += error.message;
            errorMessage += '\n```';
            
            if (error.response) {
                errorMessage += '\nAPI Response:\n';
                errorMessage += '```json\n';
                errorMessage += JSON.stringify(error.response.data, null, 2);
                errorMessage += '\n```';
            }
            
            await reply(errorMessage);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
        }
    }
);
