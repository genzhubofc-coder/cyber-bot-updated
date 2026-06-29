const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

// ========================
// 🔧 শুধু এখানে আপনার ৪টি আইডি বসান
// ========================
const CONFIG = {
  SAKIB1: "100070013974971",
  SAKIB2: "61569467820868",
  GF1:    "61579570892802",
  GF2:    "61587343898486"
};

// ========================
// লজিক – আর পরিবর্তন দরকার নেই
// ========================
// চারটি স্পেশাল আইডি – এরা কখনো বাইরের কারো সাথে পেয়ার হবে না
const SPECIAL_GROUP = [CONFIG.SAKIB1, CONFIG.SAKIB2, CONFIG.GF1, CONFIG.GF2];

// ফোর্সড পেয়ারিং নিয়ম
const FORCED_PAIRS = [
  { from: [CONFIG.SAKIB1, CONFIG.SAKIB2], to: CONFIG.GF1 },
  { from: [CONFIG.GF1, CONFIG.GF2], to: CONFIG.SAKIB1 }
];

// স্পেশালদের জন্য ম্যাচ রেট (৯০ এর উপরে)
const SPECIAL_MATCH_RATES = [97, 98, 100, "∞"];

module.exports = {
  config: {
    name: "pair",
    countDown: 5,
    role: 0,
    category: "fun",
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    var id1 = senderID;
    var name1 = (await api.getUserInfo(id1))[id1].name;
    var ThreadInfo = await api.getThreadInfo(threadID);
    var all = ThreadInfo.userInfo;

    let gender1 = "UNKNOWN";
    for (let c of all) if (c.id == id1) gender1 = c.gender;

    const botID = api.getCurrentUserID();
    let id2 = null;
    let forced = false;

    // ========== ফোর্সড পেয়ারিং চেক ==========
    for (const rule of FORCED_PAIRS) {
      if (rule.from.includes(id1)) {
        id2 = rule.to;
        forced = true;
        break;
      }
    }

    // ========== স্পেশাল গ্রুপের মধ্যে র‍্যান্ডম পেয়ারিং ==========
    if (!forced && SPECIAL_GROUP.includes(id1)) {
      let candidates = SPECIAL_GROUP.filter(id => id !== id1);
      if (candidates.length === 0) {
        return api.sendMessage("কোন স্পেশাল পার্টনার পাওয়া যায়নি।", threadID, messageID);
      }
      id2 = candidates[Math.floor(Math.random() * candidates.length)];
      forced = true; // এই পেয়ারিংও স্পেশাল, তাই ফোর্সড হিসেবেই গণ্য হবে (ম্যাচ রেট স্পেশাল দেবে)
    }

    // ========== সাধারণ ব্যবহারকারীদের জন্য পেয়ারিং (স্পেশালরা বাদ) ==========
    if (!forced) {
      let candidates = [];
      const excludedIDs = [...SPECIAL_GROUP, botID];

      if (gender1 === "FEMALE") {
        candidates = all
          .filter(u => u.gender === "MALE" && u.id !== id1 && !excludedIDs.includes(u.id))
          .map(u => u.id);
      } else if (gender1 === "MALE") {
        candidates = all
          .filter(u => u.gender === "FEMALE" && u.id !== id1 && !excludedIDs.includes(u.id))
          .map(u => u.id);
      } else {
        candidates = all
          .filter(u => u.id !== id1 && !excludedIDs.includes(u.id))
          .map(u => u.id);
      }

      if (candidates.length === 0) {
        return api.sendMessage("আপনার জন্য উপযুক্ত কাউকে পাওয়া যায়নি।", threadID, messageID);
      }
      id2 = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // ========== ম্যাচ রেট নির্ণয় ==========
    var name2 = (await api.getUserInfo(id2))[id2].name;
    var matchRate;

    // যদি পেয়ারটি স্পেশাল গ্রুপের দুই সদস্য হয় (ফোর্সড অথবা র‍্যান্ডম)
    if (SPECIAL_GROUP.includes(id1) && SPECIAL_GROUP.includes(id2)) {
      matchRate = SPECIAL_MATCH_RATES[Math.floor(Math.random() * SPECIAL_MATCH_RATES.length)];
    } else {
      // সাধারণ ব্যবহারকারীদের জন্য র‍্যান্ডম রেট (১-১০০)
      var rd1 = Math.floor(Math.random() * 100) + 1;
      var cc = ["-𝟭", "𝟵𝟵.𝟵𝟵", "∞", "𝟭𝟬𝟭"];
      var rd2 = cc[Math.floor(Math.random() * cc.length)];
      matchRate = Math.random() > 0.8 ? rd2 : rd1;
    }

    try {
      let avt1 = (await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      let avt2 = (await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )).data;
      let bg = (await axios.get(
        "https://i.postimg.cc/nrgPFtDG/Picsart-25-08-12-20-22-41-970.png",
        { responseType: "arraybuffer" }
      )).data;

      if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
      fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));
      fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));
      fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

      let baseImage = await loadImage(pathImg);
      let imgAvt1 = await loadImage(pathAvt1);
      let imgAvt2 = await loadImage(pathAvt2);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgAvt1, 120, 170, 300, 300);
      ctx.drawImage(imgAvt2, canvas.width - 420, 170, 300, 300);
      fs.writeFileSync(pathImg, canvas.toBuffer());

      const msg = `🌸💞 Cᴏɴɢʀᴀᴛs 💞🌸\n@${name1} ＆ @${name2} ✨\n\n💖 Mᴀᴛᴄʜ Rᴀᴛᴇ: ${matchRate}% 💖\n\n🌷 𝓛𝓸𝓿𝓮𝓵𝔂 𝓝𝓸𝓽𝓮 🌷\n❝ You are the reason I smile every day. ❞`;

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
      console.error(e);
      return api.sendMessage("প্রসেসিং এর সময় এরর হয়েছে।", threadID, messageID);
    }
  },
};
