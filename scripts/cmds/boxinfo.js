const fs = require("fs-extra");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ['boxinfo'],
    version: "1.0",
    author: "xemon",
    countDown: 5,
    role: 0,
    shortDescription: "See Box info",
    longDescription: "",
    category: "box chat",
    guide: {
      en: "{p} [groupinfo|boxinfo]",
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs || [];
      const memberCount = participants.length;
      const userInfo = threadInfo.userInfo || [];
      
      // পুরুষ, মহিলা ও অন্যের সংখ্যা বের করা
      let maleCount = 0, femaleCount = 0, otherCount = 0;
      for (const user of userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else otherCount++;
      }

      // অ্যাডমিন লিস্ট তৈরি
      const adminIDs = threadInfo.adminIDs || [];
      let adminList = "";
      for (const admin of adminIDs) {
        try {
          const info = await api.getUserInfo(admin.id);
          const name = info[admin.id]?.name || "Unknown";
          adminList += `• ${name}\n`;
        } catch (e) {
          adminList += `• Unknown (${admin.id})\n`;
        }
      }

      const approvalMode = threadInfo.approvalMode ? "Turned on" : "Turned off";
      const groupIcon = threadInfo.emoji || "None";
      const messageCount = threadInfo.messageCount || 0;
      const threadName = threadInfo.threadName || "Unnamed Group";
      const threadIDStr = threadInfo.threadID;

      const infoText = `🔧「 𝐆𝐂 𝐍𝐚𝐦𝐞 」: ${threadName}
🔧「 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃 」: ${threadIDStr}
🔧「 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 」: ${approvalMode}
🔧「 𝐄𝐦𝐨𝐣𝐢 」: ${groupIcon}
🔧「 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 」: 𝐈𝐧𝐜𝐥𝐮𝐝𝐢𝐧𝐠 ${memberCount} 𝐌𝐞𝐦𝐛𝐞𝐫𝐬
🔧「 𝐍𝐮𝐦𝐛𝐞𝐫 𝐎𝐟 𝐌𝐚𝐥𝐞𝐬 」: ${maleCount}
🔧「 𝐍𝐮𝐦𝐛𝐞𝐫 𝐎𝐟 𝐅𝐞𝐦𝐚𝐥𝐞𝐬 」: ${femaleCount}
🔧「 𝐓𝐨𝐭𝐚𝐥 𝐀𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬 」: ${adminIDs.length}
「 𝐈𝐧𝐜𝐥𝐮𝐝𝐞 」:
${adminList}
🔧「 𝐓𝐨𝐭𝐚𝐥 𝐍𝐮𝐦𝐛𝐞𝐫 𝐎𝐟 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬 」: ${messageCount} msgs.

𝐌𝐚𝐝𝐞 𝐖𝐢𝐭𝐡 ❤️ 𝐁𝐲: 𝐒𝐀 𝐊 𝐈𝐁`;

      await api.sendMessage({ body: infoText }, threadID);
      
    } catch (error) {
      console.error("GroupInfo Error:", error);
      await api.sendMessage("❌ গ্রুপের তথ্য আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", threadID);
    }
  }
};
