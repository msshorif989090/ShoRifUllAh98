const { drive } = global.utils;
const { nickNameBot } = global.GoatBot.config;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "welcome",
    version: "9.0",
    author: "M SHORIF ULLAH",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage:
        "👑 Welcome {userName}!\n✨ Welcome to {threadName}\n🎉 You are our {memberCount} member!\n💎 Enjoy your stay!",
      botAddedMessage:
        "👑 Thanks for adding me to your group!\n⚙️ Type /help to see commands."
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);

    if (!threadData.settings.sendWelcomeMessage) return;

    const addedMembers = event.logMessageData.addedParticipants || [];
    const threadName = threadData.threadName || "Our Group";
    const inviterID = event.author;
    const botID = api.getCurrentUserID();

    for (const user of addedMembers) {
      const userID = user.userFbId;

      if (userID == botID) {
        if (nickNameBot) {
          await api.changeNickname(nickNameBot, threadID, botID);
        }
        return message.send(getLang("botAddedMessage"));
      }

      const userName = user.fullName || "New Member";

      let inviterName = "Group Admin";
      try {
        if (inviterID) {
          inviterName = await usersData.getName(inviterID);
        }
      } catch (_) {}

      let memberCount = event.participantIDs
        ? event.participantIDs.length
        : 0;

      let welcomeMessage =
        threadData.data.welcomeMessage ||
        getLang("defaultWelcomeMessage");

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{userTag\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, memberCount)
        .replace(/\{inviterName\}/g, inviterName);

      let welcomeImagePath = null;

      try {
        welcomeImagePath = await createWelcomeCard({
          userName,
          threadName,
          memberCount,
          inviterName,
          newUserID: userID,
          inviterID,
          threadID,
          api
        });
      } catch (err) {
        console.error("Welcome Card Error:", err);
      }

      const form = {
        body: welcomeMessage,
        mentions: [{ tag: userName, id: userID }]
      };

      if (welcomeImagePath && fs.existsSync(welcomeImagePath)) {
        form.attachment = fs.createReadStream(welcomeImagePath);
      } else if (threadData.data.welcomeAttachment) {
        const attachments = threadData.data.welcomeAttachment
          .map(f => drive.getFile(f, "stream"));

        form.attachment = (await Promise.allSettled(attachments))
          .filter(x => x.status === "fulfilled")
          .map(x => x.value);
      }

      await message.send(form);

      if (welcomeImagePath && fs.existsSync(welcomeImagePath)) {
        setTimeout(() => {
          try {
            fs.unlinkSync(welcomeImagePath);
          } catch (_) {}
        }, 10000);
      }
    }
  }
};


// ========================================
// 13 VIP DESIGNS
// 8 NORMAL + 5 LEGENDARY
// ========================================

