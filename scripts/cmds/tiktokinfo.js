const axios = require("axios");

module.exports = {
    config: {
        name: "tiktok",
        aliases: ["tk", "tikinfo"],
        version: "1.0",
        author: "Gemini",
        countDown: 5,
        role: 0,
        category: "info",
        shortDescription: "TikTok ইউজার ইনফো দেখুন",
        guide: "{pn} [username]"
    },

    onStart: async function ({ api, event, args, message }) {
        const username = args.join(" ");
        if (!username) return message.reply("অনুগ্রহ করে একটি TikTok ইউজারনেম দিন। (যেমন: .tiktok nowrinn24)");

        try {
            const res = await axios.get(`https://mahbub-ullash.cyberbot.top/api/tikstalk?username=${username}`);
            const data = res.data;

            if (!data.success) {
                return message.reply("ইউজার পাওয়া যায়নি! সঠিক ইউজারনেম দিয়ে আবার চেষ্টা করুন।");
            }

            const { fullname, username: user, avatar, bio, followers, hearts, videos, earnings, verified } = data;

            let infoMsg = `👤 *TikTok User Info* 👤\n`;
            infoMsg += `━━━━━━━━━━━━━━━━━━\n`;
            infoMsg += `📝 *নাম:* ${fullname}\n`;
            infoMsg += `🆔 *ইউজারনেম:* @${user}\n`;
            infoMsg += `✅ *ভেরিফাইড:* ${verified ? "হ্যাঁ" : "না"}\n`;
            infoMsg += `💬 *বায়ো:* ${bio || "নেই"}\n`;
            infoMsg += `👥 *ফলোয়ার:* ${followers.toLocaleString()}\n`;
            infoMsg += `❤️ *লাইক:* ${hearts.toLocaleString()}\n`;
            infoMsg += `🎬 *ভিডিও:* ${videos.toLocaleString()}\n`;
            infoMsg += `💰 *আয়:* $${earnings.toFixed(2)}\n`;
            infoMsg += `━━━━━━━━━━━━━━━━━━`;

            // অ্যাভাটার ইমেজ সহ মেসেজ পাঠানো
            return message.reply({
                body: infoMsg,
                attachment: await global.utils.getStreamFromURL(avatar)
            });

        } catch (error) {
            console.error(error);
            return message.reply("তথ্য সংগ্রহ করতে সমস্যা হয়েছে। সার্ভার ডাউন থাকতে পারে।");
        }
    }
};