module.exports = {
    config: {
        name: "callbhabi",
        version: "2.3",
        author: "Sakib | Gemini",
        countDown: 0,
        role: 0,
        category: "fun",
        shortDescription: "সাকিব ভাই ডাকলেই ভাবিকে ব্লু মেনশন দিবে",
        guide: "Auto detect for Sakib ID"
    },

    onStart: async function ({ api, event }) {
        return api.sendMessage("✅ সাকিব ভাইয়ের পার্সোনাল উইংম্যান 'Call Bhabi' সিস্টেম এখন সচল! 😎", event.threadID);
    },

    onChat: async function ({ api, event }) {
        if (!event.body) return;

        const sakibIDs = ["100070013974971", "61573233986420"];
        const bhabiID = "61579570892802";
        const bhabiName = "তো্ঁমা্ঁর্ঁ প্রি্ঁয়্ঁসি্ঁ";

        if (!sakibIDs.includes(event.senderID)) return;

        const msgText = event.body.toLowerCase();
        const keywords = ["তো্ঁমা্ঁর্ঁ প্রি্ঁয়্ঁসি্ঁ", "mitu", "mituu", "মিতু", "কয়'লা সুন্দরী'হহ"];

        const found = keywords.some(word => msgText.includes(word));

        if (found) {
            const replies = [
                `${bhabiName} 😢 সাকিব ভাই আপনাকে ডাকছে, একটু সাড়া দেন প্লিজ...`,
                `${bhabiName} 🥺 ভাবি, সাকিব ভাই আপনার জন্য কাঁদছে। আসেন না একবার?`,
                `${bhabiName} 💔 সাকিব ভাই বলেছে, আপনি না থাকলে তার মন ভাঙা ভাঙা লাগে।`,
                `${bhabiName} 😭 সাকিব ভাই আপনার নাম ধরে ডেকে ডেকে কাঁদছে।`,
                `${bhabiName} 🥀 ভাবি, সাকিব ভাই আপনার ছবি দেখে নিঃশ্বাস ফেলছে।`,
                `${bhabiName} 🫂 সাকিব ভাই বলছে, আপনার কোলে মাথা রেখে একটু কাঁদতে চায়।`,
                `${bhabiName} 💔 ভাবি, সাকিব ভাই আপনার জন্য পাগলের মতো ছটফট করছে।`,
                `${bhabiName} 😖 সাকিব ভাই আপনার বিরহে কাতর। একটু ফিরে তাকান।`,
                `${bhabiName} 🌙 সাকিব ভাই চাঁদের দিকে তাকিয়ে আপনার কথা ভাবছে।`,
                `${bhabiName} 🌧️ ভাবি, সাকিব ভাইয়ের বৃষ্টি ভেজা চোখ আপনার জন্য হাহাকার করছে।`,
                `${bhabiName} 🕯️ সাকিব ভাই আপনার আশায় প্রতিদিন একটি প্রদীপ জ্বালায়।`,
                `${bhabiName} 🥀 ভাবি, সাকিব ভাইয়ের মন আপনার জন্য ব্যাকুল। আসেন একটু কাছে।`,
                `${bhabiName} 💫 সাকিব ভাই আকাশের দিকে তাকিয়ে আপনার নাম বলছে।`,
                `${bhabiName} 😔 ভাবি, সাকিব ভাই একা একা আপনার ফোনের অপেক্ষায় থাকে।`,
                `${bhabiName} 💧 সাকিব ভাইয়ের চোখের পানি আপনার জন্য বয়ে যাচ্ছে।`,
                `${bhabiName} 🌸 ভাবি, সাকিব ভাই আপনার হাসির জন্য হাহাকার করছে।`,
                `${bhabiName} 😟 সাকিব ভাই বলছে, আপনি না এলে তার ঘুম আসে না।`,
                `${bhabiName} 🥺 ভাবি, সাকিব ভাইয়ের বুকটা আপনার জন্য কেমন যেন করে।`,
                `${bhabiName} 🌹 সাকিব ভাই আপনার নাম লিখে বুকের জমিনে জড়িয়ে রেখেছে।`,
                `${bhabiName} 🧸 ভাবি, সাকিব ভাই আপনার দেওয়া পুরনো গিফটের সাথে জড়াজড়ি করে কাঁদে।`,
                `${bhabiName} 💔 সাকিব ভাইয়ের হৃদয়ে শুধু আপনার জায়গা। আপনি আসবেন না?`,
                `${bhabiName} 🌧️ ভাবি, সাকিব ভাই আপনার জন্য অঝোর বৃষ্টির মতো কাঁদছে।`,
                `${bhabiName} 🕳️ সাকিব ভাই আপনার অভাবটা পূরণ করতে পারছে না। আসেন একবার।`,
                `${bhabiName} 💬 সাকিব ভাই আপনার পুরোনো চ্যাট পড়ে পড়ে কান্না করে।`,
                `${bhabiName} 🥀 ভাবি, সাকিব ভাই আপনার স্পর্শের জন্য পাগল।`,
                `${bhabiName} 🎭 সাকিব ভাই সবার সামনে হাসলেও, ভিতরে আপনার জন্য কাঁদে।`,
                `${bhabiName} 🌙 ভাবি, চাঁদের আলোয় সাকিব ভাই আপনার ছবি এঁকে দেয়।`,
                `${bhabiName} 💔 সাকিব ভাই বলেছে, আপনি তার বুকের রক্ত। রক্ত ফেলে আসবেন নাকি?`,
                `${bhabiName} 🕯️ ভাবি, সাকিব ভাই আপনার নাম জপতে জপতে রাত কাটায়।`,
                `${bhabiName} 🥀 সাকিব ভাইয়ের নিঃশ্বাস বন্ধ হয়ে আসছে, আপনি আসলে আবার চলে আসবে প্রাণ।`
            ];

            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            return api.sendMessage({
                body: randomReply,
                mentions: [{
                    tag: bhabiName,
                    id: bhabiID
                }]
            }, event.threadID, event.messageID);
        }
    }
};