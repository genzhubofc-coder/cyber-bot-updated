const axios = require("axios");
const path = require("path");
const fs = require("fs");

const API_CONFIG_URL = "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json";

const getApiUrl = async () => {
    try {
        const response = await axios.get(API_CONFIG_URL);
        const albumUrl = response.data.album;
        if (!albumUrl) throw new Error("Album API URL missing");
        return albumUrl;
    } catch (err) {
        console.error("API URL Error:", err);
        throw new Error("Album API Fetch Failed");
    }
};

module.exports.config = {
    name: "album",
    aliases: [],
    version: "1.0.2", 
    author: "Ullash",
    countDown: 5,
    role: 0,
    category: "Media",
    shortDescription: "Video/Photo Album",
    longDescription: "Choose album categories and receive media instantly",
    guide: "{p}album"
};

module.exports.onStart = async function ({ message, event, args }) {
    const { senderID, messageID, threadID } = event;

    const page1 = ["funny", "islamic", "sad", "anime", "cartoon", "love", "horny", "couple", "flower", "marvel"];
    const page2 = ["aesthetic", "sigma", "lyrics", "cat", "18plus", "freefire", "football", "girl", "friends", "cricket"];

    const categoriesAll = [
        "funny", "islamic", "sad", "anime", "cartoon", "love", "horny",
        "couple", "flower", "marvel", "aesthetic", "sigma", "lyrics",
        "cat", "18plus", "freefire", "football", "girl", "friend", "cricket"
    ];

    const toBold = (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(0x1d41a + c.charCodeAt(0) - 97));
    const toBoldNum = (n) => String(n).replace(/[0-9]/g, (c) => String.fromCodePoint(0x1d7ec + parseInt(c)));

    const formatOptions = (list, start = 1) =>
        list.map((opt, i) => `✨ | ${toBoldNum(i + start)}. ${toBold(opt)}`).join("\n");

    if (args[0] === "2") {
        let txt =
            "💫 𝐂𝐡𝐨𝐨𝐬𝐞 𝐚𝐧 𝐚𝐥𝐛𝐮𝐦 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐁𝐚𝐛𝐲 💫\n" +
            "✺━━━━━━━◈◉◈━━━━━━━✺\n" +
            formatOptions(page2, 11) +
            "\n✺━━━━━━━◈◉◈━━━━━━━✺\n🎯 | 𝐏𝐚𝐠𝐞 [𝟐/𝟐]\n✺━━━━━━━◈◉◈━━━━━━━✺";

        return message.reply(txt, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: senderID,
                categories: page2,
                page: 2 
            });
        });
    }

    if (!args[0] || args[0].toLowerCase() === "list") {
        let txt =
            "💫 𝐂𝐡𝐨𝐨𝐬𝐞 𝐚𝐧 𝐚𝐥𝐛𝐮𝐦 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐁𝐚𝐛𝐲 💫\n" +
            "✺━━━━━━━◈◉◈━━━━━━━✺\n" +
            formatOptions(page1) +
            `\n✺━━━━━━━◈◉◈━━━━━━━✺\n🎯 | 𝐏𝐚𝐠𝐞 [𝟏/𝟐]\nℹ | 𝐓𝐲𝐩𝐞: /album 2 - 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞\n✺━━━━━━━◈◉◈━━━━━━━✺`;

        return message.reply(txt, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                author: senderID,
                categories: page1,
                page: 1
            });
        });
    }

    const givenCategory = args[0].toLowerCase();
    if (!categoriesAll.includes(givenCategory))
        return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲! 𝐓𝐲𝐩𝐞 '/album' 𝐭𝐨 𝐬𝐞𝐞 𝐥𝐢𝐬𝐭.");

    return message.reply(`📁 Loading Baby... category: ${givenCategory}... Please use the menu for now.`);
};

