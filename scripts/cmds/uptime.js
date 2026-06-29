const moment = require("moment-timezone");
const axios = require("axios");
const pidusage = require("pidusage");
const { performance } = require("perf_hooks");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const os = require("os");

moment.tz.setDefault("Asia/Dhaka");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    version: "2.0.0",
    role: 0,
    credits: "MAHBUB ULLASH",
    description: "Shows bot uptime with text on custom secured image",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const timeStart = performance.now();
      const currentDate = moment().format("DD/MM/YYYY");

      const uptimeSec = process.uptime();
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);
      const uptimeText = `${h}h ${m}m ${s}s`;

      const timeEnd = performance.now();
      const ping = Math.round(timeEnd - timeStart);

      const cpuStat = await pidusage(process.pid);
      const cpuUsage = cpuStat.cpu.toFixed(1);

      const osType = os.type();
      const osRelease = os.release();
      const osText = `${osType} ${osRelease}`;

      function __lock(a) {
        return Buffer.from(a, "base64").toString("utf8");
      }

      const __A = "aHR0cHM6Ly9maWxlcy5jYXRib3gubW9lL3cxaWVxNS5qcGc=";

      const __B = (await axios.get(__lock(__A), { responseType: "arraybuffer" })).data;
      const __C = await loadImage(__B);
      const canvas = createCanvas(__C.width, __C.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(__C, 0, 0, __C.width, __C.height);

      const infoLines = [
        `Uptime : ${uptimeText}`,
        `Ping   : ${ping}ms`,
        `CPU    : ${cpuUsage}%`,
        `OS     : ${osText}`,
        `Date   : ${currentDate}`,
        `Owner  : Mahbub Ullash`
      ];

      const lineColors = [
        "#ff4b4b",
        "#00ffcc",
        "#ffd93d",
        "#4b7bff",
        "#ff6bff",
        "#00ff7f"
      ];

      ctx.font = "48px Sans-serif";
      ctx.lineWidth = 3;

      let posY = __C.height / 2 - 80;
      const posX = 50;

      for (let i = 0; i < infoLines.length; i++) {
        const line = infoLines[i];
        const color = lineColors[i % lineColors.length];

        ctx.fillStyle = color;
        ctx.strokeStyle = "black";
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;

        ctx.strokeText(line, posX, posY);
        ctx.fillText(line, posX, posY);

        posY += 55;
      }

      ctx.shadowBlur = 0;

      const finalBuffer = canvas.toBuffer("image/png");

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `uptime_${Date.now()}.png`);
      fs.writeFileSync(filePath, finalBuffer);

      return api.sendMessage(
        {
          body: "",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {}
        },
        event.messageID
      );

    } catch (err) {
      console.log("Uptime error:", err);
      return api.sendMessage(
        "❌ Error creating uptime image.",
        event.threadID,
        event.messageID
      );
    }
  }
};