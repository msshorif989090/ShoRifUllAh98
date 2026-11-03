const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "antileave",
    version: "5.0",
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

      const groupName = threadInfo.threadName || "আমাদের ফ্যামিলি";

      const imagePath = path.join(
        __dirname,
        "file_000000009554821180b5c5fdd88de632.png"
      );

      if (!fs.existsSync(imagePath)) {
        console.log("Leave image not found!");
        return;
      }

      const image = await loadImage(imagePath);

      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      const sx = image.width / 1170;
      const sy = image.height / 1280;

      ctx.drawImage(image, 0, 0);

      // MEMBER NAME
      ctx.fillStyle = "#080008";
      ctx.fillRect(
        435 * sx,
        263 * sy,
        175 * sx,
        49 * sy
      );

      let nameSize = 40 * sx;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      do {
        ctx.font = `bold ${nameSize}px sans-serif`;
        if (ctx.measureText(userName).width <= 165 * sx) break;
        nameSize -= 2 * sx;
      } while (nameSize > 12 * sx);

      ctx.fillStyle = "#FFFF00";
      ctx.fillText(
        userName,
        522 * sx,
        287 * sy
      );

      // GROUP NAME
      ctx.fillStyle = "#080008";
      ctx.fillRect(
        460 * sx,
        1173 * sy,
        300 * sx,
        55 * sy
      );

      let groupSize = 40 * sx;

      do {
        ctx.font = `bold ${groupSize}px sans-serif`;
        if (ctx.measureText(groupName).width <= 285 * sx) break;
        groupSize -= 2 * sx;
      } while (groupSize > 12 * sx);

      ctx.fillStyle = "#FFFF00";
      ctx.fillText(
        groupName,
        610 * sx,
        1200 * sy
      );

      outputPath = path.join(
        __dirname,
        `leave_${Date.now()}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      await api.addUserToGroup(leftID, threadID);

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
