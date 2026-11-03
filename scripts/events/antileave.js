const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "antileave",
    version: "3.1",
    author: "Shorif Ullah",
    category: "events"
  },

  onStart: async ({ api, event, usersData }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    if (leftID !== author) return;

    try {
      const imagePath = path.join(
        __dirname,
        "file_000000009554821180b5c5fdd88de632.png"
      );

      if (!fs.existsSync(imagePath)) {
        console.log("AntiLeave Image Not Found:", imagePath);
        return;
      }

      await api.addUserToGroup(leftID, threadID);

      await api.sendMessage({
        attachment: fs.createReadStream(imagePath)
      }, threadID);

    } catch (err) {
      console.log("AntiLeave Error:", err);
    }
  }
};
