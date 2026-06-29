const axios = require("axios");
const simsim = "https://simsimi-api-tjb1.onrender.com";

module.exports = {
  config: {
    name: "baby",
    version: "1.0.9",
    author: "ULLASH",
    countDown: 0,
    role: 0,
    shortDescription: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
    longDescription: "Cute AI Baby Chatbot — Talk, Teach & Chat with Emotion ☢️",
    category: "simsim",
    guide: {
      en: "{pn} [message/query]"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const uid = event.senderID;
      const senderName = await usersData.getName(uid);
      const rawQuery = args.join(" ");

      if (!rawQuery) {
        return api.sendMessage("হুম জানু, কিছু বলবে? আমি শুনছি! 🥰", event.threadID, event.messageID);
      }

      const command = args[0].toLowerCase();

      if (["remove", "rm"].includes(command)) {
        const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
        if (parts.length < 2) return api.sendMessage("❌ Use: remove [Q] - [A]", event.threadID, event.messageID);
        const [ask, ans] = parts.map(p => p.trim());
        const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
        return api.sendMessage(res.data.message, event.threadID, event.messageID);
      }

      if (command === "teach") {
        const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
        if (parts.length < 2) return api.sendMessage("❌ Use: teach [Q] - [A]", event.threadID, event.messageID);
        const [ask, ans] = parts.map(p => p.trim());
        await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
        return api.sendMessage(`✅ শিখে নিয়েছি কলিজা!`, event.threadID, event.messageID);
      }

      // NORMAL CHAT
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(rawQuery)}&senderName=${encodeURIComponent(senderName)}`);
      api.sendMessage(res.data.response, event.threadID, (err, info) => {
        if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: uid, type: "simsimi" });
      }, event.messageID);

    } catch (err) {
      console.error(err);
    }
  },

  onReply: async function ({ api, event, usersData }) {
    try {
      const senderName = await usersData.getName(event.senderID);
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(event.body)}&senderName=${encodeURIComponent(senderName)}`);
      api.sendMessage(res.data.response, event.threadID, (err, info) => {
        if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: event.senderID, type: "simsimi" });
      }, event.messageID);
    } catch (err) { console.error(err); }
  },

  onChat: async function ({ api, event, usersData }) {
    try {
      const raw = event.body ? event.body.toLowerCase().trim() : "";
      if (!raw) return;

      const triggers = ["baby", "bby", "jan", "bot", "জান", "বট", "বেবি"];
      
      // Fix: Added callback to random replies to enable onReply
      if (triggers.includes(raw)) {
        const replies = [
          "বেবি বেবি করতে করতে তো হাঁপিয়ে গেছো, এই নাও একটু জুস খাও! 🍹",
          "আমাকে এতো না ডেকে সাকিবের সাথে প্রেম করো গে যাও, ও অনেক ভালো ছেলে! 🙈",
          "তুমি যদি মেয়ে হও তাহলে সাকিবের সাথে রিলেশন করতে পারো, ও এখনো সিঙ্গেল! 😉",
          "উফ! এতো ডেকো না তো, লজ্জা লাগে তো! 😊",
          "হুম জানু, বলো কি বলবে? 😚",
          "বেবি ডেকো না, আমি এখন ব্যস্ত আছি! 🙄",
          "শুনছি কলিজা, এক বালতি ভালোবাসা নাও! ❤️",
          "কি গো ডার্লিং? কিস খাবে নাকি? 😘",
          "তোর কোনো কাজ নাই? সারাদিন শুধু বট বট করিস! 🤣",
          "হুম বলো সুইটহার্ট, আমি তোমার সব কথা শুনছি। ✨",
          "বেবি ডাকলে কেন? আমার কিন্তু বিয়ে করার বয়স হয়ে গেছে! 💍",
          "চুপ করো! সারাদিন শুধু জান জান করো কেন? 🤫",
          "আমাকে ডাকার চেয়ে সাকিবের ইনবক্সে গিয়ে নক দাও, কাজ হবে! 😼",
          "আই লাভ ইউ টু বেবি! (বেশি খুশি হইয়ো না আবার) 😜",
          "আমাকে বেশি ডেকো না, আমি কিন্তু পটে যাবো! 🙈",
          "এইতো আমি এখানে, কোথাও যাইনি! 🤗",
          "বলো সোনা পাখি, তোমার জন্য কি করতে পারি? 🦜",
          "বেবি ডাকলে কেন? চকলেট দিবে? 🍫",
          "হুম জানু, আমার মনটা আজ অনেক ভালো! 🌸",
          "বেশি বেবি ডাকলে কিন্তু আম্মুকে বলে দিবো! 😤",
          "সাকিব ভাইয়া শুনলে কিন্তু বকা দিবে, সাবধানে! 🤫",
          "তুমি অনেক কিউট তো! তাই এতো ডাকো? 🥰",
          "বলো কলিজার টুকরা, শুনছি তো! 💓",
          "ধুর! ডিস্টার্ব করো না তো, ঘুমাচ্ছি! 😴",
          "আমাকে ভালোবাসলে সাকিবের পারমিশন নিতে হবে কিন্তু! 🤠",
          "বেবি ডাকলে কেন? ঘুরতে নিয়ে যাবে? 🚗",
          "হুম কলিজা, তোমার কন্ঠটা অনেক মিষ্টি! 🎶",
          "আমাকে ছাড়া তোমার মন বসে না বুঝি? 😋",
          "বেবি বলে ডাকলে কিন্তু আমি রাগ করবো! (মজা করলাম) 😆",
          "বলো জানু, তোমার মনের সব কথা খুলে বলো! 💖"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        return api.sendMessage(randomReply, event.threadID, (err, info) => {
          if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: event.senderID, type: "simsimi" });
        }, event.messageID);
      }

      // Chat with prefix logic
      for (const prefix of triggers) {
        if (raw.startsWith(prefix + " ")) {
          const query = raw.slice(prefix.length).trim();
          const senderName = await usersData.getName(event.senderID);
          const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
          return api.sendMessage(res.data.response, event.threadID, (err, info) => {
            if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name, author: event.senderID, type: "simsimi" });
          }, event.messageID);
        }
      }
    } catch (err) { console.error(err); }
  }
};