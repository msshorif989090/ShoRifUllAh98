/**
 * GoatBot V2 Premium Welcome
 * 7 Random Colour Themes
 * Member + Admin + Group Profile Picture
 * Powered By Shorif Ullah
 */

const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const WIDTH = 1400;
const HEIGHT = 1500;

const TEMP_DIR = path.join(__dirname, "cache", "welcome");

const THEMES = [
  {
    main: "#16e66a",
    light: "#a5ffc4",
    dark: "#001b0b",
    accent: "#ffe34d"
  },
  {
    main: "#078cff",
    light: "#8be7ff",
    dark: "#00142b",
    accent: "#ffe34d"
  },
  {
    main: "#00dfff",
    light: "#a5f8ff",
    dark: "#001c25",
    accent: "#ffe34d"
  },
  {
    main: "#c026ff",
    light: "#f0aaff",
    dark: "#160020",
    accent: "#ffd84a"
  },
  {
    main: "#ff263e",
    light: "#ff9aa5",
    dark: "#260006",
    accent: "#ffd34d"
  },
  {
    main: "#ff27bb",
    light: "#ffb0e8",
    dark: "#26001b",
    accent: "#ffe34d"
  },
  {
    main: "#ffbf16",
    light: "#fff0a0",
    dark: "#241600",
    accent: "#fff1a6"
  }
];

function safeText(value, fallback = "Unknown") {
  if (!value) return fallback;
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .slice(0, 55);
}

async function getProfile(userID, api) {
  if (!userID) return null;

  try {
    const info = await api.getUserInfo(userID);
    const user = info && info[userID];

    return user && (
      user.thumbSrc ||
      user.profileUrl ||
      user.photoUrl ||
      user.image ||
      null
    );
  } catch (e) {
    return null;
  }
}

async function downloadImage(url, filePath) {
  if (!url) return null;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000
    });

    await fs.ensureDir(path.dirname(filePath));

    await fs.writeFile(
      filePath,
      Buffer.from(response.data)
    );

    return filePath;
  } catch (e) {
    return null;
  }
}

function roundedRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);

  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);

  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function glowText(
  ctx,
  text,
  x,
  y,
  size,
  color,
  align = "center",
  font = "bold"
) {
  ctx.save();

  ctx.textAlign = align;
  ctx.font = `${font} ${size}px sans-serif`;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;

  ctx.fillText(String(text), x, y, 1200);

  ctx.restore();
}

async function drawAvatar(ctx, imagePath, x, y, size, theme) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2,
    0,
    Math.PI * 2
  );

  ctx.clip();

  if (imagePath) {
    try {
      const img = await loadImage(imagePath);

      const scale = Math.max(
        size / img.width,
        size / img.height
      );

      const sw = size / scale;
      const sh = size / scale;

      ctx.drawImage(
        img,
        (img.width - sw) / 2,
        (img.height - sh) / 2,
        sw,
        sh,
        x,
        y,
        size,
        size
      );
    } catch (e) {
      ctx.fillStyle = "#202638";
      ctx.fillRect(x, y, size, size);
    }
  } else {
    ctx.fillStyle = "#202638";
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";

    ctx.fillText(
      "?",
      x + size / 2,
      y + size / 1.6
    );
  }

  ctx.restore();

  ctx.save();

  ctx.beginPath();
  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2 + 5,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 8;
  ctx.shadowColor = theme.main;
  ctx.shadowBlur = 22;
  ctx.stroke();

  ctx.restore();
}

