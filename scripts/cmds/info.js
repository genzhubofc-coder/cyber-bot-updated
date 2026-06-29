module.exports = {
	config: {
		name: "info",
		aliases: ["admin"],
		author: "ULLASH",
		role: 0,
		shortDescription: "info and my owner the cmd",
		longDescription: "Shows owner information in text format",
		category: "INFO",
		guide: "{pn}"
	},

	onStart: async function ({ api, event }) {
		try {
			const ULLASHInfo = {
				name: 'SA K IB',
				gender: 'Male',
				age: '19',
				cls: 'Hsc Batch 2026',
				Relationship: 'Single',
				religion: 'Islam',
				facebook: 'https://www.facebook.com/SecondJohnnySins'
			};

			const response = `╭─────❁\n` +
				`│  𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢  \n` +
				`│\n` +
				`│Name: ${ULLASHInfo.name}\n` +
				`│Gender: ${ULLASHInfo.gender}\n` +
				`│Class: ${ULLASHInfo.cls}\n` +
				`│Relationship: ${ULLASHInfo.Relationship}\n` +
				`│Age: ${ULLASHInfo.age}\n` +
				`│Religion: ${ULLASHInfo.religion}\n` +
				`│Facebook: ${ULLASHInfo.facebook}\n` +
				`╰────────────❁`;

			await api.sendMessage(response, event.threadID, event.messageID);

			api.setMessageReaction('🐔', event.messageID, (err) => {}, true);
		} catch (error) {
			console.error('Error in info command:', error);
			return api.sendMessage('An error occurred while processing the command.', event.threadID);
		}
	}
};