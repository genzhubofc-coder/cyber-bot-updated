const axios = require('axios');

module.exports = {
  config: {
    name: "captivity",
    version: "1.0.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "ক্যাপটিভিটি আর্ট তৈরি করুন",
    longDescription: "ইউজার আইডি ব্যবহার করে একটি ক্যাপটিভিটি আর্ট তৈরি করবে।",
    category: "চিত্র",
    guide: "{p}captivity [@mention / reply]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions);
    } else {
      targetID = senderID;
    }

    let processingMessage;
    try {
      // প্রসেসিং মেসেজ পাঠানো
      processingMessage = await api.sendMessage("🖼️ আপনার ছবিটি তৈরি করা হচ্ছে...", threadID);

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/captivity?userid=${targetID}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });

      // ছবি আসার আগেই মেসেজটি আনসেন্ট করা
      await api.unsendMessage(processingMessage.messageID);

      // ক্যাপশন ছাড়া শুধু ছবি পাঠানো
      return api.sendMessage({
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      if (processingMessage) {
        api.unsendMessage(processingMessage.messageID);
      }
      return api.sendMessage("❌ দুঃখিত, ছবিটি তৈরি করা সম্ভব হয়নি।", threadID, messageID);
    }
  }
};