const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "antileave",
    version: "3.0",
    author: "Shorif Ullah",
    category: "events"
  },

  onStart: async ({ api, event, usersData }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    if (leftID !== author) return;

    try {
      const userName = await usersData.getName(leftID);
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName || "আমাদের ফ্যামিলি";

      await api.addUserToGroup(leftID, threadID);

      // Image location
      const imagePath = path.join(__dirname, "leave.png");

      const body = `╭───────✦🤣✦───────╮
       🚨 পালানোর চেষ্টা! 🚨
╰───────✦🤣✦───────╯

🤣 আরে আরে! ${userName} আমাদের গ্রুপ ছেড়ে পালাতে চাচ্ছিল! কেন রে কেন? 😂

🏃‍♂️ ভাবছিলি পালিয়ে বাঁচবি? হায়রে কপাল! 🤣

🚨 পালানোর চেষ্টা করে কোনো লাভ নাই, শেষ পর্যন্ত ধরা খেয়ে গেছিস! 😜

🤭 আমাদের ফ্যামিলি থেকে ছেড়ে যাওয়ার এত শখ কেন তোর?

🔄 তোকে আবার ধরে নিয়ে আসা হলো! 😂 এবার পালানোর চিন্তা বাদ দিয়ে চুপচাপ সবার সাথে আড্ডা মার!

👑 মনে রাখিস, এই গ্রুপে ঢোকা সহজ, কিন্তু বের হওয়া ভীষণ কঠিন! 🤣

❤️ পালানোর চিন্তা বাদ, এবার হাসিমুখে সবার সাথে আড্ডা চালিয়ে যা! 😂

╭───────✦👑✦───────╮
❤️ ${groupName} ❤️
╰───────✦🤣✦───────╯`;

      if (fs.existsSync(imagePath)) {
        await api.sendMessage({
          body,
          attachment: fs.createReadStream(imagePath)
        }, threadID);
      } else {
        await api.sendMessage(body, threadID);
      }

    } catch (err) {
      console.log("AntiLeave Error:", err);
    }
  }
};
