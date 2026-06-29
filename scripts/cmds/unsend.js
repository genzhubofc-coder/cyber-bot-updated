module.exports = {
    config: {
        name: "unsend",
        version: "6.0",
        author: "Gemini",
        countDown: 0,
        role: 0,
        category: "system",
        shortDescription: "Emoji Debugger & Unsend"
    },

    onChat: async function ({ api, event }) {
        if (event.type === "message_reaction") {
            const targetID = "100070013974971";

            // এই লাইনটি আপনার টার্মিনাল/কনসোলে ইমোজিটির আসল রূপ দেখাবে
            if (event.userID == targetID) {
                console.log(`[DEBUG] Reaction received: "${event.reaction}"`);
                
                // আপনার জন্য বিড়ালের সম্ভাব্য সব রূপ এখানে দিয়ে দিলাম
                const catEmojis = ["😾", "pouting_cat", ":pouting_cat:", "pouting face", "\ud83d\ude3e"];

                if (catEmojis.includes(event.reaction) || event.reaction.includes("cat")) {
                    api.getMessageInfo(event.messageID, (err, info) => {
                        if (err) return;
                        if (info.senderID == api.getCurrentUserID()) {
                            return api.unsendMessage(event.messageID);
                        }
                    });
                }
            }
        }
    },

    onStart: async function ({}) {}
};