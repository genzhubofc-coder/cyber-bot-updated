const axios = require('axios');
const availableCmdsUrl = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/availableCmds.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/cmdUrls.json";
const ITEMS_PER_PAGE = 10;

module.exports.config = {
    name: "cmdstore",
    aliases: ["cs", "cmds"],
    version: "7.0",
    author: "Dipto + Fixed by Ullash",
    description: "Command Store",
    category: "store"
};

// =========================
// 🟦 onStart (Main command)
// =========================
module.exports.onStart = async function ({ api, event, args }) {

    const query = args.join(" ").trim().toLowerCase();

    try {
        const response = await axios.get(availableCmdsUrl);
        let cmds = response.data.cmdName;
        let finalArray = cmds;
        let page = 1;

        if (query) {
            if (!isNaN(query)) {
                page = parseInt(query);
            } else if (query.length === 1) {
                finalArray = cmds.filter(cmd => cmd.cmd.startsWith(query));
                if (!finalArray.length)
                    return api.sendMessage(`❌ | No commands found starting with "${query}".`, event.threadID);
            } else {
                finalArray = cmds.filter(cmd => cmd.cmd.includes(query));
                if (!finalArray.length)
                    return api.sendMessage(`❌ | Command "${query}" not found.`, event.threadID);
            }
        }

        const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
        if (page < 1 || page > totalPages)
            return api.sendMessage(`❌ | Invalid page number (1-${totalPages}).`, event.threadID);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const cmdsToShow = finalArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        let msg = `╭───✦ Cmd Store ✦───╮
│ Page: ${page}/${totalPages}
│ Total: ${finalArray.length} Commands\n`;

        cmdsToShow.forEach((cmd, i) => {
            msg += `│ ${startIndex + i + 1}. ${cmd.cmd}
│ AUTHOR: ${cmd.author}
│ UPDATE: ${cmd.update || "N/A"}\n`;
        });

        msg += `╰─────────────⧕`;

        api.sendMessage(msg, event.threadID, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "select",
                author: event.senderID,
                page,
                cmdList: finalArray
            });
        });

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ | Failed to load command list.", event.threadID);
    }
};


// =========================
// 🟨 onReply (when user replies number)
// =========================
module.exports.onReply = async function ({ api, event, Reply }) {

    if (event.senderID !== Reply.author)
        return api.sendMessage("❌ | You are not allowed to reply.", event.threadID);

    const number = parseInt(event.body);
    const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, Reply.cmdList.length);

    if (isNaN(number) || number < startIndex + 1 || number > endIndex)
        return api.sendMessage(`❌ | Reply a number between ${startIndex + 1} and ${endIndex}`, event.threadID);

    try {
        const selected = Reply.cmdList[number - 1];
        const cmdName = selected.cmd;

        const response = await axios.get(cmdUrlsJson);
        const cmdUrl = response.data[cmdName];

        if (!cmdUrl)
            return api.sendMessage("❌ | Command URL not found.", event.threadID);

        await api.unsendMessage(event.messageReply.messageID);

        const msg = `╭───────⭓
│ STATUS: ${selected.status || "N/A"}
│ URL: ${cmdUrl}
╰─────────────⭓`;

        return api.sendMessage(msg, event.threadID);

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ | Failed to load command URL.", event.threadID);
    }
};