const axios = require("axios");

module.exports.config = {
  name: "imgur",
  version: "6.9",
  author: "dipto",
  countDown: 5,
  role: 0,
  category: "tools",
  description: "convert image/video into Imgur link",
  usages: "reply [image, video]",
};

module.exports.onStart = async function ({ api, event }) {
  // প্রথমে চেক করি ইউজার রেপ্লাই দিয়েছে কি না
  if (!event.messageReply || !event.messageReply.attachments?.length) {
    return api.sendMessage(
      "Please reply to an image or video.",
      event.threadID,
      event.messageID
    );
  }

  // attachment url নাও
  let mediaUrl = event.messageReply.attachments[0].url;

  if (!mediaUrl) {
    return api.sendMessage(
      "Could not find media URL. Try again.",
      event.threadID,
      event.messageID
    );
  }

  try {
    // API call
    const apiUrl = `https://noobs-api-sable.vercel.app/imgur?link=${encodeURIComponent(mediaUrl)}`;
    const res = await axios.get(apiUrl);

    if (res.data?.data) {
      return api.sendMessage(res.data.data, event.threadID, event.messageID);
    } else {
      return api.sendMessage(
        "Failed to convert image or video into link.",
        event.threadID,
        event.messageID
      );
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      "Error while processing your request.",
      event.threadID,
      event.messageID
    );
  }
};