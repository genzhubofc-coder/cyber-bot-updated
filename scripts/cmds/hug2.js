const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "hug2",
    version: "1.0.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    shortDescription: "জেন্ডার অনুযায়ী জড়িয়ে ধরার ছবি (ভার্সন ২)",
    longDescription: "ছেলে এবং মেয়ের আইডি আলাদা করে hug2 এপিআই-তে পাঠাবে। সমলিঙ্গ হলে ছবি তৈরি করবে না।",
    category: "চিত্র",
    guide: "{p}hug2 [@mention / reply]"
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
      // ইউজারদের জেন্ডার তথ্য সংগ্রহ
      const usersInfo = await api.getUserInfo([senderID, targetID]);
      
      const senderGender = usersInfo[senderID].gender; // 2 = Male, 1 = Female
      const targetGender = usersInfo[targetID].gender;

      let maleID, femaleID;

      if (senderGender == 2 && targetGender == 1) {
        maleID = senderID;
        femaleID = targetID;
      } else if (senderGender == 1 && targetGender == 2) {
        maleID = targetID;
        femaleID = senderID;
      } else if (senderGender == 2 && targetGender == 2) {
        return api.sendMessage("⚠️ আরে বলদ, ওইটাও তো ছেলে! দুইজন ছেলের জড়িয়ে ধরার ছবি হবে না।", threadID, messageID);
      } else if (senderGender == 1 && targetGender == 1) {
        return api.sendMessage("⚠️ আপু, ওইটাও তো একটা মেয়ে! দুইজন মেয়ের এই ছবি তৈরি করা যাবে না।", threadID, messageID);
      } else {
        // জেন্ডার অজানা থাকলে ডিফল্ট লজিক
        maleID = senderID;
        femaleID = targetID;
      }

      let processingMessage = await api.sendMessage("🫂 আপনার ছবিটি তৈরি করা হচ্ছে...", threadID);
      const cachePath = path.join(__dirname, 'cache', `hug2_${Date.now()}.png`);

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/hug2?one=${maleID}&two=${femaleID}`;
      
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      const resString = Buffer.from(response.data).toString('utf-8');

      // ফেস ডিটেকশন এরর চেক
      if (resString.includes("not able to locate a human face")) {
        await api.unsendMessage(processingMessage.messageID);
        return api.sendMessage("⚠️ প্রোফাইল পিকচারে মানুষের চেহারা স্পষ্ট নয়।", threadID, messageID);
      }

      // ফাইল সেভ এবং মেসেজ আনসেন্ট
      await fs.outputFile(cachePath, Buffer.from(response.data));
      await api.unsendMessage(processingMessage.messageID);

      // ছবি পাঠানো
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