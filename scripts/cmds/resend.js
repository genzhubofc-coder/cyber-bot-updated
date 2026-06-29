const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "resend",
    version: "1.5",
    author: "yamada | loufi | kshitiz | modified by Ullash",
    countDown: 5,
    role: 0,
    shortDescription: "unsend ট্র্যাক করে একই গ্রুপে পাঠায়",
    longDescription: "কেউ মেসেজ unsend করলে, তার লেখা + attachment একই গ্রুপে পাঠিয়ে দেয়",
    category: "group",
  },

  onChat: async function ({ event, api, threadsData, usersData }) {
    const { createReadStream } = require("fs");
    const { messageID, senderID, threadID, body: content } = event;

    if (!global.logMessage) global.logMessage = new Map();
    if (!global.data) global.data = {};
    if (!global.data.botID) global.data.botID = api.getCurrentUserID();

    const threadData = (await threadsData.get(threadID)) || {};
    const resendEnabled =
      typeof threadData.resend !== "undefined" ? threadData.resend : true;

    if (!resendEnabled) return;
    if (senderID === global.data.botID) return;

    // ❌ নির্দিষ্ট user ignore
    if (senderID === "100070013974971") return;

    // message save
    if (event.type !== "message_unsend") {
      global.logMessage.set(messageID, {
        msgBody: content || "",
        attachments: event.attachments || [],
      });
      return;
    }

    // unsend হলে resend
    if (event.type === "message_unsend") {
      const getMsg = global.logMessage.get(messageID);
      if (!getMsg) return;

      const userData = await usersData.get(senderID);
      const senderName = userData?.name || "Unknown User";

      const msg = {
        body:
          `${senderName} মাত্রই একটা মেসেজ আনসেন্ট করছে।\n\n` +
          (getMsg.msgBody
            ? `→ ${getMsg.msgBody}`
            : "কোনো টেক্সট ছিল না"),
        attachment: [],
        mentions: [
          {
            tag: senderName,
            id: senderID,
          },
        ],
      };

      for (let i = 0; i < getMsg.attachments.length; i++) {
        const attachment = getMsg.attachments[i];

        try {
          const { data, headers } = await axios.get(attachment.url, {
            responseType: "arraybuffer",
          });

          const contentType =
            headers["content-type"] || "application/octet-stream";
          const extension = contentType.split("/")[1] || "dat";
          const path = `${__dirname}/cache/resend_${messageID}_${i + 1}.${extension}`;

          fs.writeFileSync(path, Buffer.from(data), "binary");
          const readStream = createReadStream(path);
          msg.attachment.push(readStream);

          readStream.on("end", function () {
            fs.unlink(path, function (err) {
              if (err) console.error(err);
            });
          });
        } catch (e) {
          console.error("Attachment download error:", e);
        }
      }

      api.sendMessage(msg, threadID);
    }
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const { threadID } = event;
    const subCommand = args?.[0]?.toLowerCase() || "";

    let threadData = (await threadsData.get(threadID)) || {};

    if (subCommand === "off") {
      threadData.resend = false;
      await threadsData.set(threadID, threadData);

      return api.sendMessage(
        "❌ Resend mode এই গ্রুপে বন্ধ করা হয়েছে।\nআবার চালু করতে: resend on",
        threadID
      );
    }

    if (subCommand === "on") {
      threadData.resend = true;
      await threadsData.set(threadID, threadData);

      return api.sendMessage(
        "✅ Resend mode এই গ্রুপে চালু করা হয়েছে।",
        threadID
      );
    }

    const currentStatus =
      typeof threadData.resend !== "undefined" ? threadData.resend : true;

    return api.sendMessage(
      `ℹ️ Resend status: ${currentStatus ? "ON" : "OFF"}\n\nব্যবহার:\n• resend on  → চালু\n• resend off → বন্ধ`,
      threadID
    );
  },
};