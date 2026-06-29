const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "kiss",
    version: "1.0.13",
    author: "Rakib Adil",
    countDown: 5,
    role: 0,
    longDescription: "{p}kiss @mention or reply someone you want to kiss that person 😚",
    category: "funny",
    guide: "{p}kiss and mention someone you want to kiss 🥴",
    usePrefix: true,
    premium: false,
    notes: "If you change the author then the command will not work and not usable"
  },

  onStart: async function ({ api, message, event }) {
    const owner = module.exports.config;
    const eAuth = "UmFraWIgQWRpbA==";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");

    if (owner.author !== dAuth)
      return message.reply(
        "you've changed the author name, please set it to default (Rakib Adil) otherwise this command will not work.🙂"
      );

    const one = event.senderID;

    let two;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      two = Object.keys(event.mentions)[0];
    } else {
      return message.reply(
        "please mention or reply someone message to kiss him/her 🌚"
      );
    }

    try {
      const avatar1Data = (
        await axios.get(
          `https://graph.facebook.com/${one}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avatar2Data = (
        await axios.get(
          `https://graph.facebook.com/${two}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const avatar1 = await loadImage(avatar1Data);
      const avatar2 = await loadImage(avatar2Data);

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(
        "https://files.catbox.moe/6qg782.jpg"
      );
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.beginPath();
      ctx.arc(725, 250, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 640, 170, 170, 170);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 370, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 90, 280, 170, 170);
      ctx.restore();

      const outputPath = `${__dirname}/tmp/kiss_image.png`;
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: "Ummmmaaaaahhh! 😽😘",
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error(error);
      message.reply("an error occurred, please try again later.🐸");
    }
  }
};