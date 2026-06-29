module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "gok gok ",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "hello goatbot inbox no prefix file enjoy the cmmand"
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("✅ SUCCESSFULLY SEND MSG\n\n🔰তোর ইনবক্স চেক কর , গালি দিছি 🐸🤝", event.threadID);
      api.sendMessage("✅ SUCCESSFULLY ALLOW\n🔰 কিরে বোকাচোদা ইনবক্স এ আসতে বললি কেনো ,কি বলবি বল 🙂", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}