async function createWelcomeCard(
  data,
  memberPath,
  adminPath,
  groupPath
) {
  // Random colour selection
  const theme =
    THEMES[Math.floor(Math.random() * THEMES.length)];

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(
    0, 0, WIDTH, HEIGHT
  );

  bg.addColorStop(0, "#03030a");
  bg.addColorStop(0.5, theme.dark);
  bg.addColorStop(1, "#03030a");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.save();

  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 6;
  ctx.shadowColor = theme.main;
  ctx.shadowBlur = 30;

  ctx.strokeRect(
    18,
    18,
    WIDTH - 36,
    HEIGHT - 36
  );

  ctx.restore();

  // Stars
  for (let i = 0; i < 45; i++) {
    const x = (i * 173) % WIDTH;
    const y = (i * 257) % HEIGHT;

    ctx.fillStyle = theme.light;
    ctx.globalAlpha = 0.45;

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      2 + (i % 3),
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Top Text
  glowText(
    ctx,
    "NEW JOURNEY BEGINS...",
    75,
    95,
    40,
    theme.light,
    "left",
    "italic"
  );

  glowText(
    ctx,
    "TOGETHER WE GROW STRONGER",
    WIDTH - 75,
    95,
    35,
    theme.light,
    "right",
    "italic"
  );

  // Member Main Picture
  ctx.save();

  ctx.beginPath();
  ctx.arc(
    WIDTH / 2,
    340,
    205,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 16;
  ctx.shadowColor = theme.main;
  ctx.shadowBlur = 35;
  ctx.stroke();

  ctx.restore();

  await drawAvatar(
    ctx,
    memberPath,
    WIDTH / 2 - 185,
    155,
    370,
    theme
  );

  glowText(
    ctx,
    "♛",
    WIDTH / 2,
    135,
    105,
    theme.accent
  );

  // Welcome Title
  glowText(
    ctx,
    "WELCOME",
    WIDTH / 2,
    655,
    145,
    theme.light
  );

  glowText(
    ctx,
    "TO OUR GROUP ♡",
    WIDTH / 2,
    725,
    62,
    theme.main,
    "center",
    "italic"
  );

  // Member + Admin Box
  roundedRect(
    ctx,
    70,
    775,
    1260,
    205,
    38,
    "rgba(3,8,22,0.92)",
    theme.main
  );

  // Member
  await drawAvatar(
    ctx,
    memberPath,
    105,
    815,
    125,
    theme
  );

  glowText(
    ctx,
    "NEW MEMBER",
    265,
    855,
    34,
    theme.main,
    "left"
  );

  glowText(
    ctx,
    data.memberName,
    265,
    920,
    45,
    "#ffffff",
    "left"
  );

  // Divider
  ctx.save();

  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(700, 800);
  ctx.lineTo(700, 955);
  ctx.stroke();

  ctx.restore();

  // Added By
  await drawAvatar(
    ctx,
    adminPath,
    755,
    815,
    125,
    theme
  );

  glowText(
    ctx,
    "ADDED BY",
    915,
    855,
    34,
    theme.main,
    "left"
  );

  glowText(
    ctx,
    data.adminName,
    915,
    920,
    45,
    "#ffffff",
    "left"
  );

  // Group Details Box
  roundedRect(
    ctx,
    105,
    1010,
    1190,
    330,
    34,
    "rgba(3,8,22,0.94)",
    theme.main
  );

  // Group Picture
  await drawAvatar(
    ctx,
    groupPath,
    155,
    1085,
    170,
    theme
  );

  glowText(
    ctx,
    "GROUP NAME",
    390,
    1125,
    32,
    theme.main,
    "left"
  );

  glowText(
    ctx,
    data.groupName,
    390,
    1190,
    45,
    "#ffffff",
    "left"
  );

  // Divider
  ctx.save();

  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(390, 1220);
  ctx.lineTo(1230, 1220);
  ctx.stroke();

  ctx.restore();

  glowText(
    ctx,
    "TOTAL MEMBERS",
    390,
    1280,
    30,
    theme.main,
    "left"
  );

  glowText(
    ctx,
    data.memberCount,
    750,
    1280,
    42,
    "#ffffff",
    "left"
  );

  // Bottom
  glowText(
    ctx,
    "★ ENJOY YOUR STAY! ★",
    WIDTH / 2,
    1410,
    42,
    theme.light,
    "center",
    "italic"
  );

  glowText(
    ctx,
    "Powered By Shorif Ullah",
    WIDTH / 2,
    1470,
    42,
    theme.accent,
    "center",
    "italic"
  );

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "welcome",
    eventType: ["log:subscribe"],
    version: "12.0.0",
    credits: "Shorif Ullah",
    description: "Premium Random Colour Welcome",
    category: "events",

    dependencies: {
      canvas: "",
      axios: "",
      "fs-extra": ""
    }
  },

  onStart: async function ({
    api,
    event,
    threadsData,
    usersData,
    message
  }) {
    if (event.logMessageType !== "log:subscribe") return;

    const threadID = event.threadID;

    const addedUsers =
      event.logMessageData?.addedParticipants;

    if (
      !Array.isArray(addedUsers) ||
      addedUsers.length === 0
    ) return;

    let threadInfo;

    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (e) {
      console.error("[welcome] Thread error:", e);
      return;
    }

    let threadData = null;

    try {
      if (threadsData && threadsData.get) {
        threadData = await threadsData.get(threadID);
      }
    } catch (e) {}

    if (
      threadData?.settings?.sendWelcomeMessage === false
    ) return;

    const groupName = safeText(
      threadInfo.threadName,
      "Our Group"
    );

    const groupURL =
      threadInfo.imageSrc ||
      threadInfo.photoUrl ||
      threadInfo.image ||
      null;

    const participants = Array.isArray(
      threadInfo.participantIDs
    )
      ? threadInfo.participantIDs.length
      : 0;

    const joinedAt = new Date().toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );

    const adminID = event.author || null;

    let adminName = "Group Admin";

    if (adminID) {
      try {
        adminName = await usersData.getName(adminID);
      } catch (e) {
        try {
          const info = await api.getUserInfo(adminID);

          adminName =
            info?.[adminID]?.name || "Group Admin";
        } catch (err) {}
      }
    }

    await fs.ensureDir(TEMP_DIR);

    for (const participant of addedUsers) {
      const memberID =
        participant.userFbId || participant.id;

      if (!memberID) continue;

      let memberName = safeText(
        participant.fullName,
        "New Member"
      );

      try {
        if (usersData?.getName) {
          memberName = safeText(
            await usersData.getName(memberID),
            memberName
          );
        }
      } catch (e) {}

      const memberURL = await getProfile(
        memberID,
        api
      );

      const adminURL = await getProfile(
        adminID,
        api
      );

      const stamp =
        `${Date.now()}_${String(memberID)}`;

      const memberPath = await downloadImage(
        memberURL,
        path.join(TEMP_DIR, `member_${stamp}.jpg`)
      );

      const adminPath = await downloadImage(
        adminURL,
        path.join(TEMP_DIR, `admin_${stamp}.jpg`)
      );

      const groupPath = await downloadImage(
        groupURL,
        path.join(TEMP_DIR, `group_${stamp}.jpg`)
      );

      try {
        const imageBuffer = await createWelcomeCard(
          {
            memberName,
            adminName: safeText(
              adminName,
              "Group Admin"
            ),
            groupName,
            memberCount: String(participants),
            joinedAt
          },
          memberPath,
          adminPath,
          groupPath
        );

        const caption =
          `🎉 Welcome ${memberName}!\n\n` +
          `👥 Group: ${groupName}\n` +
          `➕ Added By: ${adminName}\n` +
          `✨ Enjoy Your Stay!\n\n` +
          `Powered By Shorif Ullah`;

        await message.send({
          body: caption,
          attachment: imageBuffer
        });

      } catch (e) {
        console.error(
          "[welcome] Send error:",
          e
        );

        try {
          await message.send(
            `🎉 Welcome ${memberName} to ${groupName}!\n` +
            `Added By: ${adminName}`
          );
        } catch (err) {}

      } finally {
        if (memberPath) {
          await fs.remove(memberPath).catch(() => {});
        }

        if (adminPath) {
          await fs.remove(adminPath).catch(() => {});
        }

        if (groupPath) {
          await fs.remove(groupPath).catch(() => {});
        }
      }
    }
  }
};