const DESIGNS = [
  {
    name: "Gold Royal",
    legendary: false,
    bg: "#100c08",
    main: "#d6a83d",
    second: "#fff0a6",
    glow: "#ffd700"
  },
  {
    name: "Purple King",
    legendary: false,
    bg: "#10091d",
    main: "#a66cff",
    second: "#edcaff",
    glow: "#b56cff"
  },
  {
    name: "Neon Blue",
    legendary: false,
    bg: "#06111e",
    main: "#29c7ff",
    second: "#c4f4ff",
    glow: "#00cfff"
  },
  {
    name: "Pink Romantic",
    legendary: false,
    bg: "#1c0815",
    main: "#ff73b7",
    second: "#ffd4e9",
    glow: "#ff4da6"
  },
  {
    name: "Red Devil",
    legendary: false,
    bg: "#1a0709",
    main: "#ff4545",
    second: "#ffc0c0",
    glow: "#ff2424"
  },
  {
    name: "Emerald Green",
    legendary: false,
    bg: "#06150e",
    main: "#28d68a",
    second: "#c0ffe0",
    glow: "#00ff99"
  },
  {
    name: "Butterfly",
    legendary: false,
    bg: "#10091a",
    main: "#c28aff",
    second: "#f3d8ff",
    glow: "#dc8aff"
  },
  {
    name: "Black Luxury",
    legendary: false,
    bg: "#080808",
    main: "#c5c5c5",
    second: "#ffffff",
    glow: "#aaaaaa"
  },

  // LEGENDARY DESIGNS

  {
    name: "Gold Emperor",
    legendary: true,
    bg: "#100b02",
    main: "#ffca28",
    second: "#fff3b0",
    glow: "#ffb300"
  },
  {
    name: "Diamond Royal",
    legendary: true,
    bg: "#06121c",
    main: "#7eeaff",
    second: "#ffffff",
    glow: "#00d9ff"
  },
  {
    name: "Black Emperor",
    legendary: true,
    bg: "#050505",
    main: "#e7c66b",
    second: "#ffffff",
    glow: "#ffcc33"
  },
  {
    name: "Galaxy Legend",
    legendary: true,
    bg: "#0b0620",
    main: "#bd83ff",
    second: "#e9d5ff",
    glow: "#8c43ff"
  },
  {
    name: "Crown Master",
    legendary: true,
    bg: "#150707",
    main: "#ffb347",
    second: "#ffe5a3",
    glow: "#ff7b00"
  }
];

function randomDesign() {
  return DESIGNS[Math.floor(Math.random() * DESIGNS.length)];
}


// ========================================
// PROFILE IMAGE
// ========================================

async function getProfile(uid, api) {
  try {
    const info = await api.getUserInfo([uid]);
    const url = info[uid]?.thumbSrc;

    if (url) {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 12000
      });

      return await loadImage(Buffer.from(res.data));
    }
  } catch (err) {
    console.log("Profile image unavailable:", uid);
  }

  return null;
}


async function getGroupImage(threadID, api) {
  try {
    const info = await api.getThreadInfo(threadID);

    if (info.imageSrc) {
      const res = await axios.get(info.imageSrc, {
        responseType: "arraybuffer",
        timeout: 12000
      });

      return await loadImage(Buffer.from(res.data));
    }
  } catch (_) {}

  return null;
}


// ========================================
// DRAW HELPERS
// ========================================

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}


function circleImage(ctx, img, x, y, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = "#222222";
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.restore();
}


function fitText(ctx, text, maxWidth, size = 32) {
  let current = size;

  ctx.font = `bold ${current}px Arial`;

  while (
    ctx.measureText(text).width > maxWidth &&
    current > 15
  ) {
    current--;
    ctx.font = `bold ${current}px Arial`;
  }

  return current;
}


function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


// ========================================
// WELCOME CARD
// ========================================

