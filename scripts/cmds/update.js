const axios = require("axios");
const fs = require("fs-extra");
const execSync = require("child_process").execSync;
const dirBootLogTemp = `${__dirname}/tmp/rebootUpdated.txt`;

module.exports = {
        config: {
                name: "update",
                version: "2.4.67",
                author: "ST | Sheikh Tamim",
                role: 2,
                description: {
                        en: "Check for and install updates for the chatbot.",
                        vi: "Kiểm tra và cài đặt phiên bản mới nhất của chatbot trên GitHub."
                },
                category: "owner",
                guide: {
                        en: "   {pn}\n   {pn} refuse - Temporarily refuse update and allow bot to work normally for 2 hours",
                        vi: "   {pn}\n   {pn} refuse - Từ chối cập nhật tạm thời và cho phép bot hoạt động bình thường trong 2 giờ"
                }
        },

        langs: {
                vi: {
                        noUpdates: "✅ | Bạn đang sử dụng phiên bản mới nhất của GoatBot V2 (v%1).",
                        updatePrompt: "💫 | Bạn đang sử dụng phiên bản %1. Hiện tại đã có phiên bản %2. Bạn có muốn cập nhật chatbot lên phiên bản mới nhất không?"
                                + "\n\n⬆️ | Các tệp sau sẽ được cập nhật:"
                                + "\n%3%4"
                                + "\n\nℹ️ | Xem chi tiết tại https://github.com/sheikhtamimlover/ST-BOT/commits/main"
                                + "\n💡 | Thả cảm xúc bất kỳ vào tin nhắn này để xác nhận",
                        fileWillDelete: "\n🗑️ | Các tệp/thư mục sau sẽ bị xóa:\n%1",
                        andMore: " ...và %1 tệp khác",
                        updateConfirmed: "🚀 | Đã xác nhận, đang cập nhật...",
                        updateComplete: "✅ | Cập nhật thành công, bạn có muốn khởi động lại chatbot ngay bây giờ không (phản hồi tin nhắn với nội dung \"yes\" hoặc \"y\" để xác nhận).",
                        updateTooFast: "⭕ Vì bản cập nhật gần nhất được thực phát hành cách đây %1 phút %2 giây nên không thể cập nhật. Vui lòng thử lại sau %3 phút %4 giây nữa để cập nhật không bị lỗi.",
                        botWillRestart: "🔄 | Bot sẽ khởi động lại ngay!",
                        mediaLoadError: "⚠️ | Không thể tải một số tệp media từ bản cập nhật"
                },
                en: {
                        noUpdates: "✅ | You are using the latest version of ST | BOT (v%1).",
                        refuseSuccess: "✅ | Update requirement temporarily disabled for 2 hours. Bot will work normally.",
                        noUpdateToRefuse: "⚠️ | No pending update to refuse.",
                        updatePrompt: "💫 | You are using version %1. There is a new version %2. Do you want to update the chatbot to the latest version?"
                                + "\n\n⬆️ | The following files will be updated:"
                                + "\n%3%4"
                                + "\n\nℹ️ | See details at https://github.com/sheikhtamimlover/ST-BOT/commits/main"
                                + "\n💡 | React to this message to confirm.",
                        fileWillDelete: "\n🗑️ | The following files/folders will be deleted:\n%1",
                        andMore: " ...and %1 more files",
                        updateConfirmed: "🚀 | Confirmed, updating...",
                        updateComplete: "✅ | Update complete, do you want to restart the chatbot now (reply with \"yes\" or \"y\" to confirm)?",
                        updateTooFast: "⭕ Because the latest update was released %1 minutes %2 seconds ago, you can't update now. Please try again after %3 minutes %4 seconds to avoid errors.",
                        botWillRestart: "🔄 | The bot will restart now!",
                        mediaLoadError: "⚠️ | Failed to load some media files from update"
                }
        },

        onLoad: async function ({ api }) {
                if (fs.existsSync(dirBootLogTemp)) {
                        const threadID = fs.readFileSync(dirBootLogTemp, "utf-8");
                        fs.removeSync(dirBootLogTemp);
                        api.sendMessage("The chatbot has been restarted.", threadID);
                }
        },

        ST: async function ({ message, getLang, commandName, event, args }) {

                if (global.updateNotificationSent && global.updateNotificationSent.admins) {
                        global.updateNotificationSent.admins.delete(event.senderID);
                }

                if (args[0] && (args[0].toLowerCase() === 'refuse' || args[0].toLowerCase() === 'r')) {
                        if ((global.updateAvailable && global.updateAvailable.hasUpdate) || (global.GoatBot.updateAvailable && global.GoatBot.updateAvailable.hasUpdate)) {

                                const refuseUntil = Date.now() + (2 * 60 * 60 * 1000);
                                global.updateRefuseUntil = refuseUntil;
                                global.GoatBot.updateRefuseUntil = refuseUntil;

                                if (global.updateAvailable) global.updateAvailable.hasUpdate = false;
                                if (global.GoatBot.updateAvailable) global.GoatBot.updateAvailable.hasUpdate = false;

                                global.updateNotificationSent = { users: new Set(), admins: new Set() };

                                return message.reply(
                                        `✅ Update Requirement Temporarily Disabled\n\n` +
                                        `⏰ Bot will work normally for the next 2 hours.\n` +
                                        `📅 Enforcement resumes at: ${new Date(refuseUntil).toLocaleString()}\n\n` +
                                        `💡 Use ${global.GoatBot.config.prefix}update anytime to update immediately.`
                                );
                        }
                        return message.reply("⚠️ No pending update to refuse.");
                }

                // ===== FIX HERE =====
                let version, versionsRaw;
                try {
                        const pkgRes = await axios.get("https://raw.githubusercontent.com/cyber-ullash/CYBER-GOAT-BOT/refs/heads/main/package.json");
                        version = pkgRes.data.version;
                        const verRes = await axios.get("https://raw.githubusercontent.com/cyber-ullash/CYBER-GOAT-BOT/refs/heads/main/versions.json");
                        versionsRaw = verRes.data;
                } catch (e) {
                        return message.reply("⚠️ Update server is currently unavailable. Please try again later.");
                }

                const versions = Array.isArray(versionsRaw) ? versionsRaw : [versionsRaw];
                // ======================

                const currentVersion = require("../../package.json").version;

                if (compareVersion(version, currentVersion) < 1)
                        return message.reply(getLang("noUpdates", currentVersion));

                const newVersions = versions.slice(
                        Math.max(versions.findIndex(v => v.version == currentVersion), -1) + 1
                );

                let fileWillUpdate = [...new Set(newVersions.map(v => Object.keys(v.files || {})).flat())]
                        .sort()
                        .filter(f => f?.length);

                const totalUpdate = fileWillUpdate.length;

                fileWillUpdate = fileWillUpdate.slice(0, 10).map(f => ` - ${f}`).join("\n");

                let fileWillDelete = [...new Set(newVersions.map(v => Object.keys(v.deleteFiles || {}).flat()))]
                        .sort()
                        .filter(f => f?.length);

                const totalDelete = fileWillDelete.length;

                fileWillDelete = fileWillDelete.slice(0, 10).map(f => ` - ${f}`).join("\n");

                const versionNotes = newVersions
                        .filter(v => v.note)
                        .map(v => `📝 v${v.version}: ${v.note}`)
                        .join('\n');

                const notesSection = versionNotes ? `\n\n📋 What's New:\n${versionNotes}` : '';

                const allMediaUrls = [
                        ...newVersions.flatMap(v => v.imageUrl || []),
                        ...newVersions.flatMap(v => v.videoUrl || []),
                        ...newVersions.flatMap(v => v.audioUrl || [])
                ];

                const attachments = [];

                for (const url of allMediaUrls.slice(0, 10)) {
                        try {
                                const res = await axios.get(url, { responseType: "stream" });
                                attachments.push(res.data);
                        } catch {}
                }

                const messageOptions = {
                        body: getLang(
                                "updatePrompt",
                                currentVersion,
                                version,
                                fileWillUpdate + (totalUpdate > 10 ? "\n" + getLang("andMore", totalUpdate - 10) : ""),
                                totalDelete > 0 ? "\n" + getLang("fileWillDelete", fileWillDelete) : ""
                        ) + notesSection,
                        attachment: attachments
                };

                message.reply(messageOptions, (err, info) => {
                        if (err) return console.error(err);

                        global.GoatBot.onReaction.set(info.messageID, {
                                messageID: info.messageID,
                                threadID: info.threadID,
                                authorID: event.senderID,
                                commandName
                        });
                });
        },

        onReaction: async function ({ message, getLang, Reaction, event }) {
                if (event.userID != Reaction.authorID) return;

                await message.reply(getLang("updateConfirmed"));

                execSync("node updater", { stdio: "inherit" });

                fs.writeFileSync(dirBootLogTemp, event.threadID);

                message.reply(getLang("updateComplete"), (err, info) => {
                        if (err) return console.error(err);
                        global.GoatBot.onReply.set(info.messageID, { authorID: event.senderID });
                });
        },

        onReply: async function ({ message, getLang, event }) {
                if (['yes', 'y'].includes(event.body?.toLowerCase())) {
                        await message.reply(getLang("botWillRestart"));
                        process.exit(2);
                }
        }
};

function compareVersion(v1, v2) {
        const a = v1.split(".");
        const b = v2.split(".");
        for (let i = 0; i < 3; i++) {
                if (+a[i] > +b[i]) return 1;
                if (+a[i] < +b[i]) return -1;
        }
        return 0;
}
