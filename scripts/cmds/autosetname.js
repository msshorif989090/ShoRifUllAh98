const designs = [
	name => `꧁༺ 👑 ${name} ༻꧂`,
	name => `『⚡』${name}『🔥』`,
	name => `亗 ${name} 亗`,
	name => `♡ ${name} ♡`,
	name => `꧁✨ ${name} ✨꧂`,
	name => `༒☬ ${name} ☬༒`,
	name => `★彡 ${name} 彡★`,
	name => `『🌸』${name}『🌸』`,
	name => `⚡ ${name} ࿐`,
	name => `♛ ${name} ♛`,
	name => `༺💫 ${name} 💫༻`,
	name => `꧁༒ ${name} ༒꧂`,
	name => `『💎』${name}『💎』`,
	name => `ミ★ ${name} ★彡`,
	name => `꧁ঔৣ ${name} ঔৣ꧂`,
	name => `༺🔥 ${name} 🔥༻`,
	name => `『🦋』${name}『🦋』`,
	name => `♔ ${name} ♔`,
	name => `꧁༺💖 ${name} 💖༻꧂`,
	name => `✿ ${name} ✿`,
	name => `☯ ${name} ☯`,
	name => `『👑』${name}『👑』`,
	name => `༄ᶦᶰᵈ ${name}࿐`,
	name => `꧁𓊈𒆜 ${name} 𒆜𓊉꧂`,
	name => `◥꧁ ${name} ꧂◤`,
	name => `༺⚔️ ${name} ⚔️༻`,
	name => `『🌙』${name}『⭐』`,
	name => `꧁༺🌺 ${name} 🌺༻꧂`,
	name => `★ ${name} ★`,
	name => `♕ ${name} ♕`,
	name => `『🖤』${name}『🖤』`,
	name => `༒ ${name} ༒`,
	name => `꧁༺💫 ${name} 💫༻꧂`,
	name => `⚜️ ${name} ⚜️`,
	name => `『💖』${name}『✨』`,
	name => `࿐ ${name} ࿐`,
	name => `༺👑 ${name} 👑༻`,
	name => `꧁༺🌸 ${name} 🌸༻꧂`,
	name => `『☠️』${name}『☠️』`,
	name => `✧･ﾟ ${name} ･ﾟ✧`
];

module.exports = {
	config: {
		name: "autosetname",
		version: "4.0",
		author: "ShoRifullAh",
		cooldowns: 5,
		role: 1,
		description: "Random Premium Auto Set Name",
		category: "box chat"
	},

	onStart: async function ({
		message,
		event,
		args,
		threadsData
	}) {
		const action = (args[0] || "").toLowerCase();

		if (action === "on" || action === "off") {
			await threadsData.set(
				event.threadID,
				action === "on",
				"settings.enableAutoSetName"
			);

			return message.reply(
				`✨ Random Auto Name ${action.toUpperCase()} করা হয়েছে!`
			);
		}

		if (action === "view") {
			const enabled = await threadsData.get(
				event.threadID,
				"settings.enableAutoSetName"
			);

			return message.reply(
				`🌸 Auto Name Status: ${enabled ? "ON ✅" : "OFF ❌"}\n` +
				`🎨 Total Designs: ${designs.length}`
			);
		}

		return message.reply(
			"🌸 PREMIUM AUTO SET NAME 🌸\n\n" +
			"autosetname on - চালু\n" +
			"autosetname off - বন্ধ\n" +
			"autosetname view - স্ট্যাটাস"
		);
	},

	onEvent: async function ({
		event,
		api,
		threadsData
	}) {
		if (event.logMessageType !== "log:subscribe")
			return;

		const enabled = await threadsData.get(
			event.threadID,
			"settings.enableAutoSetName"
		);

		if (!enabled) return;

		const participants =
			event.logMessageData.addedParticipants || [];

		for (const user of participants) {
			const userName = user.fullName;
			const uid = user.userFbId;

			if (!userName || !uid) continue;

			const randomIndex = Math.floor(
				Math.random() * designs.length
			);

			const nickname = designs[randomIndex](userName);

			try {
				await api.changeNickname(
					nickname,
					event.threadID,
					uid
				);
			}
			catch (error) {
				console.error(
					"Auto Set Name Error:",
					error
				);
			}
		}
	}
};
