const axios = require("axios");

module.exports = {
    config: {
        name: "namaz",
        aliases: ["prayer", "salat"],
        version: "1.1",
        author: "Gemini",
        countDown: 5,
        role: 0,
        category: "utility",
        shortDescription: "আজকের নামাজের সময়সূচী দেখুন",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, message }) {
        try {
            const res = await axios.get("https://mahbub-ullash.cyberbot.top/api/prayertimes");
            
            // স্ক্রিনশট অনুযায়ী ডেটা 'message' অবজেক্টের ভেতরে আছে
            const data = res.data.message;

            if (!data || !data.timings) {
                return message.reply("দুঃখিত, নামাজের সময়সূচী পাওয়া যায়নি।");
            }

            const { timings, date } = data;

            let msg = `🕌 *আজকের নামাজের সময়সূচী* 🕌\n`;
            msg += `━━━━━━━━━━━━━━━━━━\n`;
            msg += `📅 তারিখ: ${date.date}\n`;
            msg += `🌙 হিজরি: ${date.month.en} ${date.year}\n`;
            msg += `🗓️ দিন: ${date.weekday.en}\n`;
            msg += `━━━━━━━━━━━━━━━━━━\n`;
            msg += `✨ ফজর: ${timings.Fajr}\n`;
            msg += `☀️ সূর্যোদয়: ${timings.Sunrise}\n`;
            msg += `🕛 জোহর: ${timings.Dhuhr}\n`;
            msg += `🕒 আসর: ${timings.Asr}\n`;
            msg += `🌅 মাগরিব: ${timings.Maghrib}\n`;
            msg += `🌙 এশা: ${timings.Isha}\n`;
            msg += `━━━━━━━━━━━━━━━━━━\n`;
            msg += `⏳ ইমসাক: ${timings.Imsak}\n`;
            msg += `🌑 মাঝরাত: ${timings.Midnight}\n`;
            msg += `━━━━━━━━━━━━━━━━━━`;

            return message.reply(msg);

        } catch (error) {
            console.error(error);
            return message.reply("তথ্য সংগ্রহ করতে সমস্যা হয়েছে। সার্ভার ডাউন থাকতে পারে।");
        }
    }
};