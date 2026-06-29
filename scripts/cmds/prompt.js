const axios = require('axios');

const getApiBase = async () => {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json');
    return res.data.api2; 
  } catch (err) {
    console.error("Failed to fetch API JSON:", err);
    return null;
  }
};

module.exports.config = {
  name: "prompt",
  version: "6.9",
  credits: "dipto",
  countDown: 5,
  hasPermssion: 0,
  description: "image to prompt",
  category: "tools",
  commandCategory: "tools",
  usePrefix: true,
  prefix: true,
  usages: "reply [image]"
};

module.exports.onStart = async function({ api, event, args }) {
  const imgUrl = event.messageReply?.attachments?.[0]?.url || args.join(" ");
  if (!imgUrl) return api.sendMessage("Please reply to an image.", event.threadID, event.messageID);

  try {
    const apiBase = await getApiBase();
    if (!apiBase) return api.sendMessage("Failed to get API base URL.", event.threadID, event.messageID);

    const apiUrl = `${apiBase}/api/image-prompt?imageUrl=${encodeURIComponent(imgUrl)}`;
    const result = await axios.get(apiUrl);

    if (result.data?.status === true) {
      return api.sendMessage(result.data.response, event.threadID, event.messageID);
    } else {
      return api.sendMessage("API returned an error.", event.threadID, event.messageID);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage("Failed to convert image into text.", event.threadID, event.messageID);
  }
};