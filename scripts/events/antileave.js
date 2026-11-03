const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "antileave",
    version: "4.0",
    author: "Shorif Ullah",
    category: "events"
  },

  onStart: async ({ api, event, usersData }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;

    if (leftID !== author) return;

    let outputPath;

    try {
      const userName = await usersData.getName(leftID);
      const threadInfo = await api.getThreadInfo(threadID);

      const groupName =
        threadInfo.threadName || "আমাদের ফ্যামিলি";

      // Original Image
      const imagePath = path.join(
        __dirname,
        "file_000000009554821180b5c5fdd88de632.png"
      );

      if (!fs.existsSync(imagePath)) {
        console.log("Leave image not found!");
        return;
      }

      // Load Image
      const image = await loadImage(imagePath);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0);

      // Name Position
      ctx.fillStyle = "#050009";
      ctx.fillRect(525, 310, 205, 68);

      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let name = userName;
      let fontSize = 48;

      while (
        ctx.measureText(name).width > 190 &&
        fontSize > 20
      ) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px sans-serif`;
      }

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(name, 625, 345);

      ctx.fillStyle = "#FFFF00";
      ctx.fillText(name, 625, 345);

      // Group Name Position
      ctx.fillStyle = "#080008";
      ctx.fillRect(580, 1405, 315, 55);

      let groupFont = 46;
      ctx.font = `bold ${groupFont}px sans-serif`;

      while (
        ctx.measureText(groupName).width > 290 &&
        groupFont > 18
      ) {
        groupFont -= 2;
        ctx.font = `bold ${groupFont}px sans-serif`;
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(groupName, 738, 1432);

      ctx.fillStyle = "#FFFF00";
      ctx.fillText(groupName, 738, 1432);

      // Save Generated Image
      outputPath = path.join(
        __dirname,
        `leave_${threadID}_${Date.now()}.png`
      );

      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      // Add Member Again
      await api.addUserToGroup(leftID, threadID);

      // Send Only Image
      await api.sendMessage(
        {
          attachment: fs.createReadStream(outputPath)
        },
        threadID
      );

    } catch (err) {
      console.log("AntiLeave Error:", err);
    } finally {
      if (outputPath && fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  }
};