async function createWelcomeCard(data) {
  const {
    userName,
    threadName,
    memberCount,
    inviterName,
    newUserID,
    inviterID,
    threadID,
    api
  } = data;

  const W = 1400;
  const H = 800;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const design = randomDesign();

  const [userImg, inviterImg, groupImg] = await Promise.all([
    getProfile(newUserID, api),
    inviterID ? getProfile(inviterID, api) : null,
    getGroupImage(threadID, api)
  ]);

  const C = design.main;
  const S = design.second;

  // Background
  ctx.fillStyle = design.bg;
  ctx.fillRect(0, 0, W, H);

  // Background glow
  const glow = ctx.createRadialGradient(
    700, 400, 50,
    700, 400, 800
  );

  glow.addColorStop(0, C + "25");
  glow.addColorStop(1, "#00000000");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer border
  ctx.save();
  ctx.shadowColor = design.glow;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = C;
  ctx.lineWidth = 4;
  roundRect(ctx, 12, 12, W - 24, H - 24, 35);
  ctx.stroke();
  ctx.restore();

  // Left panel
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  roundRect(ctx, 35, 35, 490, 730, 28);
  ctx.fill();

  // Right panel
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundRect(ctx, 550, 35, 815, 730, 28);
  ctx.fill();

  // New member heading
  ctx.textAlign = "center";
  ctx.fillStyle = C;
  ctx.font = "bold 26px Arial";
  ctx.fillText("✦ NEW MEMBER ✦", 280, 95);

  // User avatar frame
  ctx.save();
  ctx.shadowColor = design.glow;
  ctx.shadowBlur = 35;
  ctx.strokeStyle = C;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(280, 350, 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  circleImage(ctx, userImg, 280, 350, 165);

  // Crown
  ctx.font = "58px Arial";
  ctx.fillStyle = C;
  ctx.fillText("👑", 280, 155);

  // User name
  const nameSize = fitText(ctx, userName, 420, 38);

  ctx.font = `bold ${nameSize}px Arial`;
  ctx.fillStyle = S;
  ctx.fillText(userName, 280, 575);

  // Member number
  ctx.font = "bold 25px Arial";
  ctx.fillStyle = C;
  ctx.fillText(
    `✦ ${ordinal(memberCount)} MEMBER ✦`,
    280,
    640
  );

  // Group heading
  ctx.textAlign = "left";
  ctx.font = "bold 43px Arial";
  ctx.fillStyle = S;
  ctx.fillText("Welcome To Our Group", 600, 115);

  // Group name
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = C;
  ctx.fillText("GROUP NAME", 600, 180);

  // Group picture
  ctx.save();
  roundRect(ctx, 600, 205, 125, 125, 20);
  ctx.clip();

  if (groupImg) {
    ctx.drawImage(groupImg, 600, 205, 125, 125);
  } else {
    ctx.fillStyle = "#222222";
    ctx.fillRect(600, 205, 125, 125);
  }

  ctx.restore();

  ctx.strokeStyle = C;
  ctx.lineWidth = 3;
  roundRect(ctx, 600, 205, 125, 125, 20);
  ctx.stroke();

  const groupSize = fitText(ctx, threadName, 560, 36);

  ctx.font = `bold ${groupSize}px Arial`;
  ctx.fillStyle = S;
  ctx.fillText(threadName, 755, 275);

  // Divider
  ctx.strokeStyle = C + "80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(600, 365);
  ctx.lineTo(1300, 365);
  ctx.stroke();

  // Added by
  ctx.font = "bold 23px Arial";
  ctx.fillStyle = C;
  ctx.fillText("ADDED BY", 600, 420);

  // Inviter picture
  circleImage(ctx, inviterImg, 665, 515, 65);

  ctx.strokeStyle = C;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(665, 515, 70, 0, Math.PI * 2);
  ctx.stroke();

  const inviterSize = fitText(ctx, inviterName, 450, 32);

  ctx.font = `bold ${inviterSize}px Arial`;
  ctx.fillStyle = S;
  ctx.fillText(inviterName, 770, 525);

  // Welcome message
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(ctx, 600, 620, 700, 75, 18);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.font = "bold 23px Arial";
  ctx.fillStyle = S;
  ctx.fillText(
    "Glad to have you here! Enjoy your stay ✨",
    950,
    665
  );

  // Owner branding
  ctx.textAlign = "right";
  ctx.font = "bold 25px Arial";
  ctx.fillStyle = C;
  ctx.shadowColor = design.glow;
  ctx.shadowBlur = 12;

  ctx.fillText(
    "👑 Powered By M SHORIF ULLAH",
    1300,
    735
  );

  ctx.shadowBlur = 0;

  // Legendary badge
  if (design.legendary) {
    ctx.textAlign = "center";
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#ffda55";
    ctx.fillText("✦ LEGENDARY EDITION ✦", 950, 755);
  }

  // Save image
  const filePath = path.join(
    __dirname,
    `welcome_${Date.now()}.png`
  );

  await fs.writeFile(
    filePath,
    canvas.toBuffer("image/png")
  );

  return filePath;
    }
