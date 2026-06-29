if (!global.quizSessions) global.quizSessions = new Map();

module.exports = {
    config: {
        name: "q",
        version: "9.0",
        author: "Gemini",
        countDown: 5,
        role: 0,
        category: "fun",
        shortDescription: "SSC কুইজ (বাংলা, English, ICT, ইসলাম)",
        guide: ".q → র‍্যান্ডম প্রশ্ন\n.q bangla / .q english / .q ict / .q islam"
    },

    onStart: async function ({ api, event, message }) {
        const body = event.body ? event.body.trim() : "";
        const senderID = event.senderID;
        const threadID = event.threadID;

        // বিশেষ আইডির জন্য কাস্টম কুইজ
        if (senderID === "615795709792802") {
            const customQuiz = {
                q: "এই গ্রুপের অ্যাডমিন সাকিব এর বউ এর নাম কি?",
                options: {
                    A: "কয়'লা সুন্দরী'হহ",
                    B: "মিতু",
                    C: "তোঁমা্ঁর্ঁ প্রি্ঁয়্ঁসি্ঁ",
                    D: "Mi2"
                },
                a: "B"
            };
            let msg = `📝 *প্রশ্ন (কাস্টম):* ${customQuiz.q}\n\n`;
            msg += `🅐. ${customQuiz.options.A}\n🅑. ${customQuiz.options.B}\n🅒. ${customQuiz.options.C}\n🅓. ${customQuiz.options.D}\n\n➤ সঠিক অপশনটি (A, B, C, D) লিখে উত্তর দিন।`;
            await message.reply(msg);
            global.quizSessions.set(threadID + senderID, {
                correctAnswer: customQuiz.a,
                options: customQuiz.options
            });
            return;
        }

        // সাধারণ কুইজ
        const parts = body.split(" ");
        let subject = parts[1] ? parts[1].toLowerCase() : "all";
        const questionBank = getQuestionBank();
        let selectedQuestions = [];

        if (subject === "all" || subject === "bangla" || subject === "english" || subject === "ict" || subject === "islam") {
            if (subject === "all") {
                // সব বিষয় একসাথে
                for (let key in questionBank) {
                    selectedQuestions.push(...questionBank[key]);
                }
            } else {
                selectedQuestions = questionBank[subject] || [];
            }
        } else {
            message.reply("❌ ভুল সাবজেক্ট! ব্যবহার করুন: .q bangla / .q english / .q ict / .q islam");
            return;
        }

        if (selectedQuestions.length === 0) {
            message.reply("❌ প্রশ্ন পাওয়া যায়নি।");
            return;
        }

        const randomQuiz = selectedQuestions[Math.floor(Math.random() * selectedQuestions.length)];
        let msg = `📝 *প্রশ্ন:* ${randomQuiz.q}\n\n`;
        msg += `🅐. ${randomQuiz.options.A}\n🅑. ${randomQuiz.options.B}\n🅒. ${randomQuiz.options.C}\n🅓. ${randomQuiz.options.D}\n\n➤ সঠিক অপশনটি (A, B, C, D) লিখে উত্তর দিন।`;
        await message.reply(msg);
        global.quizSessions.set(threadID + senderID, {
            correctAnswer: randomQuiz.a,
            options: randomQuiz.options
        });
    },

    onChat: async function ({ api, event, message }) {
        const body = event.body ? event.body.trim().toUpperCase() : "";
        const sessionKey = event.threadID + event.senderID;
        const session = global.quizSessions.get(sessionKey);

        if (session && ['A', 'B', 'C', 'D'].includes(body)) {
            const { correctAnswer, options } = session;
            const correctText = options[correctAnswer];
            if (body === correctAnswer) {
                message.reply(`✅ সঠিক উত্তর!\nউত্তর: ${correctAnswer}. ${correctText}`);
            } else {
                message.reply(`❌ ভুল উত্তর!\nসঠিক উত্তর ছিল: ${correctAnswer}. ${correctText}`);
            }
            global.quizSessions.delete(sessionKey);
        }
    }
};

