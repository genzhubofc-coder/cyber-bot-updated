const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "hug",
    version: "1.3.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "জেন্ডার অনুযায়ী জড়িয়ে ধরার ছবি তৈরি করুন",
    longDescription: "ছেলে এবং মেয়ের আইডি আলাদা করে এপিআই-তে পাঠাবে। সমলিঙ্গ হলে এরর দিবে।",
    category: "চিত্র",
    guide: "{p}hug [@mention / reply]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let targetID;
    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions);
    } else {
      return api.sendMessage("⚠️ অনুগ্রহ করে কাউকে মেনশন করুন বা কারো মেসেজে রিপ্লাই দিন।", threadID, messageID);
    }

    if (senderID == targetID) return api.sendMessage("❌ নিজেকে নিজে জড়িয়ে ধরা সম্ভব নয়!", threadID, messageID);

    try {
      // ইউজারদের জেন্ডার চেক করা
      const senderInfo = await api.getUserInfo(senderID);
      const targetInfo = await api.getUserInfo(targetID);

      const senderGender = senderInfo[senderID].gender; // 2 for Male, 1 for Female
      const targetGender = targetInfo[targetID].gender;

      let maleID, femaleID;

      if (senderGender == 2 && targetGender == 1) {
        maleID = senderID;
        femaleID = targetID;
      } else if (senderGender == 1 && targetGender == 2) {
        maleID = targetID;
        femaleID = senderID;
      } else if (senderGender == 2 && targetGender == 2) {
        return api.sendMessage("⚠️ আরে বলদ, ওইটাও তো ছেলে! ছেলে হয়ে আরেক ছেলেকে জড়িয়ে ধরবি কিভাবে?🤣", threadID, messageID);
      } else if (senderGender == 1 && targetGender == 1) {
        return api.sendMessage("⚠️ আপু, ওইটাও তো একটা মেয়ে! মেয়ে হয়ে আরেকটা মেয়েকে জড়িয়ে ধরবা কিভাবে?।", threadID, messageID);
      } else {
        // জেন্ডার না পাওয়া গেলে ডিফল্ট
        maleID = senderID;
        femaleID = targetID;
      }

      let processingMessage = await api.sendMessage("🫂 ছবিটি তৈরি করা হচ্ছে...", threadID);
      const cachePath = path.join(__dirname, 'cache', `hug_${Date.now()}.png`);

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/hug?one=${maleID}&two=${femaleID}`;
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      const resString = Buffer.from(response.data).toString('utf-8');
      if (resString.includes("not able to locate a human face")) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage("⚠️ প্রোফাইল পিকচারে মানুষের চেহারা স্পষ্ট নয়।", threadID, messageID);
      }

      await fs.outputFile(cachePath, Buffer.from(response.data));
      await api.unsendMessage(processingMessage.messageID);

      return api.sendMessage({
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ দুঃখিত, একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।", threadID, messageID);
    }
  }
};