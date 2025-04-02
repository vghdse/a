const { cmd, generateWAMessageFromContent, proto } = require('../command');
const config = require('../config');

cmd({
    pattern: "buttons",
    alias: ["btn"],
    desc: "Show example buttons",
    category: "utility",
    react: "🛎️",
    filename: __filename
}, async (conn, mek, m, { from, reply, prefix }) => {
    try {
        // Create the buttons
        let buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Button 1",
                    id: `${prefix}button1`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Button 2",
                    id: `${prefix}button2`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "Button 3",
                    id: `${prefix}button3`
                })
            }
        ];

        // Create the message with buttons
        let msg = generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: "Here are some example buttons:"
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "> SUBZERO-MD"
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: "Example Buttons",
                            subtitle: "Click any button",
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: buttons
                        })
                    })
                }
            }
        }, {});

        // Send the message
        await conn.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id
        });

    } catch (error) {
        console.error(error);
        reply("❌ Failed to show buttons");
    }
});

// Button 1 handler
cmd({
    pattern: "button1",
    desc: "Button 1 handler",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    await reply("You pressed Button 1!");
});

// Button 2 handler
cmd({
    pattern: "button2",
    desc: "Button 2 handler",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    await reply("You pressed Button 2!");
});

// Button 3 handler
cmd({
    pattern: "button3",
    desc: "Button 3 handler",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    await reply("You pressed Button 3!");
});
