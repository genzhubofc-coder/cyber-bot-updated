const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "profile",
    aliases: ["pp", "pfp"],
    version: "1.2",
    author: "NIB (fixed by Mahbub Ullash)",
    countDown: 5,
    role: 0,
    shortDescription: "Facebook profile picture",
    longDescription: "See anyone's Facebook profile picture (self/reply/mention/link).",
    category: "image",
    guide: {
      en: "{pn} [reply/@mention/link]"
    }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    try {
      let uid;

      if (event.type === "message_reply" && event.messageReply?.senderID) {
        uid = event.messageReply.senderID;
      }

      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      }

      else if (args[0] && args[0].includes(".com/")) {
        uid = await api.getUID(args[0]);
      }

      else {
        uid = event.senderID;
      }

      const name = await usersData.getName(uid);

      const imageUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      return message.reply({
        body: ` `,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      });
    } catch (e) {
      return message.reply("⚠️");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
