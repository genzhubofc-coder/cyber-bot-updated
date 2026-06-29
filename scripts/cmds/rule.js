module.exports = {
    config: {
        name: "rule",
        countDown: 5,
        role: 0,
        category: "group",
    },
    onStart: async function ({ api, event }) {
        const { threadID, messageID } = event;

        const adminName1 = "PI A SH";
        const adminID1 = "61577488435750";
        const adminName2 = "SA K IB";
        const adminID2 = "100070013974971";

        const rulesMessage = `📜 ═══ 🅶🆁🅾🆄🅿 🆁🆄🅻🅴🆂 ═══ 📜

✨ Respect First
সবাই সবার সাথে সম্মান করে কথা বলবে।

🚫 No Toxic Words
গালি, খারাপ কথা বা অপমান করা যাবে না।

🎭 No Fight / Drama
গ্রুপে ঝগড়া, drama বা unnecessary argument নিষেধ।

🌊 No Spam / Flood
একই message বারবার, emoji flood বা sticker spam করা যাবে না।

🛡️ No Personal Attack
কারও personal life, family বা feelings নিয়ে কথা বলা যাবে না।

🧹 Keep the Vibe Clean
গ্রুপের পরিবেশ সুন্দর ও friendly রাখতে হবে।

🔒 Respect Privacy
গ্রুপের কথা বাইরে share করা যাবে না।

👑 Admin Rules Final
Admin-এর decision final। Admin ছাড়া কেউ @everyone দিবে না। Admin বোট অফ করতে বললে অফ হবে, অন বললে অন হবে।

🌈 Positive Vibes Only
নেগেটিভিটি না ছড়িয়ে good vibes রাখো।

🔥 One squad, one vibe, one respect.

━━━━━━━━━━━━━━━━━━━━━
👤 গ্রুপ অ্যাডমিন: @${adminName1}
🤖 বট অ্যাডমিন: @${adminName2}
━━━━━━━━━━━━━━━━━━━━━`;

        return api.sendMessage({
            body: rulesMessage,
            mentions: [
                { tag: adminName1, id: adminID1 },
                { tag: adminName2, id: adminID2 }
            ]
        }, threadID, messageID);
    }
};
