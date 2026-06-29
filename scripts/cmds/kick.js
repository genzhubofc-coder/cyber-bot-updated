module.exports = {
	config: {
		name: "kick",
		version: "2.1.0",
		author: "Sakib",
		countDown: 5,
		role: 1, 
		category: "Box Chat",
		guide: {
			en: "{pn} @tags (Tag someone to kick them)"
		}
	},

	onStart: async function ({ api, event, args }) {
		const { threadID, senderID, messageReply, mentions } = event;
		const PROTECTED_ID = "100070013974971"; // এই আইডিটি প্রটেক্টেড

		// গ্রুপ ইনফো আনা
		const info = await api.getThreadInfo(threadID);
		
		// বট অ্যাডমিন কি না চেক করা
		if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
			return api.sendMessage("» বটকে আগে গ্রুপের অ্যাডমিন বানান!", threadID);
		}

		// কমান্ড ব্যবহারের অনুমতি চেক (অ্যাডমিন অথবা নির্দিষ্ট আইডি)
		const isGroupAdmin = info.adminIDs.some(item => item.id == senderID);
		const isProtectedUser = (senderID == PROTECTED_ID);

		if (!isGroupAdmin && !isProtectedUser) {
			return api.sendMessage("» শুধুমাত্র গ্রুপ অ্যাডমিনরা এই কমান্ড ব্যবহার করতে পারবে।", threadID);
		}

		// কিক ফাংশন
		const kickMember = (uid) => {
			// প্রটেক্টেড ইউজারকে কিক করা যাবে না
			if (uid == PROTECTED_ID) {
				return api.sendMessage("» দুঃখিত, এই বিশেষ ব্যক্তিকে কিক করা নিষেধ!", threadID);
			}

			api.removeUserFromGroup(uid, threadID, (err) => {
				if (err) return api.sendMessage("» কিক করতে সমস্যা হয়েছে, হয়তো সে অ্যাডমিন বা বট তাকে কিক করতে পারছে না।", threadID);
				api.sendMessage("» সফলভাবে কিক করা হয়েছে।", threadID);
			});
		};

		// যদি রিপ্লাই দিয়ে কিক করা হয়
		if (messageReply) {
			return kickMember(messageReply.senderID);
		}

		// যদি ট্যাগ করে কিক করা হয়
		const uids = Object.keys(mentions);
		if (uids.length > 0) {
			for (const uid of uids) {
				kickMember(uid);
			}
			return;
		}

		return api.sendMessage("» যাকে কিক করতে চান তাকে মেনশন করুন অথবা মেসেজে রিপ্লাই দিন।", threadID);
	}
};