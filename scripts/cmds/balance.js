module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "2.1",
    author: "NTKhang | modified by Ullash",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem số tiền hiện có của bạn hoặc người được tag",
      en: "view your money or the money of the tagged person"
    },
    category: "economy",
    guide: {
      vi: "   {pn}: xem số tiền của bạn\n   {pn} <@tag>: xem số tiền của người được tag",
      en: "   {pn}: view your money\n   {pn} <@tag>: view the money of the tagged person"
    }
  },

  langs: {
    vi: {
      money: "Bạn đang có %1$",
      moneyOf: "%1 đang có %2$"
    },
    en: {
      money: "You have %1$",
      moneyOf: "%1 has %2$"
    }
  },

  onStart: async function ({ message, usersData, event }) {
    const { senderID, mentions } = event;

    function formatBold(text) {
      const boldMap = {
        A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',
        N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
        a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',
        n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
        0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵',
      };
      return String(text).split("").map(c => boldMap[c] || c).join("");
    }

    function formatMoney(amount) {
      if (amount === undefined || amount === null) return "0";
      const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"];
      let tier = 0;
      let num = Number(amount);
      while (num >= 1000 && tier < suffixes.length - 1) {
        num /= 1000;
        tier++;
      }
      return num.toFixed(2).replace(/\.00$/, "") + " " + suffixes[tier];
    }

    async function getDisplayName(uid, fallback) {
      try {
        const userData = await usersData.get(uid);
        if (userData && userData.name) return userData.name;
      } catch (e) {}
      if (fallback) return fallback;
      return "Unknown";
    }

    try {
      if (Object.keys(mentions).length > 0) {
        let msg = "";
        const ids = Object.keys(mentions);

        for (const uid of ids) {
          const userData = await usersData.get(uid);
          const money = userData.money || 0;

          const nameRaw = await getDisplayName(uid, mentions[uid]?.replace(/@/g, ""));
          const boldName = /^[A-Za-z0-9\s]+$/.test(nameRaw) ? formatBold(nameRaw) : nameRaw;
          const boldMoney = formatBold(formatMoney(money));

          msg +=
            `💰 𝗕𝗮𝗹𝗮𝗻𝗰𝗲 𝗼𝗳 𝗠𝗲𝗻𝘁𝗶𝗼𝗻𝗲𝗱 𝗨𝘀𝗲𝗿:\n` +
            `𝗡𝗮𝗺𝗲: ${boldName}\n` +
            `𝗔𝗺𝗼𝘂𝗻𝘁: ${boldMoney}$ 💵\n\n`;
        }

        return message.reply(msg.trim());
      }

      const userData = await usersData.get(senderID);
      const money = userData.money || 0;

      const nameRaw = await getDisplayName(senderID);
      const boldName = /^[A-Za-z0-9\s]+$/.test(nameRaw) ? formatBold(nameRaw) : nameRaw;
      const boldMoney = formatBold(formatMoney(money));

      const msg =
        `💰 𝗬𝗼𝘂𝗿 𝗕𝗮𝗹𝗮𝗻𝗰𝗲:\n` +
        `𝗡𝗮𝗺𝗲: ${boldName}\n` +
        `𝗔𝗺𝗼𝘂𝗻𝘁: ${boldMoney}$ 💵`;

      return message.reply(msg);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ (system error).");
    }
  }
};