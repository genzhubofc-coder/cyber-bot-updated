const axios = require("axios");

// সেশন ট্র্যাকিং
if (!global.quizSessions) global.quizSessions = new Map();

module.exports = {
    config: {
        name: "quiz",
        version: "5.0",
        author: "Modified by ChatGPT",
        countDown: 5,
        role: 0,
        category: "fun",
        shortDescription: "বাংলা কুইজ খেলুন",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, message }) {
        const sessionKey = event.threadID + event.senderID;

        try {
            const res = await axios.get("https://mahbub-ullash.cyberbot.top/api/bangla-quiz");
            const data = res.data.message;

            if (!data || !data.question) {
                return message.reply("দুঃখিত, কুইজ পাওয়া যায়নি।");
            }

            const { question, answer, A, B, C, D } = data;

            let msg = `📝 *প্রশ্ন:* ${question}\n\n`;
            msg += `🅐. ${A}\n`;
            msg += `🅑. ${B}\n`;
            msg += `🅒. ${C}\n`;
            msg += `🅓. ${D}\n\n`;
            msg += `➤ সঠিক অপশনটি (A, B, C, D) লিখে উত্তর দিন।`;

            await message.reply(msg);

            global.quizSessions.set(sessionKey, {
                correctAnswer: answer.toUpperCase(),
                options: { A, B, C, D }
            });

        } catch (error) {
            return message.reply("সার্ভার এরর! আবার চেষ্টা করুন।");
        }
    },

    onChat: async function ({ api, event, message }) {
        const sessionKey = event.threadID + event.senderID;
        const session = global.quizSessions.get(sessionKey);

        if (session && event.body) {
            const userAnswer = event.body.trim().toUpperCase();

            if (['A', 'B', 'C', 'D'].includes(userAnswer)) {
                const { correctAnswer, options } = session;
                const correctText = options[correctAnswer];

                if (userAnswer === correctAnswer) {
                    message.reply(`✅ সঠিক উত্তর!\nসঠিক উত্তর: ${correctAnswer}. ${correctText}`);
                } else {
                    message.reply(`❌ ভুল উত্তর!\nসঠিক উত্তর ছিল: ${correctAnswer}. ${correctText}`);
                }

                global.quizSessions.delete(sessionKey);
            }
        }
    }
};