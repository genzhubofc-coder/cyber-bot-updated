const moment = require("moment-timezone");

module.exports = {
    config: {
        name: "autoazan",
        version: "11.0",
        author: "Gemini",
        countDown: 0,
        role: 0,
        category: "system",
        shortDescription: "Short & Clean Auto Azan",
        guide: "{pn} test"
    },

    onLoad: async function ({ api }) {
        if (!global.autoAzanShort) {
            console.log("[ AUTO-AZAN ] System Started.");

            global.autoAzanShort = setInterval(async () => {
                const now = moment().tz("Asia/Dhaka");
                const currentTime = now.format("HH:mm");

                // বাংলাদেশের গড় আজানের সময় (Standard Average Times)
                const azanTimes = {
                    "04:45": "ফজর",
                    "13:00": "জোহর",
                    "16:45": "আসর",
                    "18:40": "মাগরিব",
                    "20:00": "এশা"
                };

                if (azanTimes[currentTime]) {
                    if (global.lastAzanSent === currentTime) return;
                    
                    const azanName = azanTimes[currentTime];
                    const msg = createAzanMsg(azanName);

                    try {
                        const threads = await api.getThreadList(50, null, ["INBOX"]);
                        const groups = threads.filter(t => t.isGroup && t.isArchived == false);
                        
                        for (const group of groups) {
                            api.sendMessage(msg, group.threadID);
                        }
                        global.lastAzanSent = currentTime; 
                    } catch (err) {
                        console.log("Azan Alert Error:", err.message);
                    }
                }
            }, 30000); 
        }
    },

    onStart: async function ({ api, event, args, message }) {
        if (args[0] === "test") {
            const testMsg = createAzanMsg("মাগরিব (টেস্ট)");
            return message.reply(testMsg);
        }
        
        return message.reply("অটোমেটিক আজান সিস্টেম সচল আছে। টেস্ট করতে লিখুন: .autoazan test");
    }
};

// ছোট ও সুন্দর মেসেজ ফরম্যাট
function createAzanMsg(azanName) {
    let extra = azanName === "ফজর" ? "আস-সালাতু খাইরুম মিনান নাউম।\n" : "";
    return `🕋 *নামাজের সময় সতর্কতা* 🕋\n` +
           `━━━━━━━━━━━━━━━━━━\n` +
           `${extra}এখন *${azanName}* নামাজের আজান দেওয়ার সময় হয়েছে।\n\n` +
           `সব কাজ ছেড়ে দ্রুত নামাজের প্রস্তুতি নিন। আল্লাহ আমাদের সহায় হোন। (আমিন) 🤲\n` +
           `━━━━━━━━━━━━━━━━━━`;
}
