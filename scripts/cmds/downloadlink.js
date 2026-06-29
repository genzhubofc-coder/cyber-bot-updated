const axios = require("axios");

module.exports = {
  config: {
    name: "getlink",
    aliases: ["dlink"],
    version: "1.0.1",
    author: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    countDown: 5,
    role: 0,
    shortDescription: "Get the direct link of replied video/audio/photo",
    longDescription: "Replies to a message containing media and gives its direct URL download link.",
    category: "tools",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    // Ensure user replied to a message
    if (event.type !== "message_reply")
      return api.sendMessage("❌ | Please reply to a message that contains a video, audio, or image.", event.threadID, event.messageID);

    const replyMsg = event.messageReply;
    const attachments = replyMsg.attachments;

    // Validate attachment
    if (!attachments || attachments.length === 0)
      return api.sendMessage("❌ | The replied message has no media file.", event.threadID, event.messageID);

    if (attachments.length > 1)
      return api.sendMessage("⚠️ | Please reply to only one media file.", event.threadID, event.messageID);

    // Get media link
    const file = attachments[0];
    const url = file.url;

    if (!url)
      return api.sendMessage("❌ | Failed to get link from the replied message.", event.threadID, event.messageID);

    // Send final result
    return api.sendMessage(`✅ | 𝗠𝗲𝗱𝗶𝗮 𝗟𝗶𝗻𝗸:\n${url}`, event.threadID, event.messageID);
  }
};