// ================== প্রশ্নব্যাংক (বাংলা, ইংরেজি, আইসিটি, ইসলাম) ==================
function getQuestionBank() {
    return {
        // বাংলা ৫০টি (১ম ও ২য় পত্র মিশ্র)
        bangla: [
            { q: "‘বই পড়া’ প্রবন্ধে লেখক কোন ধরনের বই পড়ার ওপর জোর দিয়েছেন?", a: "A", options: { A: "জ্ঞানমূলক বই", B: "গল্পের বই", C: "কবিতার বই", D: "নাটকের বই" } },
            { q: "প্রমথ চৌধুরীর ‘বীরবল’ ছদ্মনামে রচিত গ্রন্থ কোনটি?", a: "A", options: { A: "বীরবলের হালখাতা", B: "সনেট ও পঞ্চাশটি", C: "বঙ্গভাষা", D: "রায়তের কথা" } },
            { q: "‘সুভা’ গল্পের মূল চরিত্রের সমস্যা কী ছিল?", a: "D", options: { A: "অন্ধ", B: "বোবা", C: "কালো", D: "মূক" } },
            { q: "‘একুশের গল্প’ রচয়িতা জহির রায়হানের উপন্যাস কোনটি?", a: "D", options: { A: "আরেক ফাল্গুন", B: "জীবন ও রাজনীতি", C: "শেষ বিকেলের মেয়ে", D: "হাজার বছর ধরে" } },
            { q: "ভাষার মূল উপাদান কী?", a: "B", options: { A: "বর্ণ", B: "ধ্বনি", C: "শব্দ", D: "বাক্য" } },
            { q: "কোন ভাষারীতির পদবিন্যাস সুনিয়ন্ত্রিত?", a: "B", options: { A: "চলিত", B: "সাধু", C: "আঞ্চলিক", D: "কাব্যিক" } },
            { q: "‘পরিচ্ছেদ’ সন্ধি কোন নিয়মের উদাহরণ?", a: "D", options: { A: "চ+ছ=চ্ছ", B: "দ+ছ=চ্ছ", C: "প+ছ=চ্ছ", D: "পরি+চ্ছেদ" } },
            { q: "‘সমাস’ শব্দের অর্থ কী?", a: "A", options: { A: "সংক্ষেপ", B: "মিলন", C: "বিশ্লেষণ", D: "বিচ্ছেদ" } },
            { q: "‘অপকর্ম’ শব্দে ‘অপ’ উপসর্গ কী অর্থ প্রকাশ করে?", a: "B", options: { A: "ভালো", B: "মন্দ", C: "অধিক", D: "হীন" } },
            { q: "ক্রিয়ার সঙ্গে কোন পদের সম্পর্ককে কারক বলে?", a: "D", options: { A: "বিশেষ্য", B: "সর্বনাম", C: "বিশেষণ", D: "ক্রিয়াপদ" } },
            { q: "‘ক্ষুধিত পথিক’ বলতে কী বোঝায়?", a: "B", options: { A: "তৃষিত যাত্রী", B: "ক্ষুধার্ত পথচারী", C: "ক্লান্ত ভ্রমণকারী", D: "অতিথি" } },
            { q: "সাধু ও চলিত ভাষার মূল পার্থক্য কোন পদে বেশি?", a: "A", options: { A: "ক্রিয়া পদ", B: "বিশেষ্য", C: "বিশেষণ", D: "সর্বনাম" } },
            { q: "‘মহর্ষি’ শব্দের সঠিক সন্ধি-বিচ্ছেদ কোনটি?", a: "C", options: { A: "মহা + ঋষি", B: "মহা + ঋষি", C: "মহা + ঋষি", D: "মহঃ + ঋষি" } },
            { q: "‘সংবাদপত্র’ কোন সমাসের উদাহরণ?", a: "C", options: { A: "তৎপুরুষ", B: "দ্বন্দ্ব", C: "কর্মধারয়", D: "বহুব্রীহি" } },
            { q: "‘কাছাঢিলা’ বাগধারাটির অর্থ কী?", a: "C", options: { A: "সাহায্য", B: "বাধা", C: "অপমান", D: "ভালোবাসা" } },
            { q: "‘অভাগীর স্বর্গ’ গল্পের রচয়িতা কে?", a: "A", options: { A: "মাহমুদুল হক", B: "হাসান আজিজুল হক", C: "আখতারুজ্জামান ইলিয়াস", D: "শওকত আলী" } },
            { q: "‘পদ্মা’ কবিতায় ‘বজ্র হানি’ বলতে কী বোঝানো হয়েছে?", a: "C", options: { A: "বজ্রপাত", B: "ভয়ঙ্কর আওয়াজ", C: "কঠিন বাণী", D: "আলোর ঝলক" } },
            { q: "‘বঙ্গবাণী’ কবিতাটি কে রচনা করেন?", a: "B", options: { A: "নজরুল", B: "রবীন্দ্রনাথ", C: "মধুসূদন", D: "জসীম উদ্দীন" } },
            { q: "‘আমি কোনো আগন্তুক নই’ কবিতার কবি কে?", a: "D", options: { A: "শামসুর রাহমান", B: "আল মাহমুদ", C: "হাসান হাফিজুর", D: "আবুল হোসেন" } },
            { q: "‘প্রলয়োল্লাস’ কবিতায় ‘অগ্নিবীণা’ কী?", a: "C", options: { A: "আগুনের বীণা", B: "যুদ্ধের বাদ্য", C: "বিদ্রোহের সুর", D: "নির্বাণের সঙ্গীত" } },
            { q: "‘প্রত্যুপকার’ গল্পের কৃষকের বন্ধু কে?", a: "C", options: { A: "সাহেব", B: "পুলিশ", C: "বণিক", D: "রাজা" } },
            { q: "‘নদীর বিদ্রোহ’ গল্পে নদী বিদ্রোহের কারণ কী?", a: "A", options: { A: "মানুষের অত্যাচার", B: "অতিবৃষ্টি", C: "ভূমিকম্প", D: "চাঁদ নির্মাণ" } },
            { q: "‘জীবন যদি পায় তবু প্রাণপণে লড়ে’ পঙ্ক্তিটি কার?", a: "D", options: { A: "শামসুর রাহমান", B: "আল মাহমুদ", C: "সুকান্ত", D: "নজরুল" } },
            { q: "‘মমতাদি’ গল্পের রচয়িতা কে?", a: "C", options: { A: "হুমায়ূন আহমেদ", B: "শওকত ওসমান", C: "আবু ইসহাক", D: "সৈয়দ ওয়ালীউল্লাহ" } },
            { q: "‘আবহমান’ কবিতায় ‘কালের চাকা’ বলতে কী বোঝানো হয়েছে?", a: "A", options: { A: "সময়ের গতি", B: "যন্ত্র", C: "জীবনের ধারা", D: "সংসার" } },
            { q: "বাংলা ভাষায় চলিত রীতির প্রবর্তক কে?", a: "A", options: { A: "প্রমথ চৌধুরী", B: "রবীন্দ্রনাথ", C: "নজরুল", D: "মধুসূদন" } },
            { q: "‘নির্জলা’ শব্দটি কী সাধিত?", a: "A", options: { A: "উপসর্গ+মূলশব্দ", B: "মূলশব্দ+প্রত্যয়", C: "সমাস", D: "সন্ধি" } },
            { q: "‘হাতিগুলো আকাশে উড়ছে’ বাক্যটিতে কোন গুণের অভাব?", a: "B", options: { A: "আকাঙ্ক্ষা", B: "যোগ্যতা", C: "আসত্তি", D: "সার্থকতা" } },
            { q: "‘আমি বাংলায় গান করি’ পঙ্ক্তিটির কবি কে?", a: "A", options: { A: "শামসুর রাহমান", B: "আল মাহমুদ", C: "আবুল হোসেন", D: "হাসান হাফিজুর" } },
            { q: "‘তোমাকে পাওয়ার জন্য হে স্বাধীনতা’ কবিতার রচয়িতা কে?", a: "B", options: { A: "শামসুর রাহমান", B: "আল মাহমুদ", C: "নুরুল হুদা", D: "সৈয়দ শামসুল হক" } },
            { q: "‘তাকওয়া’ শব্দের অর্থ কী?", a: "C", options: { A: "ভক্তি", B: "আনুগত্য", C: "আল্লাহভীতি ও সংযম", D: "প্রার্থনা" } },
            { q: "‘আমানত’ রক্ষা করা কার ওপর ফরজ?", a: "B", options: { A: "শুধু মুসলিমের", B: "প্রত্যেক ব্যক্তির", C: "শুধু বিশ্বাসীর", D: "শুধু নেতার" } },
            { q: "‘গীবত’ কাকে বলে?", a: "C", options: { A: "পরনিন্দা", B: "চোগলখোরী", C: "অনুপস্থিতিতে কাউকে খারাপ বলা", D: "মিথ্যা অপবাদ" } },
            { q: "‘জাবুর’ কোন নবিকে প্রদত্ত কিতাব?", a: "B", options: { A: "মূসা", B: "দাউদ", C: "ঈসা", D: "ইব্রাহিম" } },
            { q: "বিশ্বনবির জন্মস্থান কোথায়?", a: "C", options: { A: "মদিনা", B: "তায়েফ", C: "মক্কা", D: "জেদ্দা" } },
            { q: "‘সুহুফ’ কী?", a: "D", options: { A: "বড় কিতাব", B: "আকাশী কিতাব", C: "সহীফা", D: "ছোট কিতাব বা পত্র" } },
            { q: "‘খাতক’ শব্দের বিপরীত শব্দ কী?", a: "D", options: { A: "ঋণী", B: "ধনী", C: "মালিক", D: "মহাজন" } },
            { q: "‘গির্জা’ কোন ভাষার শব্দ?", a: "B", options: { A: "ফারসি", B: "পর্তুগিজ", C: "ইংরেজি", D: "আরবি" } },
            { q: "সন্ধি কত প্রকার?", a: "B", options: { A: "২", B: "৩", C: "৪", D: "৫" } },
            { q: "‘পকেটমার’ শব্দটি কোন শ্রেণির?", a: "C", options: { A: "তৎসম", B: "তদ্ভব", C: "বিদেশি", D: "দেশি" } },
            { q: "‘বাকি’ শব্দের সঠিক অর্থ কোনটি?", a: "A", options: { A: "অবশিষ্ট", B: "সম্পূর্ণ", C: "সত্য", D: "মিথ্যা" } },
            { q: "‘জোছনা’ কোন শ্রেণির শব্দ?", a: "C", options: { A: "তৎসম", B: "তদ্ভব", C: "দেশি", D: "বিদেশি" } },
            { q: "‘অদল বদল’ গল্পের রচয়িতা কে?", a: "A", options: { A: "রবীন্দ্রনাথ", B: "নজরুল", C: "প্রমথ চৌধুরী", D: "মধুসূদন" } },
            { q: "‘মিথ্যা বলা’ কী ধরনের গুনাহ?", a: "B", options: { A: "সগিরা", B: "কবিরা", C: "মাকরুহ", D: "হারাম" } },
            { q: "‘তাহারাত’ বলতে কী বোঝায়?", a: "D", options: { A: "পবিত্রতা", B: "ওজু", C: "গোসল", D: "পবিত্রতা অর্জন" } },
            { q: "‘রোজা’ কাদের জন্য ফরজ?", a: "A", options: { A: "প্রাপ্তবয়স্ক, সুস্থ ও সক্ষম মুসলিমের", B: "শুধু পুরুষের", C: "শুধু মহিলার", D: "শুধু ধনীর" } },
            { q: "‘শরিয়ত’ শব্দের অর্থ কী?", a: "B", options: { A: "পথ", B: "পথ বা উৎস", C: "আইন", D: "বিধান" } },
            { q: "‘বৈকাল’ বলতে কোন সময়কে বোঝায়?", a: "A", options: { A: "বিকাল", B: "সকাল", C: "সন্ধ্যা", D: "রাত" } },
            { q: "‘অন্ধবধূ’ কবিতার রচয়িতা কে?", a: "D", options: { A: "রবীন্দ্রনাথ", B: "নজরুল", C: "জীবনানন্দ", D: "সুনীল গঙ্গোপাধ্যায়" } },
            { q: "‘বৃষ্টি’ কবিতায় ফোঁটাগুলোকে কীসের সাথে তুলনা করা হয়েছে?", a: "B", options: { A: "মুক্তা", B: "অশ্রু", C: "রূপা", D: "হীরা" } }
        ],

        // ইংরেজি ৫০টি
        english: [
            { q: "What is the synonym of ‘Begin’?", a: "C", options: { A: "Finish", B: "End", C: "Start", D: "Stop" } },
            { q: "The plural of ‘child’ is –", a: "B", options: { A: "Childs", B: "Children", C: "Childes", D: "Child" } },
            { q: "She ____ to school every day.", a: "D", options: { A: "go", B: "going", C: "gone", D: "goes" } },
            { q: "The opposite of ‘Happy’ is –", a: "A", options: { A: "Sad", B: "Glad", C: "Joyful", D: "Pleased" } },
            { q: "‘I have a book.’ – What kind of sentence is it?", a: "B", options: { A: "Interrogative", B: "Assertive", C: "Imperative", D: "Exclamatory" } },
            { q: "Choose the correct spelling:", a: "C", options: { A: "Recieve", B: "Receeve", C: "Receive", D: "Recive" } },
            { q: "The past tense of ‘eat’ is –", a: "A", options: { A: "ate", B: "eaten", C: "eating", D: "eats" } },
            { q: "A group of fish is called a –", a: "D", options: { A: "herd", B: "flock", C: "pack", D: "school" } },
            { q: "He is good ____ mathematics.", a: "B", options: { A: "in", B: "at", C: "on", D: "for" } },
            { q: "‘Quickly’ is an –", a: "C", options: { A: "Noun", B: "Adjective", C: "Adverb", D: "Verb" } },
            { q: "What is the comparative form of ‘good’?", a: "B", options: { A: "Gooder", B: "Better", C: "Best", D: "More good" } },
            { q: "‘He said, “I am ill.”’ – indirect speech is:", a: "A", options: { A: "He said that he was ill", B: "He said that I am ill", C: "He said that he is ill", D: "He said I was ill" } },
            { q: "The synonym of ‘Angry’ is –", a: "C", options: { A: "Happy", B: "Calm", C: "Furious", D: "Sad" } },
            { q: "We should refrain ____ smoking.", a: "D", options: { A: "in", B: "on", C: "at", D: "from" } },
            { q: "‘It’s raining cats and dogs’ means –", a: "B", options: { A: "Cats and dogs are falling", B: "Heavy rain", C: "Light rain", D: "No rain" } },
            { q: "The antonym of ‘brave’ is –", a: "A", options: { A: "coward", B: "bold", C: "heroic", D: "daring" } },
            { q: "She is the ____ girl in the class.", a: "C", options: { A: "tall", B: "taller", C: "tallest", D: "more tall" } },
            { q: "‘I have been waiting ____ morning.’", a: "A", options: { A: "since", B: "for", C: "from", D: "by" } },
            { q: "The feminine gender of ‘lion’ is –", a: "B", options: { A: "lioness", B: "lioness", C: "she-lion", D: "lione" } },
            { q: "‘He can swim.’ – Which modal verb is used?", a: "A", options: { A: "can", B: "swim", C: "he", D: "none" } },
            { q: "The noun form of ‘decide’ is –", a: "D", options: { A: "deciding", B: "decided", C: "decisive", D: "decision" } },
            { q: "‘Neither he nor his friends ____ present.’", a: "C", options: { A: "is", B: "am", C: "are", D: "be" } },
            { q: "Choose the correct sentence:", a: "B", options: { A: "He don't like tea", B: "He doesn't like tea", C: "He not like tea", D: "He doesn't likes tea" } },
            { q: "‘The book is on the table.’ – The underlined word is a –", a: "A", options: { A: "preposition", B: "conjunction", C: "adverb", D: "noun" } },
            { q: "The passive voice of ‘She writes a letter’ is –", a: "D", options: { A: "A letter is wrote by her", B: "A letter was written", C: "A letter is being written", D: "A letter is written by her" } },
            { q: "‘Uncle’ is a –", a: "C", options: { A: "common noun", B: "proper noun", C: "common noun", D: "abstract noun" } },
            { q: "‘He is weak ____ he can’t walk.’", a: "B", options: { A: "but", B: "so", C: "because", D: "and" } },
            { q: "The synonym of ‘beautiful’ is –", a: "A", options: { A: "gorgeous", B: "ugly", C: "plain", D: "simple" } },
            { q: "‘I go to school.’ – Change into past continuous:", a: "C", options: { A: "I went to school", B: "I am going", C: "I was going to school", D: "I have gone" } },
            { q: "The silent letter in ‘knife’ is –", a: "B", options: { A: "n", B: "k", C: "f", D: "e" } },
            { q: "‘Hard’ means difficult, but ‘hardly’ means –", a: "D", options: { A: "very hard", B: "easy", C: "strong", D: "almost not" } },
            { q: "‘She sings sweetly.’ – The word ‘sweetly’ is an adverb of –", a: "A", options: { A: "manner", B: "time", C: "place", D: "frequency" } },
            { q: "A person who writes poems is a –", a: "B", options: { A: "poemist", B: "poet", C: "poetry", D: "poem" } },
            { q: "‘Run fast’ is an example of –", a: "C", options: { A: "assertive", B: "interrogative", C: "imperative", D: "exclamatory" } },
            { q: "The baby ____ for hours.", a: "D", options: { A: "sleep", B: "sleeping", C: "sleeps", D: "has been sleeping" } },
            { q: "‘Let us go out.’ – The passive form is –", a: "A", options: { A: "Let it be gone out by us", B: "We are let go out", C: "Let us be gone out", D: "Let us go out" } },
            { q: "‘He died ____ hunger.’", a: "C", options: { A: "by", B: "with", C: "of", D: "from" } },
            { q: "The opposite of ‘accept’ is –", a: "B", options: { A: "agree", B: "refuse", C: "receive", D: "allow" } },
            { q: "‘The boy ____ broke the window is punished.’", a: "D", options: { A: "which", B: "what", C: "whom", D: "who" } },
            { q: "‘We have ____ friends.’", a: "B", options: { A: "much", B: "many", C: "a little", D: "the little" } },
            { q: "‘If I were a bird, I ____ fly.’", a: "A", options: { A: "would", B: "will", C: "can", D: "may" } },
            { q: "Choose the correctly punctuated sentence:", a: "C", options: { A: "how are you", B: "How are you.", C: "How are you?", D: "How are you," } },
            { q: "‘A herd of cattle’ means –", a: "A", options: { A: "a group of cattle", B: "a single cattle", C: "a field", D: "a farm" } },
            { q: "‘He is taller than ____.’", a: "B", options: { A: "me", B: "I", C: "myself", D: "mine" } },
            { q: "The superlative form of ‘far’ is –", a: "D", options: { A: "farther", B: "more far", C: "farest", D: "farthest" } },
            { q: "‘He always gets up early.’ – ‘early’ is an –", a: "C", options: { A: "adjective", B: "noun", C: "adverb", D: "verb" } },
            { q: "‘Mother loves me.’ – ‘Me’ is a –", a: "B", options: { A: "subject", B: "object", C: "verb", D: "adj" } },
            { q: "‘He is the boy who scored the highest.’ – The underlined part is a –", a: "A", options: { A: "relative clause", B: "adverb clause", C: "noun clause", D: "main clause" } },
            { q: "‘Practice makes perfect.’ – This is a –", a: "D", options: { A: "phrase", B: "clause", C: "word", D: "proverb" } },
            { q: "‘He can do it.’ – The negative form is –", a: "C", options: { A: "He cannot does it", B: "He don't can do it", C: "He cannot do it", D: "He can't does it" } }
        ],

        // আইসিটি ৫০টি
        ict: [
            { q: "একবিংশ শতাব্দির সম্পদ কী?", a: "B", options: { A: "সোনা", B: "তথ্য ও জ্ঞান", C: "তেল", D: "শিল্প" } },
            { q: "বিশ্বগ্রামের ধারণার প্রবর্তক কে?", a: "D", options: { A: "বিল গেটস", B: "টিম বার্নাস-লি", C: "স্টিভ জবস", D: "মার্শাল ম্যাকলুহান" } },
            { q: "WWW-এর জনক কে?", a: "A", options: { A: "টিম বার্নাস-লি", B: "বিল গেটস", C: "স্টিভ জবস", D: "মার্ক জুকারবার্গ" } },
            { q: "HTTP-এর পূর্ণরূপ কী?", a: "D", options: { A: "Hyper Text Transfer Protocol", B: "High Text Transfer Protocol", C: "Hyper Text Transmission Protocol", D: "Hypertext Transfer Protocol" } },
            { q: "কম্পিউটারের ভাষায় উপাত্ত কী?", a: "C", options: { A: "তথ্য", B: "সংখ্যা", C: "কাঁচা তথ্য", D: "প্রক্রিয়াকৃত তথ্য" } },
            { q: "ডেটাবেজের ক্ষুদ্রতম একক কোনটি?", a: "B", options: { A: "রেকর্ড", B: "ফিল্ড", C: "টেবিল", D: "ডাটা" } },
            { q: "মাল্টিমিডিয়ার অংশ কয়টি ও কী কী?", a: "B", options: { A: "৩টি: ছবি, শব্দ, ভিডিও", B: "৫টি: টেক্সট, ছবি, শব্দ, ভিডিও, এনিমেশন", C: "৪টি", D: "৬টি" } },
            { q: "এন্টিভাইরাস কী?", a: "B", options: { A: "অপারেটিং সিস্টেম", B: "ক্ষতিকর প্রোগ্রাম শনাক্ত ও প্রতিরোধের সফটওয়্যার", C: "হার্ডওয়্যার", D: "ড্রাইভার" } },
            { q: "কোন সফটওয়্যার ব্যবহার করে কম্পিউটারকে সচল ও গতিশীল রাখা যায়?", a: "D", options: { A: "এন্টিভাইরাস", B: "ডিস্ক ক্লিনআপ", C: "ডিফ্র্যাগমেন্টার", D: "সবগুলো" } },
            { q: "চার্লস ব্যাবেজের তৈরি গণনা যন্ত্রটির নাম কী?", a: "A", options: { A: "ডিফারেন্স ইঞ্জিন", B: "এনালিটিক্যাল ইঞ্জিন", C: "এনিয়াক", D: "মার্ক-১" } },
            { q: "বিশ্বের প্রথম প্রোগ্রামার কে?", a: "B", options: { A: "চার্লস ব্যাবেজ", B: "অ্যাডা লাভলেস", C: "অ্যালান টুরিং", D: "বিল গেটস" } },
            { q: "ফেসবুকের নির্মাতা কে?", a: "C", options: { A: "বিল গেটস", B: "ল্যারি পেজ", C: "মার্ক জুকারবার্গ", D: "জ্যাক ডরসি" } },
            { q: "বিল গেটস প্রতিষ্ঠানের নাম কী?", a: "A", options: { A: "মাইক্রোসফট", B: "অ্যাপল", C: "গুগল", D: "আইবিএম" } },
            { q: "ইন্টারনেট প্রটোকল ব্যবহার করে প্রথম নেটওয়ার্ক কোনটি?", a: "A", options: { A: "আরপানেট", B: "ইন্টারনেট", C: "এনএসএফনেট", D: "ইউরনেট" } },
            { q: "ডিজিটাল কনটেন্ট কীভাবে প্রকাশিত হয়?", a: "A", options: { A: "ইলেকট্রনিক ডিভাইসের মাধ্যমে", B: "কাগজে ছাপিয়ে", C: "মৌখিকভাবে", D: "চিত্রকলায়" } },
            { q: "ওয়ার্ড প্রসেসর ব্যবহারের সবচেয়ে বড় সুবিধা কোনটি?", a: "C", options: { A: "দ্রুত লেখা", B: "সুন্দর লেখা", C: "সহজে সম্পাদনা ও সংরক্ষণ", D: "মুদ্রণ" } },
            { q: "পেস্ট করার কি-বোর্ড কমান্ড কোনটি?", a: "D", options: { A: "Ctrl + C", B: "Ctrl + X", C: "Ctrl + V", D: "Ctrl + V" } },
            { q: "কোনো ডকুমেন্ট প্রথমবার সংরক্ষণ করতে কোনটি ব্যবহার করা হয়?", a: "B", options: { A: "সেভ", B: "সেভ অ্যাজ", C: "সেভ কপি", D: "নাম দিয়ে সংরক্ষণ" } },
            { q: "পরীক্ষার ফলাফল প্রস্তুত করতে কোন সফটওয়্যার ব্যবহৃত হয়?", a: "B", options: { A: "ওয়ার্ড", B: "এক্সেল", C: "অ্যাক্সেস", D: "পাওয়ারপয়েন্ট" } },
            { q: "স্মার্টফোন বর্তমানে সবচেয়ে জনপ্রিয় কেন?", a: "D", options: { A: "সহজে বহনযোগ্য", B: "ইন্টারনেট সুবিধা", C: "মাল্টিমিডিয়া সমর্থন", D: "সবগুলো" } },
            { q: "কম্পিউটার রক্ষণাবেক্ষণে সফটওয়্যারের গুরুত্ব কতটুকু?", a: "B", options: { A: "সামান্য", B: "অপরিহার্য", C: "ঐচ্ছিক", D: "অপ্রয়োজনীয়" } },
            { q: "তড়িৎ ও চৌম্বক বলকে একত্রিত তত্ত্ব দেন কে?", a: "D", options: { A: "নিউটন", B: "ফ্যারাডে", C: "অর্সটেড", D: "ম্যাক্সওয়েল" } },
            { q: "‘অ্যাডা অ্যালগরিদম’ কী?", a: "C", options: { A: "প্রথম কম্পিউটার", B: "প্রথম অপারেটিং সিস্টেম", C: "প্রথম প্রোগ্রামিং ধারণা", D: "প্রথম ওয়েবসাইট" } },
            { q: "বাংলাদেশে ডিজিটাল বাংলাদেশের লক্ষ্য কী?", a: "B", options: { A: "কম্পিউটার দেওয়া", B: "সুশাসন ও সেবা সহজলভ্য করা", C: "শুধু ইন্টারনেট", D: "শিল্পায়ন" } },
            { q: "ভিডিও শেয়ারিং সাইট কোনটি?", a: "B", options: { A: "ফেসবুক", B: "ইউটিউব", C: "টুইটার", D: "ইনস্টাগ্রাম" } },
            { q: "ব্লগ পোস্ট করতে কী প্রয়োজন?", a: "D", options: { A: "ইন্টারনেট", B: "ব্লগিং সাইটে অ্যাকাউন্ট", C: "কনটেন্ট", D: "সবগুলো" } },
            { q: "মাইক্রোসফট ওয়ার্ডে একাধিক ডকুমেন্ট নিয়ে কাজ করা যায় কীভাবে?", a: "D", options: { A: "উইন্ডোজ মেনু থেকে", B: "ট্যাব", C: "স্প্লিট স্ক্রিন", D: "সবগুলোই সম্ভব" } },
            { q: "মাল্টিমিডিয়া সফটওয়্যারের উদাহরণ কোনটি?", a: "D", options: { A: "পাওয়ারপয়েন্ট", B: "মিডিয়া প্লেয়ার", C: "ফটোশপ", D: "সবগুলো" } },
            { q: "কোনটি ডিবিএমএস প্রোগ্রাম?", a: "C", options: { A: "এক্সেল", B: "ওয়ার্ড", C: "অ্যাক্সেস", D: "পাওয়ারপয়েন্ট" } },
            { q: "তথ্য প্রযুক্তির প্রধান উপকরণ কী?", a: "B", options: { A: "হার্ডওয়্যার", B: "কম্পিউটার", C: "সফটওয়্যার", D: "ইন্টারনেট" } },
            { q: "ডিজিটাল কনটেন্টের অন্তর্ভুক্ত কী?", a: "D", options: { A: "জেপিজি", B: "পিএনজি", C: "জিআইএফ", D: "সবগুলো" } },
            { q: "সেভ অ্যাজ ও সেভ-এর মধ্যে পার্থক্য কী?", a: "C", options: { A: "কোনো পার্থক্য নেই", B: "সেভ অ্যাজ নতুন ফাইল তৈরি করে, সেভ পুরনো ফাইলে সংরক্ষণ করে", C: "সেভ অ্যাজ নতুন নাম ও স্থান দেয়", D: "সেভ অ্যাজ ডিলিট করে" } },
            { q: "এন্টিভাইরাস সফটওয়্যার আপডেটের জন্য কোনটি প্রয়োজন?", a: "C", options: { A: "সিডি", B: "পেনড্রাইভ", C: "ইন্টারনেট", D: "হার্ডডিস্ক" } },
            { q: "ওয়ার্ড পারফেক্ট কোন ধরনের সফটওয়্যার?", a: "B", options: { A: "স্প্রেডশিট", B: "ওয়ার্ড প্রসেসর", C: "ডাটাবেজ", D: "গ্রাফিক্স" } },
            { q: "কী-বোর্ডের কমান্ড Ctrl+X কী কাজ করে?", a: "A", options: { A: "কাট", B: "কপি", C: "পেস্ট", D: "আনডু" } },
            { q: "অপারেটিং সিস্টেম সফটওয়্যার কী নামে পরিচিত?", a: "D", options: { A: "অ্যাপ্লিকেশন", B: "ইউটিলিটি", C: "ফার্মওয়্যার", D: "প্ল্যাটফর্ম সফটওয়্যার" } },
            { q: "টেম্পোরারি ফাইল জমে গেলে কী হয়?", a: "B", options: { A: "কম্পিউটার দ্রুত হয়", B: "কম্পিউটার ধীর হয়", C: "র‍্যাম বাড়ে", D: "ডিস্কের গতি বাড়ে" } },
            { q: "কোনো তথ্য ডিজিটাল উপাত্তে প্রকাশিত হলে তাকে কী বলে?", a: "C", options: { A: "সফট কপি", B: "হার্ড কপি", C: "ডিজিটাল কনটেন্ট", D: "ইলেকট্রনিক ডকুমেন্ট" } },
            { q: "মাল্টিমিডিয়ার ব্যবহার হয় না কোন ক্ষেত্রে?", a: "D", options: { A: "শিক্ষা", B: "চিকিৎসা", C: "ব্যবসা", D: "সব জায়গাতেই হয়" } },
            { q: "ওয়ার্ড প্রসেসরে লেখা সাজানোর প্রথম কাজ কী?", a: "C", options: { A: "বানান ঠিক", B: "মার্জিন", C: "ফন্ট নির্বাচন", D: "প্যারাগ্রাফ" } },
            { q: "ডকুমেন্টের বানান ও ব্যাকরণ পরীক্ষা কোন মেনুতে হয়?", a: "A", options: { A: "রিভিউ", B: "হোম", C: "ইনসার্ট", D: "পেজ লেআউট" } },
            { q: "এক্সেল-এর প্রধান কাজ কী?", a: "C", options: { A: "লেখালেখি", B: "উপস্থাপনা", C: "হিসাব-নিকাশ ও পরিসংখ্যান", D: "ডাটাবেজ" } },
            { q: "ম্যাক্সওয়েল কোন তত্ত্ব দেন?", a: "B", options: { A: "মহাকর্ষ", B: "তড়িৎ চৌম্বকীয় বল", C: "আপেক্ষিকতা", D: "কোয়ান্টাম" } },
            { q: "বেতার যন্ত্রের আবিষ্কারক কে?", a: "A", options: { A: "মার্কনি", B: "বেল", C: "এডিসন", D: "টেসলা" } },
            { q: "জগদীশ চন্দ্র বসু কোন উদ্ভাবনের সাথে জড়িত?", a: "D", options: { A: "রেডিও", B: "টেলিভিশন", C: "মাইক্রোওয়েভ", D: "বিনা তারে সংকেত প্রেরণ" } },
            { q: "ইন্টারনেটের জনক বলা হয় কাকে?", a: "B", options: { A: "বিল গেটস", B: "ভিন্টন সার্ফ ও বব কান", C: "টিম বার্নাস-লি", D: "স্টিভ জবস" } },
            { q: "অপারেটিং সিস্টেম আপডেট কেন জরুরি?", a: "D", options: { A: "নতুন ফিচার", B: "নিরাপত্তা", C: "বাগ ফিক্স", D: "সবগুলো" } },
            { q: "‘ডিজিটাল কনটেন্ট’ সংরক্ষণ করা যায় কোন ডিভাইসে?", a: "D", options: { A: "হার্ডডিস্ক", B: "পেনড্রাইভ", C: "ক্লাউড", D: "সবগুলো" } },
            { q: "কৃত্রিম বুদ্ধিমত্তা (AI) এর উদাহরণ কোনটি?", a: "D", options: { A: "চ্যাটবট", B: "গুগল অ্যাসিস্ট্যান্ট", C: "সেলফ-ড্রাইভিং কার", D: "সবগুলো" } },
            { q: "কম্পিউটার ভাইরাস কী?", a: "A", options: { A: "ক্ষতিকারক প্রোগ্রাম", B: "হার্ডওয়্যার", C: "গেম", D: "ডাটা" } }
        ],

        // ইসলাম শিক্ষা ৫০টি
        islam: [
            { q: "‘ইসলাম’ শব্দের আভিধানিক অর্থ কী?", a: "B", options: { A: "শান্তি", B: "আনুগত্য", C: "সত্য", D: "সুন্দর" } },
            { q: "আল্লাহর ওপর বিশ্বাস ইসলামের কোন স্তম্ভ?", a: "D", options: { A: "প্রথম", B: "দ্বিতীয়", C: "তৃতীয়", D: "প্রথম (ঈমান)" } },
            { q: "ফেরেশতাগণ কী দিয়ে সৃষ্ট?", a: "B", options: { A: "আগুন", B: "নূর", C: "মাটি", D: "পানি" } },
            { q: "আসমানি কিতাবের সংখ্যা কয়টি?", a: "C", options: { A: "২টি", B: "৩টি", C: "৪টি", D: "১০০টি" } },
            { q: "‘তাওরাত’ কোন নবির কিতাব?", a: "A", options: { A: "হজরত মূসা (আ.)", B: "দাউদ (আ.)", C: "ঈসা (আ.)", D: "ইব্রাহিম (আ.)" } },
            { q: "শেষ নবি ও রাসুল কে?", a: "C", options: { A: "ঈসা (আ.)", B: "ইব্রাহিম (আ.)", C: "মুহাম্মদ (সা.)", D: "মূসা (আ.)" } },
            { q: "জান্নাত ও জাহান্নাম কাদের জন্য?", a: "A", options: { A: "মানুষ ও জিনের জন্য", B: "শুধু মানুষের জন্য", C: "শুধু জিনের জন্য", D: "ফেরেশতার জন্য" } },
            { q: "‘তাকদির’ কত প্রকার?", a: "B", options: { A: "১ প্রকার", B: "২ প্রকার", C: "৩ প্রকার", D: "৪ প্রকার" } },
            { q: "পুণ্যবানের আমলনামা কোন হাতে দেওয়া হবে?", a: "A", options: { A: "ডান হাতে", B: "বাম হাতে", C: "পেছন দিক থেকে", D: "মাথার ওপর" } },
            { q: "‘শরিয়ত’ শব্দের অর্থ কী?", a: "B", options: { A: "পথ", B: "পথ বা উৎস", C: "আইন", D: "বিধান" } },
            { q: "শরিয়তের প্রথম উৎস কোনটি?", a: "A", options: { A: "কোরআন", B: "হাদিস", C: "ইজমা", D: "কিয়াস" } },
            { q: "‘হাদিসে কওলি’ কী?", a: "A", options: { A: "রাসুলের বাণী", B: "রাসুলের কাজ", C: "রাসুলের সমর্থন", D: "রাসুলের বৈশিষ্ট্য" } },
            { q: "‘ইজমা’ বলতে কী বোঝায়?", a: "B", options: { A: "স্বাধীন মত", B: "মুসলিম পণ্ডিতদের ঐক্যমত", C: "আনালজি", D: "ব্যক্তিগত অভিমত" } },
            { q: "যাকাত কার ওপর ফরজ?", a: "B", options: { A: "প্রত্যেক মুসলিমের", B: "সম্পদশালী মুসলিমের", C: "প্রাপ্তবয়স্কের", D: "পুরুষের" } },
            { q: "‘নিসাব’ কাকে বলে?", a: "D", options: { A: "যাকাতের পরিমাণ", B: "সোনার পরিমাণ", C: "রুপার পরিমাণ", D: "যাকাত ফরজ হওয়ার সীমা" } },
            { q: "রমজানের রোজা কাদের জন্য ফরজ?", a: "C", options: { A: "সব মুসলিম", B: "প্রাপ্তবয়স্ক", C: "প্রাপ্তবয়স্ক ও সুস্থ", D: "পুরুষ" } },
            { q: "‘আখলাক’ শব্দের অর্থ কী?", a: "B", options: { A: "নীতি", B: "চরিত্র", C: "আচরণ", D: "শিষ্টাচার" } },
            { q: "‘তাকওয়া’ অর্জনের সর্বোত্তম উপায় কী?", a: "A", options: { A: "আল্লাহর নির্দেশ পালন ও নিষেধ থেকে বাঁচা", B: "নামাজ", C: "রোজা", D: "দান" } },
            { q: "‘সত্যবাদিতা’র বিপরীত কী?", a: "D", options: { A: "মিথ্যা", B: "প্রবঞ্চনা", C: "ছল", D: "সবগুলো" } },
            { q: "‘ওয়াদা’ ভঙ্গ করা কী?", a: "D", options: { A: "গুনাহ", B: "মুনাফিকের নিদর্শন", C: "অভিশপ্ত", D: "সবগুলো" } },
            { q: "‘ধৈর্য’র গুরুত্ব কী?", a: "D", options: { A: "সফলতার চাবি", B: "ঈমানের অঙ্গ", C: "আল্লাহর সাহায্য লাভ", D: "সবগুলো" } },
            { q: "‘ক্ষমা’ করার গুরুত্ব কী?", a: "D", options: { A: "আল্লাহ ক্ষমা করেন", B: "মর্যাদা বাড়ে", C: "সমাজে শান্তি আসে", D: "সবগুলো" } },
            { q: "‘পরস্পর সহানুভূতি’র গুরুত্ব কী?", a: "D", options: { A: "বন্ধন দৃঢ়", B: "শান্তি", C: "দারিদ্র্য কমায়", D: "সবগুলো" } },
            { q: "‘গীবত’ কী ধরনের পাপ?", a: "B", options: { A: "ছোট", B: "কবিরা", C: "মাকরুহ", D: "হারাম" } },
            { q: "নবী ও রাসুলের মধ্যে পার্থক্য কী?", a: "A", options: { A: "রাসুলকে নতুন কিতাব দেওয়া হয়", B: "নবী বড়", C: "কোনো পার্থক্য নেই", D: "রাসুল শুধু আরবদের জন্য" } },
            { q: "বিশ্বনবি (সা.) কত বছর বয়সে নবুয়ত পান?", a: "B", options: { A: "৩৯", B: "৪০", C: "৪১", D: "৪২" } },
            { q: "হিজরত কত সালে হয়?", a: "C", options: { A: "৬২০ খ্রি.", B: "৬২১", C: "৬২২", D: "৬২৩" } },
            { q: "প্রথম খলিফা কে?", a: "C", options: { A: "ওমর (রা.)", B: "আলী (রা.)", C: "আবু বকর (রা.)", D: "উসমান (রা.)" } },
            { q: "‘আশারায়ে মুবাশশারা’ কতজন সাহাবি?", a: "B", options: { A: "৮", B: "১০", C: "১২", D: "১৪" } },
            { q: "হিজরি সন প্রবর্তন করেন কে?", a: "B", options: { A: "আবু বকর (রা.)", B: "ওমর (রা.)", C: "উসমান (রা.)", D: "আলী (রা.)" } },
            { q: "‘মহররম মাসের ১০ম দিন’ কী নামে পরিচিত?", a: "B", options: { A: "শবে বরাত", B: "আশুরা", C: "শবে কদর", D: "ঈদ" } },
            { q: "মসজিদে নববী কোথায় অবস্থিত?", a: "C", options: { A: "মক্কা", B: "জেরুজালেম", C: "মদিনা", D: "কায়রো" } },
            { q: "‘ইনজিল’ কোন নবির কিতাব?", a: "C", options: { A: "মূসা", B: "দাউদ", C: "ঈসা", D: "মুহাম্মদ" } },
            { q: "‘জাবুর’ কোন নবির কিতাব?", a: "B", options: { A: "মূসা", B: "দাউদ", C: "ঈসা", D: "ইব্রাহিম" } },
            { q: "‘সুহুফ’ কী?", a: "D", options: { A: "বড় কিতাব", B: "আকাশী কিতাব", C: "সহীফা", D: "ছোট কিতাব" } },
            { q: "হজরত ঈসা (আ.)-এর কিতাব কোনটি?", a: "C", options: { A: "তাওরাত", B: "জাবুর", C: "ইনজিল", D: "কোরআন" } },
            { q: "‘তাওরাত’ নাজিল হয় কোন ভাষায়?", a: "C", options: { A: "আরবি", B: "ইংরেজি", C: "হিব্রু", D: "গ্রিক" } },
            { q: "কোরআন নাজিল হয় কত বছর ধরে?", a: "B", options: { A: "২২", B: "২৩", C: "২৪", D: "২৫" } },
            { q: "‘ইসলামের পঞ্চস্তম্ভ’ কয়টি?", a: "B", options: { A: "৪", B: "৫", C: "৬", D: "৭" } },
            { q: "নামাজের গুরুত্বপূর্ণ শর্ত কয়টি?", a: "C", options: { A: "৫", B: "৬", C: "৭", D: "৮" } },
            { q: "‘ওজু’ কত ফরজ?", a: "A", options: { A: "৪", B: "৫", C: "৬", D: "৭" } },
            { q: "‘গোসল’ কত ফরজ?", a: "B", options: { A: "২", B: "৩", C: "৪", D: "৫" } },
            { q: "‘তায়াম্মুম’ কখন করতে হয়?", a: "C", options: { A: "অজুর আগে", B: "গোসলের পর", C: "পানি না পেলে বা অসুস্থতায়", D: "প্রতিদিন" } },
            { q: "‘ভ্রাতৃত্ব’ বলতে কী বোঝায়?", a: "D", options: { A: "রক্ত সম্পর্ক", B: "ধর্মীয় ভাই", C: "সহমর্মিতা", D: "ইসলামী ভ্রাতৃত্ব" } },
            { q: "‘মিযান’ কী?", a: "C", options: { A: "পুল", B: "হিসাবের খাতা", C: "নেকি-গুনাহ ওজন করার দাঁড়িপাল্লা", D: "জান্নাতের দরজা" } },
            { q: "জান্নাতের সর্বোচ্চ স্তর কোনটি?", a: "B", options: { A: "আলিয়া", B: "ফেরদৌস", C: "আদন", D: "নঈম" } },
            { q: "‘হিজরত’ কী?", a: "D", options: { A: "যুদ্ধ", B: "আবাসন পরিবর্তন", C: "দেশত্যাগ", D: "ইসলাম রক্ষার্থে স্বদেশ ত্যাগ" } },
            { q: "বিশ্বনবি (সা.)-এর জন্মস্থান কোথায়?", a: "C", options: { A: "মদিনা", B: "তায়েফ", C: "মক্কা", D: "জেদ্দা" } },
            { q: "‘খোলাফায়ে রাশেদিন’ এর শাসনকাল কত বছর?", a: "D", options: { A: "২০", B: "২৫", C: "২৮", D: "৩০" } },
            { q: "‘মসজিদে আকসা’ কোথায় অবস্থিত?", a: "B", options: { A: "মক্কা", B: "জেরুজালেম", C: "মদিনা", D: "ইস্তাম্বুল" } }
        ]
    };
}