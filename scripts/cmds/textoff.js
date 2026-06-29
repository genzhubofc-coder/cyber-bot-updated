sudo suspend web servicconst activeTextOff = new Map();

module.exports = {
	config: {
		name: "textoff",
		version: "2.1",
		author: "ChatGPT",
		role: 2,
		shortDescription: { en: "Temporarily disable chat in group" },
		longDescription: { en: "Turn off chat for a specific time, optionally for prayers" },
		category: "group",
		guide: { en: "{pn} <minutes>\n{pn} <fajar|jahar|asar|magrib|eshar> <minutes>\n{pn} stop" }
	},

	onStart: async function ({ message, event, args, api }) {
		const threadID = event.threadID;

		// stop command
		if (args[0] && args[0].toLowerCase() === "stop") {
			if (!activeTextOff.has(threadID))
				return message.reply("⚠️ এই গ্রুপে Text Off চলছে না।");

			const data = activeTextOff.get(threadID);
			clearTimeout(data.timeout);
			activeTextOff.delete(threadID);
			return message.reply("✅ Text Off আগেই বন্ধ করা হলো। সবাই আবার চ্যাট করতে পারবে।");
		}

		if (activeTextOff.has(threadID))
			return message.reply("⚠️ এই গ্রুপে ইতিমধ্যেই Text Off চলছে।");

		let prayer = null;
		let minutes;

		if (args.length === 1) minutes = parseInt(args[0]);
		else if (args.length === 2) {
			prayer = args[0].toLowerCase();
			minutes = parseInt(args[1]);
		} else {
			return message.reply(
				"ব্যবহার:\n.textoff 20\n.textoff fajar 20\n.textoff stop"
			);
		}

		if (isNaN(minutes) || minutes <= 0)
			return message.reply("⏳ সঠিক সময় দিন।");

		const prayerNames = {
			fajar: "ফজরের নামাজ",
			jahar: "যোহরের নামাজ",
			asar: "আসরের নামাজ",
			magrib: "মাগরিবের নামাজ",
			eshar: "এশার নামাজ"
		};

		let text;
		if (prayer && prayerNames[prayer]) {
			text =
`🚫 | টেক্সট বন্ধ!

${prayerNames[prayer]} এর জন্য ${minutes} মিনিট টেক্সট অফ রাখা হলো। 

কেউ টেক্সট দিবেন না।
সবাই নামাজ পড়ুন। 🤲`;
		} else {
			text =
`🚫 | টেক্সট বন্ধ!

পরবর্তী ${minutes} মিনিট টেক্সট অফ থাকবে। 

অপ্রয়োজনীয় মেসেজ পাঠাবেন না।`;
		}

		activeTextOff.set(threadID, {
			endTime: Date.now() + minutes * 60000,
			reactionQueue: [],
			processingQueue: false,
			timeout: setTimeout(() => {
				activeTextOff.delete(threadID);
				api.sendMessage(
					`✅ | টেক্সট অন\n\nএখন আবার সবাই মেসেজ দিতে পারবেন।`,
					threadID
				);
			}, minutes * 60000)
		});

		await message.reply(text);
	},

	onChat: async function ({ event, api }) {
		const threadID = event.threadID;
		const senderID = event.senderID;

		if (!activeTextOff.has(threadID)) return;

		// শুধু “100070013974971” ID বাদ
		if (senderID === "100070013974971") return;

		const data = activeTextOff.get(threadID);

		// প্রতিটি মেসেজে 🚫 রিয়েকশন
		data.reactionQueue.push(event.messageID);

		if (!data.processingQueue) {
			data.processingQueue = true;

			const processQueue = async () => {
				while (data.reactionQueue.length > 0) {
					const msgID = data.reactionQueue.shift();

					let success = false;
					let tries = 0;
					while (!success && tries < 3) {
						try {
							await api.setMessageReaction("🚫", msgID, () => {}, true);
							success = true;
						} catch (e) {
							tries++;
							await new Promise(r => setTimeout(r, 300));
						}
					}

					await new Promise(r => setTimeout(r, 50));
				}
				data.processingQueue = false;
			};

			processQueue();
		}
	}
};
