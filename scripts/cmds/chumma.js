const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "chumma",
    version: "1.2.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "জেন্ডার অনুযায়ী চুমু খাওয়ার ছবি তৈরি করুন",
    longDescription: "ছেলে এবং মেয়ের আইডি আলাদা করে এপিআই-তে পাঠাবে। সমলিঙ্গ হলে ছবি তৈরি করবে না।",
    category: "চিত্র",
    guide: "{p}chumma [@mention / reply]"
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

    if (senderID == targetID) return api.sendMessage("❌ নিজেকে নিজে চুমু খাওয়া সম্ভব নয়!", threadID, messageID);

    try {
      // ইউজারদের জেন্ডার চেক করা
      const usersInfo = await api.getUserInfo([senderID, targetID]);
      
      const senderGender = usersInfo[senderID].gender; // 2 for Male, 1 for Female
      const targetGender = usersInfo[targetID].gender;

      let maleID, femaleID;

      if (senderGender == 2 && targetGender == 1) {
        // আপনি ছেলে, সে মেয়ে
        maleID = senderID;
        femaleID = targetID;
      } else if (senderGender == 1 && targetGender == 2) {
        // আপনি মেয়ে, সে ছেলে
        maleID = targetID;
        femaleID = senderID;
      } else if (senderGender == 2 && targetGender == 2) {
        // দুইজনই ছেলে
        return api.sendMessage("⚠️ আরে বলদ, ওইটাও তো ছেলে! ছেলে হয়ে ছেলেকে চুমু খাবি কিভাবে?🤣", threadID, messageID);
      } else if (senderGender == 1 && targetGender == 1) {
        // দুইজনই মেয়ে
        return api.sendMessage("⚠️ আপু, ওইটাও তো একটা মেয়ে! মেয়ে হয়ে অন্য মেয়েকে চুমু খাবা কিভাবে?", threadID, messageID);
      } else {
        // জেন্ডার না পাওয়া গেলে ডিফল্ট লজিক
        maleID = targetID; 
        femaleID = senderID;
      }

      let processingMessage = await api.sendMessage("💋 আপনার ছবিটি তৈরি করা হচ্ছে...", threadID);
      const cachePath = path.join(__dirname, 'cache', `kiss_${Date.now()}.png`);

      // জেন্ডার অনুযায়ী আইডি বসানো: userid1 = ছেলে, userid2 = মেয়ে (বা আপনার প্রয়োজন মতো উল্টো)
      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/kiss?userid1=${maleID}&userid2=${femaleID}`;
      
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