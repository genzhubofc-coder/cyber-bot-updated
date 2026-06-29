const { getTime, drive } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent)
  global.temp.welcomeEvent = {};

// ফন্ট রেজিস্ট্রেশন (আর ব্যবহার না হলেও রাখা)
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "english.ttf");
    if (!fs.existsSync(fontPath)) {
      const fontUrl = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/main/english.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
    }
    registerFont(fontPath, { family: "ModernoirBold" });
  } catch (err) {
    console.error("❌ Font error:", err);
  }
})();

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

module.exports = {
  config: {
    name: "welcome",
    version: "2.0.0",
    author: "MAHBUB ULLASH",
    category: "events"
  },

  langs: {
    vi: {},
    en: {}
  },

  onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    // =============== কেস ১: বট নিজে গ্রুপে অ্যাড হয়েছে ===============
    if (dataAddedParticipants.some(item => item.userFbId == botID)) {
      if (nickNameBot) api.changeNickname(nickNameBot, threadID, botID);

      const { threadApproval } = global.GoatBot.config;
      if (threadApproval && threadApproval.enable) {
        try {
          const isAutoApprovedThread = threadApproval.autoApprovedThreads && threadApproval.autoApprovedThreads.includes(threadID);
          if (isAutoApprovedThread) {
            await threadsData.set(threadID, { approved: true });
            setTimeout(async () => {
              const msg = await botAddedWelcomeMessage(api, threadID, prefix, event, usersData, botID);
              await api.sendMessage(msg, threadID);
            }, 2000);
            return null;
          }

          await threadsData.set(threadID, { approved: false });
          if (threadApproval.adminNotificationThreads && threadApproval.adminNotificationThreads.length > 0 && threadApproval.sendNotifications !== false) {
            setTimeout(async () => {
              let threadInfo = { threadName: "Unknown", participantIDs: [] };
              try {
                const tData = await threadsData.get(threadID);
                if (tData && tData.threadName) threadInfo.threadName = tData.threadName;
                else {
                  const info = await api.getThreadInfo(threadID);
                  threadInfo = info;
                }
              } catch(e) { threadInfo.threadName = `Thread ${threadID}`; }
              let adderName = "Unknown User";
              if (event.author) {
                try { adderName = await usersData.getName(event.author); } catch(e) {}
              }
              const notifyMsg = `🔔 বট একটি নতুন গ্রুপে যুক্ত হয়েছে 🔔\n\n📌 গ্রুপের নাম: ${threadInfo.threadName}\n🆔 গ্রুপ আইডি: ${threadID}\n👤 যুক্ত করেছেন: ${adderName}\n👥 সদস্য সংখ্যা: ${threadInfo.participantIDs?.length || 0}\n⏰ সময়: ${new Date().toLocaleString()}\n\n⚠️ এই গ্রুপ এখনও অনুমোদিত নয়। বট কোনো কমান্ডে সাড়া দেবে না।\nঅনুমোদন দিতে "${prefix}mthread" ব্যবহার করুন।\n👑 Owner : SA K IB`;
              for (const notifyThreadID of threadApproval.adminNotificationThreads) {
                try { await api.sendMessage(notifyMsg, notifyThreadID); } catch(e) {}
              }
            }, 5000);
          }
          if (threadApproval.sendThreadMessage !== false) {
            setTimeout(async () => {
              try {
                await api.sendMessage(`⚠️ এই গ্রুপটি এখনও অনুমোদিত নয়। অ্যাডমিন অনুমোদন না দেওয়া পর্যন্ত বট কোনো কমান্ডে সাড়া দেবে না।\n\nঅনুমোদনের পর "${prefix}help" লিখে কমান্ড দেখুন।\n👑 Owner : SA K IB`, threadID);
              } catch(e) {}
            }, 10000);
          }
          return null;
        } catch(err) { console.error(err); }
      }

      setTimeout(async () => {
        const msg = await botAddedWelcomeMessage(api, threadID, prefix, event, usersData, botID);
        await api.sendMessage(msg, threadID);
      }, 2000);
      return null;
    }

    // =============== কেস ২: সাধারণ সদস্য জয়েন করেছে (আপনার দেওয়া মূল টেক্সট + Owner tag) ===============
    try {
      const threadData = await threadsData.get(threadID);
      if (threadData?.settings?.sendWelcomeMessage === false) return;

      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "Group Chat";
      const memberCount = threadInfo.participantIDs.length;
      const user = dataAddedParticipants[0];
      const userName = user.fullName || "New Member";

      // আপনার দেওয়া আসল টেক্সট + শুধুমাত্র শেষে Owner tag যোগ করা হয়েছে
      const welcomeText = `🌹𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐢𝐤𝐨𝐦🌹\n\n\n${threadName} এ আপনাকে স্বাগতম..!💐\nগ্রুপ এর পক্ষ থেকে আপনার জন্য লাল গোলাপের শুভেচ্ছা💐\nআমাদের মাঝে আসছেন, থাকবেন,ভালোবাসা আদান-প্রদান করবেন❤️💚\nসবার সাথে মানিয়ে নিয়ে মিলেমিশে থাকবেন❤\n┌────♣─────┐\n🌺 ${userName}\n└────♣─────┘\n         🥀🥰🥀🥰🥀\n     ❤️💚Welcome 💚❤️\n　　   ┊┊┊┊┊      \n　  　 ┊┊┊┊❣️\n　　   ┊┊┊❣️ \n　　   ┊┊❣️\n          ❣️❣️\n ‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎⎯꯭⎯꯭꯭̽⃞(⪩🩷\n\n👑 Owner : SA K IB`;

      await api.sendMessage(welcomeText, threadID);
    } catch (err) {
      console.error("❌ Welcome text message error:", err);
    }
  }
};

// হেল্পার ফাংশন: বট অ্যাড হলে বাংলা মেসেজ তৈরি (Owner tag সহ)
async function botAddedWelcomeMessage(api, threadID, prefix, event, usersData, botID) {
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "এই গ্রুপ";
    const botInfo = await api.getUserInfo(botID);
    const botName = botInfo[botID]?.name || "বট";
    let adderName = "কেউ একজন";
    if (event.author) {
      try {
        adderName = await usersData.getName(event.author);
        if (!adderName || adderName === "Unknown") {
          const uInfo = await api.getUserInfo(event.author);
          adderName = uInfo[event.author]?.name || "কেউ একজন";
        }
      } catch(e) {}
    }
    return `🎉 হ্যালো! আমাকে গ্রুপে যুক্ত করার জন্য অসংখ্য ধন্যবাদ। 🎉

📌 গ্রুপ: ${groupName}
➕ যুক্ত করেছেন: ${adderName}
🤖 বটের নাম: ${botName}
👑 Owner : SA K IB
⚙️ কমান্ড প্রিফিক্স: ${prefix}

💬 সাহায্য বা কোনো প্রশ্ন থাকলে "${prefix}help" লিখুন। 
আশা করি সবাই মিলে ভালো থাকবেন। ❤️

ধন্যবাদ।`;
  } catch(err) {
    return `বট যুক্ত হয়েছে! প্রিফিক্স: ${prefix}\n👑 Owner : SA K IB`;
  }
}
