module.exports = {
  config: {
    name: "dice",
    version: "2.1.0",
    author: "MAHBUB ULLASH",
    countDown: 5,
    role: 0,
    description: {
      en: "Dice game with jackpot (10x) and updated probabilities."
    },
    category: "game",
    guide: {
      en: "{p}dice <amount>"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply("❌ Please enter a valid amount to bet.");
    }
    if (bet < 50) {
      return message.reply("❌ Minimum bet is 50$");
    }

    try {
      const userData = await usersData.get(senderID);
      const money = userData.money || 0;

      if (money < bet) {
        return message.reply("❌ You don't have enough balance to bet!");
      }

      // =======================================================
      // 🎲 PROBABILITY SYSTEM 
      //
      // Lose:     40%
      // Win:      45%
      // Draw:     10%
      // Jackpot:  5%
      // =======================================================

      const r = Math.random();
      let outcome;

      if (r < 0.40) outcome = "lose";
      else if (r < 0.85) outcome = "win";
      else if (r < 0.95) outcome = "draw";
      else outcome = "jackpot";

      let userRoll, botRoll;
      let delta = 0;
      let result = "";

      if (outcome === "jackpot") {
        userRoll = 6;
        botRoll = 1;
        delta = bet * 10;

        result =
          `🎲 𝗬𝗼𝘂𝗿 𝗥𝗼𝗹𝗹: 6\n` +
          `🤖 𝗕𝗼𝘁'𝘀 𝗥𝗼𝗹𝗹: 1\n` +
          `🎉 𝗝𝗔𝗖𝗞𝗣𝗢𝗧!! 𝗬𝗼𝘂 𝗪𝗼𝗻 +${bet * 10}$ 🔥🔥🔥`;
      }

      else if (outcome === "win") {
        botRoll = randomInt(1, 4);
        userRoll = randomInt(botRoll + 1, 6);
        delta = bet;

        result =
          `🎲 𝗬𝗼𝘂𝗿 𝗥𝗼𝗹𝗹: ${userRoll}\n` +
          `🤖 𝗕𝗼𝘁'𝘀 𝗥𝗼𝗹𝗹: ${botRoll}\n` +
          `✅ 𝗬𝗼𝘂 𝗪𝗼𝗻 +${bet}$!`;
      }

      else if (outcome === "draw") {
        userRoll = botRoll = randomInt(1, 6);
        delta = 0;

        result =
          `🎲 𝗬𝗼𝘂𝗿 𝗥𝗼𝗹𝗹: ${userRoll}\n` +
          `🤖 𝗕𝗼𝘁'𝘀 𝗥𝗼𝗹𝗹: ${botRoll}\n` +
          `🔁 𝗜𝘁'𝘀 𝗮 𝗗𝗿𝗮𝘄! 𝗡𝗼 𝗰𝗵𝗮𝗻𝗴𝗲 𝗶𝗻 𝗯𝗮𝗹𝗮𝗻𝗰𝗲.`;
      }

      else if (outcome === "lose") {
        userRoll = randomInt(1, 5);
        botRoll = randomInt(userRoll + 1, 6);
        delta = -bet;

        result =
          `🎲 𝗬𝗼𝘂𝗿 𝗥𝗼𝗹𝗹: ${userRoll}\n` +
          `🤖 𝗕𝗼𝘁'𝘀 𝗥𝗼𝗹𝗹: ${botRoll}\n` +
          `❌ 𝗬𝗼𝘂 𝗟𝗼𝘀𝘁 -${bet}$`;
      }

      // 💰 Update money (normal usersData system)
      if (delta !== 0) {
        await usersData.set(senderID, {
          money: money + delta
        });
      }

      return message.reply(result);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Dice game এ সমস্যা হচ্ছে (system error).");
    }
  }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}