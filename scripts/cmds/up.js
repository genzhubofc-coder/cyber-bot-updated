const os = require("os");

if (!global.botStartTime) global.botStartTime = Date.now();

function formatDuration(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function createProgressBar(percentage, length = 20) {
  const filled = Math.round((percentage / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  config: {
    name: "up",
    version: "3.5",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ",
    countDown: 5,
    role: 0,
    description: "Check bot uptime with full system + VPS details",
    category: "system",
  },

  onStart: async function ({ api, event }) {
    try {
      const msg = await api.sendMessage("⚡ 𝘊𝘩𝘦𝘬𝘪𝘯𝘨 𝘜𝘱𝘵𝘪𝘮𝘦 𝘚𝘵𝘢𝘵𝘶𝘴👾", event.threadID);

      const steps = [20, 40, 60, 80, 100];
      const delayMs = 1000;

      for (let i = 0; i < steps.length; i++) {
        const percent = steps[i];
        if (percent < 100) {
          const body = `⏳ 𝘓𝘰𝘢𝘥𝘪𝘯𝘨...\n\n[${createProgressBar(percent)}] ${percent}%`;
          await api.editMessage(body, msg.messageID);
          await sleep(delayMs);
        } else {
          // System stats
          const uptime = formatDuration(Date.now() - global.botStartTime);
          const cpuUsage = os.loadavg()[0].toFixed(2);
          const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
          const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
          const platform = os.platform();
          const startTime = new Date(global.botStartTime).toLocaleString();
          const hostname = os.hostname();
          const netInterfaces = os.networkInterfaces();
          let ipAddr = "N/A";
          for (const name of Object.keys(netInterfaces)) {
            for (const net of netInterfaces[name]) {
              if (net.family === "IPv4" && !net.internal) {
                ipAddr = net.address;
                break;
              }
            }
          }

          const finalMsg =
`✨ ${global.GoatBot.config.nickNameBot} 𝗨𝗽𝘁𝗶𝗺𝗲 ✨
[${createProgressBar(100)}] 100% ✅

⏳ Uᴘᴛɪᴍᴇ: ${uptime}
💻 Cᴘᴜ Lᴏᴀᴅ: ${cpuUsage}
📦 Mᴇᴍᴏʀʏ: ${usedMem} / ${totalMem} MB
🖥 Pʟᴀᴛғᴏʀᴍ: ${platform}
🚀 Bᴏᴛ Aᴄᴛɪᴠᴇᴛᴇᴅ: ${startTime}

👑 Oᴡɴᴀʀ: SA K IB
📡 ʜᴏsᴛ: ${hostname}
🌐 Iᴘ Aᴅʀᴇss: ${ipAddr}`;

          await api.editMessage(finalMsg, msg.messageID);
        }
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠ Failed to check uptime!", event.threadID);
    }
  },
};
