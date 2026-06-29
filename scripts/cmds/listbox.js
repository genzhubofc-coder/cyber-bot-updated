module.exports = {
  config: {
    name: "listbox",
    aliases: [],
    author: "Xten",
    version: "2.0",
    cooldowns: 5,
    role: 2,
    shortDescription: {
      en: "List all group chats the bot is in."
    },
    longDescription: {
      en: "Use this command to list all group chats the bot is currently in."
    },
    category: "owner",
    guide: {
      en: "{p}{n}"
    }
  },

  onStart: async function ({ api, event }) {
    try {

      // Fetch threads
      const groupList = await api.getThreadList(100, null, ["INBOX"]);

      // Filter groups only (isGroup === true)
      const filtered = groupList.filter(g => g.isGroup);

      if (filtered.length === 0) {
        return api.sendMessage("No group chats found.", event.threadID);
      }

      // Fix: Use group.name instead of group.threadName
      const finalList = filtered.map((g, i) =>
        `│${i + 1}. ${g.name || "Unknown Group"}\n│𝚃𝙸𝙳: ${g.threadID}`
      );

      const message =
        `╭─────❃\n` +
        `│𝙻𝙸𝚂𝚃 𝙾𝙵 𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃𝚂:\n` +
        finalList.join("\n") +
        `\n╰────────────✦`;

      api.sendMessage(message, event.threadID, event.messageID);

    } catch (e) {
      console.error("Error listing group chats", e);
    }
  }
};