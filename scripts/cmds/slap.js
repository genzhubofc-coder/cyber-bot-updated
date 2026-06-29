const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "slap",
    version: "1.2.0",
    author: "Gemini",
    countDown: 5,
    role: 2,
    shortDescription: "কাউকে থাপ্পড় মারার ছবি তৈরি করুন",
    longDescription: "ব্যাটম্যান হিসেবে আপনি সুপারম্যানকে থাপ্পড় মারবেন।",
    category: "চিত্র",
    guide: "{p}slap [@mention / reply]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions);
    } else {
      return api.sendMessage("⚠️ অনুগ্রহ করে কাউকে মেনশন করুন বা কারো মেসেজে রিপ্লাই দিয়ে কমান্ডটি দিন।", threadID, messageID);
    }

    let processingMessage = await api.sendMessage("👊 ছবিটি তৈরি করা হচ্ছে...", threadID);
    const cachePath = path.join(__dirname, 'cache', `slap_${Date.now()}.png`);

    try {
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/slap?batman=${senderID}&superman=${targetID}`;
      
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      
      // ফেস ডিটেকশন এরর চেক
      const resString = Buffer.from(response.data).toString('utf-8');
      if (resString.includes("not able to locate a human face")) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage({
          body: `⚠️ আপনাদের প্রোফাইল পিকচারে মানুষের চেহারা স্পষ্ট নয়।`,
          mentions: [{ tag: "target", id: targetID }]
        }, threadID, messageID);
      }

      // ছবি ক্যাশে সেভ করা
      await fs.outputFile(cachePath, Buffer.from(response.data));

      // প্রসেসিং মেসেজ মুছে ফেলা
      await api.unsendMessage(processingMessage.messageID);

      // ছবি পাঠানো
      await api.sendMessage({
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (error) {
      console.error(error);
      if (processingMessage) await api.unsendMessage(processingMessage.messageID);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      return api.sendMessage("❌ দুঃখিত, এপিআই সার্ভার থেকে ছবি পাওয়া যায়নি।", threadID, messageID);
    }
  }
};