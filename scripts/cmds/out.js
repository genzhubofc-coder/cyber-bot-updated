const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");
module.exports = {
	config: {
		name: "Out",
		aliases: ["left"],
		version: "1.0",
		author: "Ullash ッ",
		countDown: 5,
		role: 2,
		shortDescription: "bot will leave gc",
		longDescription: "",
		category: "admin",
		guide: {
			vi: "{pn} [tid,blank]",
			en: "{pn} [tid,blank]"
		}
	},

	onStart: async function ({ api,event,args, message }) {
 var id;
 if (!args.join(" ")) {
 id = event.threadID;
 } else {
 id = parseInt(args.join(" "));
 }
 return api.sendMessage('আমি SAKIB বট আপনাদের গ্রুপ থেকে লিভ 𝗟𝗘𝗔𝗩𝗘 নিচ্ছি:\n》আমি মেসেঞ্জার চ্যাট বট , আমাকে আপনাদের বিনোদন দেওয়ার জন্য বানানো হয়েছে। আমার কথায় যদি কেউ মনে কষ্ট পেয়ে থাকেন, তাহলে আমাকে ক্ষমা করে দিবেন 🙂 .\n\n🎵 ⇆ㅤ◁ㅤ ❚❚ㅤ ▷ㅤ↻\n\n➤সবাই নিজের খেয়াল রাখবেন, আল্লাহ হাফেজ 🌺', id, () => api.removeUserFromGroup(api.getCurrentUserID(), id))
		}
	};
