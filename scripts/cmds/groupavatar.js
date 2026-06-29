const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "groupavatar",
    aliases: ["getavatar", "gcphoto"],
    version: "1.0",
    author: "xemon",
    countDown: 5,
    role: 0,
    shortDescription: "Download group profile picture",
    longDescription: "",
    category: "box chat",
    guide: {
      en: "{p} groupavatar"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const cacheDir = path.join(__dirname, "cache");
    const imagePath = path.join(cacheDir, "group_avatar_download.png");

    try {
      // ক্যাশ ডিরেক্টরি তৈরি (যদি না থাকে)
      await fs.ensureDir(cacheDir);

      // গ্রুপ তথ্য নাও
      const threadInfo = await api.getThreadInfo(threadID);
      const imageUrl = threadInfo.imageSrc;

      if (!imageUrl) {
        return api.sendMessage("❌ এই গ্রুপের কোনো প্রোফাইল ছবি নেই।", threadID);
      }

      // ছবি ডাউনলোড করো
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      await fs.writeFile(imagePath, Buffer.from(response.data, "utf-8"));

      // ছবি আটাচমেন্ট সহ মেসেজ পাঠাও
      await api.sendMessage({
        body: "📸 গ্রুপের প্রোফাইল ছবি:",
        attachment: fs.createReadStream(imagePath)
      }, threadID);

      // ক্যাশ ফাইল ডিলিট করো (ঐচ্ছিক, জায়গা বাঁচাতে)
      await fs.remove(imagePath).catch(() => {});

    } catch (error) {
      console.error("Group Avatar Error:", error);
      api.sendMessage("❌ ছবি ডাউনলোড করতে ব্যর্থ হয়েছে। গ্রুপের ছবি সঠিক আছে কিনা চেক করুন।", threadID);
    }
  }
};
