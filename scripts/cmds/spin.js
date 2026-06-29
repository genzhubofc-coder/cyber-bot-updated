const axios = require("axios");
const API_BASE = "https://bank-game-api.cyberbot.top";

module.exports = {
  config: {
    name: "spin",
    aliases: ["spinwheel", "roulette"],
    version: "3.0",
    author: "Nisanxnx | customised by MAHBUB ULLASH",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Spin and win coins (API)" },
    longDescription: { en: "Bet coins, spin the wheel, and win/lose (API-based)" },
    category: "game",
    guide: { en: "{p}spin <amount>" }
  },

  onStart: async function ({ message, event, args, api }) {
    const uid = event.senderID;
    const bet = parseInt(args[0]);

    if (!bet || isNaN(bet) || bet <= 0) return message.reply("❌ Enter a valid bet. Example: spin 50");
    if (bet < 50) return message.reply("❌ Minimum bet is 50$.");

    try {
      const resUser = await axios.get(`${API_BASE}/users/${uid}`);
      const balance = resUser.data?.money || 0;

      if (balance < bet) return message.reply(`❌ Not enough balance. Your balance: ${balance}$`);

      const outcomes = [
        { label: "JACKPOT", multiplier: 3.0, chance: 5 },   
        { label: "WIN",     multiplier: 2.0, chance: 10 },  
        { label: "WIN",     multiplier: 1.5, chance: 15 },  
        { label: "REFUND",  multiplier: 1.0, chance: 10 },  
        { label: "LOSE",    multiplier: 0.5, chance: 25 },  
        { label: "LOSE",    multiplier: 0.0, chance: 35 }   
      ];

      const spin = pickByChance(outcomes);
      const payout = Math.floor(bet * spin.multiplier);
      const delta = payout - bet; 

      const resDelta = await axios.post(`${API_BASE}/users/${uid}/balance/delta`, { delta });
      const newBalance = resDelta.data?.money ?? (balance + delta);

      const badge =
        spin.label === "JACKPOT" ? "🏆 JACKPOT!" :
        spin.label === "WIN" ? "✅ WIN" :
        spin.label === "REFUND" ? "🔁 REFUND" :
        "❌ LOSE";

      const finalText =
        `🎡 SPIN WHEEL\n` +
        `━━━━━━━━━━━━━━━\n` +
        `Result: ${badge}\n` +
        `Bet: ${bet}$\n` +
        `Payout: ${payout}$\n` +
        `Balance: ${newBalance}$`;

      const m1 = "🔲⏳🔲⏳";
      const m2 = "🎡⏳🔲⏳";
      const m3 = "🎡🎡🔲⏳";
      const m4 = `🎡🎡🎡⏳`;

      const sent = await message.reply(m1);
      const msgID = sent.messageID;

      setTimeout(() => safeEdit(api, msgID, m2), 500);
      setTimeout(() => safeEdit(api, msgID, m3), 1000);
      setTimeout(() => safeEdit(api, msgID, m4), 1500);
      setTimeout(() => safeEdit(api, msgID, finalText, () => message.reply(finalText)), 2000);

    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Spin failed (API error).");
    }
  }
};

function pickByChance(items) {
  const total = items.reduce((s, x) => s + (x.chance || 0), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.chance;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function safeEdit(api, messageID, text, fallback) {
  try {
    api.editMessage(text, messageID, (err) => {
      if (err && typeof fallback === "function") fallback();
    });
  } catch (e) {
    if (typeof fallback === "function") fallback();
  }
}