module.exports = {
  config: {
    name: "activemember",
    aliases: ["am"],
    version: "1.2",
    author: "nexo_here",
    countDown: 5,
    role: 0,
    shortDescription: "সব মেসেজের ভিত্তিতে টপ ১৫ সক্রিয় সদস্য",
    longDescription: "পুরো চ্যাট হিস্ট্রি থেকে মেসেজ কাউন্ট করে সর্বোচ্চ ১৫ জন দেখায়",
    category: "box chat",
    guide: "{p}{n}",
  },
  onStart: async function ({ api, event, threadsData }) {
    const threadId = event.threadID;

    // লোডিং মেসেজ প্রেরণ (এটিই পরে এডিট হবে)
    const loadingMsg = await api.sendMessage("⏳ লোডিং......", threadId);

    try {
      // গ্রুপের সব সদস্যের তালিকা
      const threadInfo = await api.getThreadInfo(threadId);
      const participants = threadInfo.participantIDs;

      // কাউন্টার ইনিশিয়ালাইজ
      let messageCounts = {};
      participants.forEach(pid => { messageCounts[pid] = 0; });

      // সব মেসেজ ফেচ করার ফাংশন (পেজিনেশন)
      async function fetchAllMessages(threadId, limit = 1000) {
        let allMessages = [];
        let cursor = null;
        let hasMore = true;

        while (hasMore) {
          try {
            const response = await api.getThreadHistory(threadId, limit, cursor);
            if (!response || response.length === 0) break;

            allMessages = allMessages.concat(response);
            cursor = response[response.length - 1].messageID;
            if (response.length < limit) hasMore = false;
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.error("পেজিনেশন এরর:", err);
            break;
          }
        }
        return allMessages;
      }

      const allMessages = await fetchAllMessages(threadId, 1000);
      
      // মেসেজ কাউন্ট আপডেট
      for (const msg of allMessages) {
        const sender = msg.senderID;
        if (messageCounts[sender] !== undefined) {
          messageCounts[sender]++;
        }
      }

      // টপ ১৫ বাছাই (কাউন্ট > 0)
      let topUsers = Object.entries(messageCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      if (topUsers.length === 0) {
        await api.editMessage("📭 কোনো মেসেজ পাওয়া যায়নি।", loadingMsg.messageID);
        return;
      }

      // ---------- নামের লজিক: threadsData থেকে আনা ----------
      const threadData = await threadsData.get(threadId);
      const membersInThreadData = threadData?.members || [];
      
      const memberMap = new Map();
      for (const member of membersInThreadData) {
        memberMap.set(member.userID, member);
      }
      
      const charac = "️️️️️️️️️️️️️️️️️";
      
      // ব্যাকআপ হিসেবে api.getUserInfo()
      const missingUserIds = topUsers.filter(([id]) => !memberMap.has(id)).map(([id]) => id);
      let fallbackNames = {};
      if (missingUserIds.length > 0) {
        const userInfos = await api.getUserInfo(missingUserIds);
        for (const [id, info] of Object.entries(userInfos)) {
          fallbackNames[id] = info.name;
        }
      }
      
      // আউটপুট তৈরি
      let userList = [];
      for (let i = 0; i < topUsers.length; i++) {
        const [userId, count] = topUsers[i];
        let rawName = "";
        
        const member = memberMap.get(userId);
        if (member && member.name) {
          rawName = member.name;
        } else if (fallbackNames[userId]) {
          rawName = fallbackNames[userId];
        } else {
          rawName = "অজানা";
        }
        
        let displayName = rawName.includes(charac) ? `Uid: ${userId}` : rawName;
        
        let rankEmoji;
        if (i === 0) rankEmoji = "👑";
        else if (i === 1) rankEmoji = "🥈";
        else if (i === 2) rankEmoji = "🥉";
        else rankEmoji = `${i+1}.`;
        
        let genderEmoji = (displayName.includes("া") || displayName.includes("ী") || displayName.includes("ে")) ? "👩" : "👨";
        
        userList.push(`${rankEmoji} ${genderEmoji} **${displayName}**\n   ✉️ মোট মেসেজ: ${count} টি`);
      }

      const finalMessage = `আমাদের গ্রুপের এক্টিভ মেম্বারস💝\n━━━━━━━━━━━━━━━━━━━━━\n${userList.join('\n\n')}\n━━━━━━━━━━━━━━━━━━━━━`;
      
      // মূল লোডিং মেসেজ এডিট করে চূড়ান্ত আউটপুট বসানো
      await api.editMessage(finalMessage, loadingMsg.messageID);
      
    } catch (error) {
      console.error(error);
      // ত্রুটি ঘটলে লোডিং মেসেজ এডিট করে এরর বার্তা দেখানো
      await api.editMessage("❌ ত্রুটি: হিস্ট্রি সংগ্রহ করা সম্ভব হয়নি।", loadingMsg.messageID);
    }
  },
};