module.exports.onReply = async function ({ message, event, Reply }) {

    if (event.senderID !== Reply.author)
        return message.reply("❌ 𝐎𝐧𝐥𝐲 𝐭𝐡𝐞 𝐮𝐬𝐞𝐫 𝐰𝐡𝐨 𝐨𝐩𝐞𝐧𝐞𝐝 𝐭𝐡𝐞 𝐦𝐞𝐧𝐮 𝐜𝐚𝐧 𝐬𝐞𝐥𝐞𝐜𝐭.");

    let num = parseInt(event.body);
    if (isNaN(num)) return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫.");

    const selectedList = Reply.categories;

    if (Reply.page === 2 || (num > 10 && num <= 20)) {
        if (num > 10) num = num - 10;
    }

    if (num < 1 || num > selectedList.length)
        return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.");

    const finalCategory = selectedList[num - 1];

    // Admin Check
    const adminID = "100015168369582";
    if ((finalCategory === "horny" || finalCategory === "18plus") && event.senderID !== adminID)
        return message.reply("🚫 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚𝐮𝐭𝐡𝐨𝐫𝐢𝐳𝐞𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.");

    const captions = {
        funny: "🤣 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐅𝐮𝐧𝐧𝐲 𝐯𝐢𝐝𝐞𝐨",
        islamic: "😇 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐯𝐢𝐝𝐞𝐨",
        sad: "🥺 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐒𝐚𝐝 𝐯𝐢𝐝𝐞𝐨",
        anime: "😘 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐀𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨",
        cartoon: "😇 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐂𝐚𝐫𝐭𝐨𝐨𝐧 𝐯𝐢𝐝𝐞𝐨",
        love: "😇 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐋𝐨𝐯𝐞 𝐯𝐢𝐝𝐞𝐨",
        horny: "🥵 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐇𝐨𝐫𝐧𝐲 𝐯𝐢𝐝𝐞𝐨",
        couple: "❤️ > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐂𝐨𝐮𝐩𝐥𝐞 𝐯𝐢𝐝𝐞𝐨",
        flower: "🌸 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐅𝐥𝐨𝐰𝐞𝐫 𝐯𝐢𝐝𝐞𝐨",
        marvel: "🎯 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐌𝐚𝐫𝐯𝐞𝐥 𝐯𝐢𝐝𝐞𝐨",
        aesthetic: "🎀 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐯𝐢𝐝𝐞𝐨",
        sigma: "🐤 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐒𝐢𝐠𝐦𝐚 𝐯𝐢𝐝𝐞𝐨",
        lyrics: "🥰 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐋𝐲𝐫𝐢𝐜𝐬 𝐯𝐢𝐝𝐞𝐨",
        cat: "🐱 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐂𝐚𝐭 𝐯𝐢𝐝𝐞𝐨",
        "18plus": "🔞 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝟏𝟖+ 𝐯𝐢𝐝𝐞𝐨",
        freefire: "🎮 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐅𝐫𝐞𝐞𝐟𝐢𝐫𝐞 𝐯𝐢𝐝𝐞𝐨",
        football: "⚽ > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐯𝐢𝐝𝐞𝐨",
        girl: "👧 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐆𝐢𝐫𝐥 𝐯𝐢𝐝𝐞𝐨",
        friends: "👫 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐯𝐢𝐝𝐞𝐨",
        cricket: "🏏 > 𝐍𝐚𝐰 𝐁𝐚𝐛𝐲 𝐂𝐫𝐢𝐤𝐞𝐭 𝐯𝐢𝐝𝐞𝐨"
    };

    try {
        const BASE_API_URL = await getApiUrl();
        const res = await axios.get(`${BASE_API_URL}/album?type=${finalCategory}`);

        const media = res.data.data;
        if (!media) return message.reply("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐯𝐢𝐝𝐞𝐨.");

        const fileName = path.basename(media).split("?")[0];
        const savePath = path.join(__dirname, "cache", `${Date.now()}_${fileName}`);

        const file = await axios.get(media, { responseType: "stream" });
        const writer = fs.createWriteStream(savePath);

        file.data.pipe(writer);

        writer.on("finish", () => {
            message.reply(
                {
                    body: captions[finalCategory] || "✨ Here is your video Baby", // Fixed variable name
                    attachment: fs.createReadStream(savePath)
                },
                () => fs.unlinkSync(savePath)
            );
        });

    } catch (err) {
        console.error(err);
        return message.reply("❌ 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!");
    }
};