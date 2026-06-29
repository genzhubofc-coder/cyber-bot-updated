const axios = require('axios');

module.exports = {
  config: {
    name: "xvideos",
    version: "1.0.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "ভিডিও লিস্ট দেখুন",
    longDescription: "পেজ নম্বর অনুযায়ী ভিডিওর তালিকা দেখাবে।",
    category: "বিনোদল",
    guide: "{p}xvideos [পেজ নম্বর]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const page = args || 1; // পেজ নম্বর না দিলে ডিফল্ট ১ নম্বর পেজ আসবে

    let processingMessage;
    try {
      processingMessage = await api.sendMessage("🔎 তথ্য সংগ্রহ করা হচ্ছে, দয়া করে অপেক্ষা করুন...", threadID);

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/xvideos?page=${page}`;
      const response = await axios.get(apiUrl);
      const videos = response.data; // এপিআই রেসপন্স অনুযায়ী ডাটা ফরম্যাট

      if (!videos || videos.length === 0) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage("❌ কোনো তথ্য পাওয়া যায়নি।", threadID, messageID);
      }

      let msg = `✨ পেজ নম্বর: ${page}\n━━━━━━━━━━━━━\n`;
      videos.forEach((video, index) => {
        msg += `${index + 1}. 🎥 নাম: ${video.title}\n⏱️ সময়: ${video.duration}\n🔗 লিঙ্ক: ${video.url}\n\n`;
      });

      // প্রসেসিং মেসেজ মুছে ফেলা
      await api.unsendMessage(processingMessage.messageID);

      // তালিকা পাঠানো
      return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
      console.error(error);
      if (processingMessage) await api.unsendMessage(processingMessage.messageID);
      return api.sendMessage("❌ সার্ভারে সমস্যা হচ্ছে, পরে চেষ্টা করুন।", threadID, messageID);
    }
  }
};