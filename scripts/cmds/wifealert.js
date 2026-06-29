module.exports = {
    config: {
        name: "wifealert",
        version: "1.2",
        author: "Gemini",
        countDown: 0,
        role: 0,
        category: "fun",
        shortDescription: "Sohana/Jhuma name auto alert with Admin Exclusion",
        guide: "Auto detect, no command needed"
    },

    onChat: async function ({ api, event, message }) {
        if (!event.body) return;

        // সাকিব ভাইয়ের উভয় আইডি (এদের মেসেজে বট কিছু করবে না)
        const excludedIDs = ["100070013974971", "61573233986420"];

        // ১. যদি মেসেজটি সাকিব ভাইয়ের কোনো আইডি থেকে হয়, তাহলে বট কিছুই করবে না
        if (excludedIDs.includes(event.senderID)) return;

        // ২. কি-ওয়ার্ড লিস্ট
        const keywords = ["কয়'লা সুন্দরী'হহ", "mituu", "mitu", "মিতু"];
        const msgText = event.body.toLowerCase();

        // ৩. চেক করা হচ্ছে মেসেজে নামগুলো আছে কিনা (Regex \b যাতে শব্দের ভেতরে না মিলে)
        const found = keywords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            return regex.test(msgText) || msgText.includes(word);
        });

        if (found) {
            try {
                // মেসেজে রিঅ্যাকশন দেওয়া (😾)
                api.setMessageReaction("😾", event.messageID, (err) => {}, true);

                // মেসেজে রিপ্লাই দেওয়া
                return message.reply("আমার সাকিব ভাইয়ের বউকে ডাকছো কেন? 😾");
            } catch (e) {
                console.log("Wife Alert Error:", e.message);
            }
        }
    },

    onStart: async function ({ message }) {
        return message.reply("বউ অ্যালার্ট সিস্টেম সচল!");
    }
};