const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "love",
    countDown: 5,
    role: 0,
    category: "fun",
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let pathImg = __dirname + "/cache/love_bg.png";
    let pathAvt1 = __dirname + "/cache/love_avt1.png";
    let pathAvt2 = __dirname + "/cache/love_avt2.png";

    let id1 = senderID;
    let id2;

    // ==========================================
    // 🎯 Target User ID (Reply or Mention)
    // ==========================================
    if (type === "message_reply") {
      id2 = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      id2 = Object.keys(mentions);
    } else {
      return api.sendMessage("কাউকে মেনশন করুন অথবা মেসেজে রিপ্লাই দিয়ে কমান্ডটি ব্যবহার করুন।", threadID, messageID);
    }

    if (id1 === id2) {
      return api.sendMessage("নিজেকে নিজে ভালোবাসা যায় না ভাই! অন্য কাউকে মেনশন করুন। 🤧", threadID, messageID);
    }

    try {
      // ইউজার ইনফো কালেক্ট করা
      let info1 = await api.getUserInfo(id1);
      let info2 = await api.getUserInfo(id2);
      
      var name1 = info1[id1] ? info1[id1].name : "User 1";
      var name2 = info2[id2] ? info2[id2].name : "User 2";

      // ==========================================
      // 🖼️ Random Background & Notes
      // ==========================================
      const bgLinks = [
        "https://i.postimg.cc/Qtm5cmVV/2a5727ea-b62a-4e6f-903b-abc39fccc15e.png",
        "https://i.postimg.cc/wBV3rvzJ/73901cae-a447-4fcb-96dd-2fb6c019d589.png",
        "https://i.postimg.cc/s2wDcNPY/e10ada2c-64ac-4e66-891f-2d3747ef1df3.png",
        "https://i.postimg.cc/yx9DvT8W/0655683c-b6d2-49e1-bf61-aa28789a2c01.png",
        "https://i.postimg.cc/q7Rg9r7J/bebd07b3-10e7-45f9-befd-fc81b1e14602.png"
      ];
      const randomBG = bgLinks[Math.floor(Math.random() * bgLinks.length)];

      const loveNotes = [
        "You are my today and all of my tomorrows. ❤️",
        "In your smile, I see something more beautiful than the stars. ✨",
        "I need you like a heart needs a beat. 💓",
        "Every time I see you, I fall in love all over again. 🥰",
        "You're that one person who can make me smile without even trying. 🌸",
        "Loving you is the best thing that ever happened to me. 💘"
      ];
      const randomNote = loveNotes[Math.floor(Math.random() * loveNotes.length)];

      // ==========================================
      // 📥 Downloading Images (With Fail-safes)
      // ==========================================
      if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

      // ফেসবুক প্রোফাইল পিকচার এপিআই ইউআরএল
      let avtUrl1 = `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      let avtUrl2 = `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      let avt1 = (await axios.get(avtUrl1, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

      let avt2 = (await axios.get(avtUrl2, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));

      let bg = (await axios.get(randomBG, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

      // ==========================================
      // 🎨 Canvas Processing
      // ==========================================
      let baseImage = await loadImage(pathImg);
      let imgAvt1 = await loadImage(pathAvt1);
      let imgAvt2 = await loadImage(pathAvt2);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // আপনার অরিজিনাল পেয়ার কোডের কোঅর্ডিনেটস ও সাইজ
      ctx.drawImage(imgAvt1, 120, 170, 300, 300);
      ctx.drawImage(imgAvt2, canvas.width - 420, 170, 300, 300);
      fs.writeFileSync(pathImg, canvas.toBuffer());

      // ==========================================
      // ✉️ Message Sending
      // ==========================================
      const msg = `🌸💞 Lᴏᴠᴇ Bᴏɴᴅ 💞🌸\n@${name1} ＆ @${name2} ✨\n\n🌷 𝓛𝓸𝓿𝓮𝓵𝔂 𝓝𝓸𝓽𝓮 🌷\n❝ ${randomNote} ❞`;

      return api.sendMessage(
        {
          body: msg,
          mentions: [
            { tag: name1, id: id1 },
            { tag: name2, id: id2 },
          ],
          attachment: fs.createReadStream(pathImg),
        },
        threadID,
        () => {
          if (fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
          if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
          if (fs.existsSync(pathAvt2)) fs.unlinkSync(pathAvt2);
        },
        messageID
      );
    } catch (e) {
      console.error("Love Command Error Log: ", e);
      return api.sendMessage(`এরর ধরা পড়েছে: ${e.message || e}\nদয়া করে বটের কনসোল/টার্মিনাল চেক করুন।`, threadID, messageID);
    }
  },
};