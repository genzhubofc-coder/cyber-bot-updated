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

module.exports = {
  config: {
    name: "top",
    aliases: ["rich", "leaderboard", "coinstop"],
    version: "2.0.0",
    author: "MAHBUB ULLASH",
    countDown: 5,
    role: 0,
    shortDescription: "Show top 15 richest users",
    longDescription: "Show top 15 richest users from local database",
    category: "economy",
    guide: "{p}top"
  },

  onStart: async function ({ message, usersData }) {
    try {
      const allUsers = await usersData.getAll();

      if (!allUsers || allUsers.length === 0) {
        return message.reply("📛 এখনো কোনো ইউজারের ব্যালেন্স নেই!");
      }

      allUsers.sort((a, b) => (b.money || 0) - (a.money || 0));

      let msg = "💸 𝗧𝗼𝗽 𝟭𝟱 𝗥𝗶𝗰𝗵𝗲𝘀𝘁 𝗨𝘀𝗲𝗿𝘀 💸\n";
      msg += "━━━━━━━━━━━━━━━\n";

      let count = 0;
      for (const user of allUsers) {
        if (count >= 15) break;

        const uid = user.userID;
        let name = user.name || "Unknown";

        if (!name) name = "Unknown";

        let boldName = /^[A-Za-z0-9\s]+$/.test(name) ? formatBold(name) : name;

        const moneyVal = user.money || 0;
        const moneyFormatted = formatMoney(moneyVal);
        const boldMoney = formatBold(moneyFormatted + " $");

        msg += `${count + 1}. ${boldName} — ${boldMoney}\n`;
        count++;
      }

      return message.reply(msg);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ টপ লিস্ট লোড করতে সমস্যা হচ্ছে (system error).");
    }
  }
};