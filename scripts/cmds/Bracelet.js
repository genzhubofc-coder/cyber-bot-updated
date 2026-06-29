const axios = require('axios');

module.exports = {
  config: {
    name: "bracelet",
    version: "1.2.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "ব্রেসলেটে নাম লিখুন",
    longDescription: "আপনার দেওয়া নাম দিয়ে একটি ব্রেসলেট ছবি তৈরি করবে।",
    category: "চিত্র",
    guide: "{p}bracelet [নাম]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const text = args.join(" ");

    if (!text) {
      return api.sendMessage("❌ অনুগ্রহ করে ব্রেসলেটে লেখার জন্য একটি নাম দিন।", threadID, messageID);
    }

    let processingMessage;
    try {
      processingMessage = await api.sendMessage("📿 আপনার ছবিটি তৈরি করা হচ্ছে...", threadID);

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/bracelet?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      await api.unsendMessage(processingMessage.messageID);

      return api.sendMessage({
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      if (processingMessage) api.unsendMessage(processingMessage.messageID);
      return api.sendMessage("❌ দুঃখিত, ছবিটি তৈরি করা সম্ভব হয়নি।", threadID, messageID);
    }
  }
};