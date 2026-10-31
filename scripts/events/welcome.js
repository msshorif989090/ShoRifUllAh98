/**
 * GoatBot V2 Welcome Event
 * 6 Random Premium Color Themes
 * Original Card Design + Framework Features
 */

const { drive } = global.utils || {};
const nickNameBot = global.GoatBot?.config?.nickNameBot;

const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ========================================
// 6 PREMIUM COLOR THEMES
// ========================================

const THEMES = [
  {
    name: "ELECTRIC BLUE",
    bg1: "#06152f",
    bg2: "#0877d8",
    accent: "#42d8ff",
    light: "#b9f4ff",
    panel: "rgba(4,23,52,.84)"
  },
  {
    name: "ROYAL PURPLE",
    bg1: "#190b35",
    bg2: "#7136c9",
    accent: "#d5a6ff",
    light: "#f1d8ff",
    panel: "rgba(31,10,57,.85)"
  },
  {
    name: "EMERALD GREEN",
    bg1: "#042b25",
    bg2: "#079b70",
    accent: "#57ffd0",
    light: "#c6ffeb",
    panel: "rgba(2,39,32,.85)"
  },
  {
    name: "CRIMSON RED",
    bg1: "#300815",
    bg2: "#c32645",
    accent: "#ff718b",
    light: "#ffd0d9",
    panel: "rgba(48,5,22,.85)"
  },
  {
    name: "ROYAL GOLD",
    bg1: "#281a05",
    bg2: "#a97919",
    accent: "#ffdc72",
    light: "#fff0bb",
    panel: "rgba(43,27,4,.87)"
  },
  {
    name: "NEON CYAN",
    bg1: "#03252d",
    bg2: "#078da0",
    accent: "#52f5ff",
    light: "#c5ffff",
    panel: "rgba(1,35,43,.86)"
  }
];

const SETTINGS = {
  width: 1200,
  height: 650,

  welcomeText: "WELCOME TO OUR FAMILY",

  message: "👑 Welcome {userName}!\n✨ Welcome to {threadName}\n🎉 You are our {memberCount} member!\n💎 Enjoy your stay!",

  footer: "👑 Powered By M SHORIF ULLAH 👑",

  sendText: true,

  cacheDir: path.join(__dirname, "cache", "welcome")
};

// ========================================
// HELPERS
// ========================================

const randomTheme = () =>
  THEMES[Math.floor(Math.random() * THEMES.length)];

const clean = (v, fallback = "Unknown") =>
  String(v || fallback).replace(/[<>]/g, "").trim();

async function downloadImage(url, file) {
  if (!url) return null;

  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    await fs.ensureDir(path.dirname(file));
    await fs.writeFile(file, res.data);

    return file;
  } catch (_) {
    return null;
  }
}

function rounded(ctx, x, y, w, h, r, fill, stroke, line = 2) {
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
    ctx.strokeStyle = stroke;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

function cover(ctx, img, x, y, w, h) {
  const scale = Math.max(
    w / img.width,
    h / img.height
  );

  const sw = w / scale;
  const sh = h / scale;

  ctx.drawImage(
    img,
    (img.width - sw) / 2,
    (img.height - sh) / 2,
    sw,
    sh,
    x,
    y,
    w,
    h
  );
}

function avatar(ctx, img, x, y, size, accent) {
  ctx.save();

  ctx.shadowColor = accent;
  ctx.shadowBlur = 22;

  ctx.beginPath();

  ctx.arc(
    x + size / 2,
    y + size / 2,
    size / 2 + 7,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = accent;
  ctx.fill();

  ctx.restore();

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

  if (img) {
    cover(ctx, img, x, y, size, size);
  } else {
    ctx.fillStyle = "#26364d";
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "?",
      x + size / 2,
      y + size / 2 + 20
    );
  }

  ctx.restore();
}

function fit(ctx, text, max, initial) {
  let size = initial;

  do {
    ctx.font = `bold ${size}px Arial`;

    if (
      ctx.measureText(text).width <= max ||
      size <= 22
    ) {
      break;
    }

    size -= 2;

  } while (size > 20);

  return size;
}

// ========================================
// PROFILE IMAGE
// ========================================

async function getProfile(uid, api) {
  try {
    const info = await api.getUserInfo([uid]);
    const user = info[uid] || {};

    return (
      user.thumbSrc ||
      user.profileUrl ||
      user.photoUrl ||
      null
    );
  } catch (_) {
    return null;
  }
}

// ========================================
// WELCOME CARD GENERATOR
// ========================================

async function buildCard(info) {
  const theme = randomTheme();

  const W = SETTINGS.width;
  const H = SETTINGS.height;
  const dir = SETTINGS.cacheDir;

  const stamp =
    `${Date.now()}-${Math.floor(Math.random() * 9999)}`;

  const files = await Promise.all([
    downloadImage(
      info.memberURL,
      path.join(dir, `member-${stamp}.jpg`)
    ),

    downloadImage(
      info.groupURL,
      path.join(dir, `group-${stamp}.jpg`)
    ),

    downloadImage(
      info.adderURL,
      path.join(dir, `adder-${stamp}.jpg`)
    )
  ]);

  try {
    const imgs = await Promise.all(
      files.map(async f => {
        try {
          return f ? await loadImage(f) : null;
        } catch (_) {
          return null;
        }
      })
    );

    const [memberImg, groupImg, adderImg] = imgs;

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background
    const gradient = ctx.createLinearGradient(
      0, 0, W, H
    );

    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative lines
    ctx.save();

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;

    for (let i = -H; i < W; i += 48) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }

    ctx.restore();

    // Card frame
    rounded(
      ctx,
      24, 24,
      W - 48,
      H - 48,
      34,
      "rgba(0,0,0,.10)",
      theme.accent,
      4
    );

    rounded(
      ctx,
      43, 43,
      W - 86,
      H - 86,
      27,
      theme.panel,
      "rgba(255,255,255,.2)",
      2
    );

    // Header
    ctx.textAlign = "center";
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 20;

    ctx.fillStyle = theme.light;
    ctx.font = "bold 54px Arial";

    ctx.fillText(
      SETTINGS.welcomeText,
      W / 2,
      120
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";

    ctx.fillText(
      "WE ARE HAPPY TO HAVE YOU HERE",
      W / 2,
      160
    );

    // Member avatar
    avatar(
      ctx,
      memberImg,
      105,
      205,
      210,
      theme.accent
    );

    // Member name
    ctx.textAlign = "left";

    ctx.fillStyle = theme.light;
    ctx.font = "bold 25px Arial";

    ctx.fillText(
      "NEW MEMBER",
      365,
      250
    );

    ctx.font =
      `bold ${fit(ctx, info.memberName, 720, 48)}px Arial`;

    ctx.fillStyle = "#fff";

    ctx.fillText(
      info.memberName,
      365,
      315
    );

    // Member number
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 30px Arial";

    ctx.fillText(
      `MEMBER NO. ${info.memberCount}`,
      365,
      370
    );

    // Group panel
    rounded(
      ctx,
      350, 405,
      740, 105,
      20,
      "rgba(255,255,255,.08)",
      "rgba(255,255,255,.2)",
      2
    );

    avatar(
      ctx,
      groupImg,
      377,
      419,
      76,
      theme.accent
    );

    ctx.fillStyle = theme.light;
    ctx.font = "bold 20px Arial";

    ctx.fillText("GROUP", 480, 447);

    ctx.font =
      `bold ${fit(ctx, info.groupName, 590, 30)}px Arial`;

    ctx.fillStyle = "#fff";

    ctx.fillText(
      info.groupName,
      480,
      483
    );

    // Added by
    avatar(
      ctx,
      adderImg,
      105,
      455,
      78,
      theme.accent
    );

    ctx.fillStyle = theme.light;
    ctx.font = "bold 18px Arial";

    ctx.fillText("ADDED BY", 205, 480);

    ctx.fillStyle = "#fff";

    ctx.font =
      `bold ${fit(ctx, info.adderName, 130, 23)}px Arial`;

    ctx.fillText(
      info.adderName,
      205,
      510
    );

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 21px Arial";

    ctx.fillText(
      SETTINGS.footer,
      W / 2,
      585
    );

    await fs.ensureDir(dir);

    const output = path.join(
      dir,
      `welcome-${stamp}.png`
    );

    await fs.writeFile(
      output,
      canvas.toBuffer("image/png")
    );

    return {
      output,
      theme
    };

  } finally {
    for (const f of files) {
      if (f) {
        await fs.remove(f).catch(() => {});
      }
    }
  }
}

// ========================================
// GOATBOT WELCOME EVENT
// ========================================

module.exports = {
  config: {
    name: "welcome",
    version: "10.0",
    author: "M SHORIF ULLAH",
    category: "events"
  },

  langs: {
    en: {
      botAddedMessage:
        "👑 Thanks for adding me to your group!\n⚙️ Type /help to see commands."
    }
  },

  onStart: async function ({
    threadsData,
    message,
    event,
    api,
    usersData,
    getLang
  }) {
    if (event.logMessageType !== "log:subscribe") {
      return;
    }

    const { threadID } = event;

    const threadData = await threadsData.get(threadID);

    if (!threadData.settings?.sendWelcomeMessage) {
      return;
    }

    const addedMembers =
      event.logMessageData?.addedParticipants || [];

    if (!addedMembers.length) return;

    const threadName = clean(
      threadData.threadName,
      "Our Group"
    );

    const inviterID = event.author;
    const botID = api.getCurrentUserID();

    let threadInfo = {};

    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (err) {
      console.log("Thread info unavailable:", err.message);
    }

    const groupURL =
      threadInfo.imageSrc ||
      threadInfo.image ||
      null;

    for (const user of addedMembers) {
      const userID = user.userFbId || user.id;

      if (!userID) continue;

      // Bot added to group
      if (String(userID) === String(botID)) {
        if (nickNameBot) {
          try {
            await api.changeNickname(
              nickNameBot,
              threadID,
              botID
            );
          } catch (err) {
            console.log("Nickname Error:", err.message);
          }
        }

        const botMessage = getLang
          ? getLang("botAddedMessage")
          : "👑 Thanks for adding me to your group!\n⚙️ Type /help to see commands.";

        await message.send(botMessage);
        continue;
      }

      const userInfo = await api.getUserInfo([userID]);
      const memberData = userInfo[userID] || {};

      const userName = clean(
        user.fullName || memberData.name,
        "New Member"
      );

      let inviterName = "Group Admin";

      try {
        if (inviterID) {
          inviterName = await usersData.getName(inviterID);
        }
      } catch (_) {}

      let adderURL = null;

      if (inviterID) {
        adderURL = await getProfile(inviterID, api);
      }

      const memberURL =
        memberData.thumbSrc ||
        memberData.profileUrl ||
        memberData.photoUrl ||
        null;

      let memberCount =
        Array.isArray(event.participantIDs)
          ? event.participantIDs.length
          : Array.isArray(threadInfo.participantIDs)
            ? threadInfo.participantIDs.length
            : "—";

      const welcomeMessage =
        threadData.data?.welcomeMessage ||
        SETTINGS.message;

      const finalMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{userTag\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, String(memberCount))
        .replace(/\{inviterName\}/g, inviterName);

      let welcomeImagePath = null;

      try {
        const result = await buildCard({
          memberName: userName,
          groupName: threadName,
          memberCount,
          adderName: inviterName,
          memberURL,
          groupURL,
          adderURL
        });

        welcomeImagePath = result.output;

      } catch (err) {
        console.error("Welcome Card Error:", err);
      }

      const form = {
        body: SETTINGS.sendText ? finalMessage : "",
        mentions: [
          {
            tag: userName,
            id: userID
          }
        ]
      };

      if (
        welcomeImagePath &&
        await fs.pathExists(welcomeImagePath)
      ) {
        form.attachment =
          fs.createReadStream(welcomeImagePath);

      } else if (
        Array.isArray(threadData.data?.welcomeAttachment) &&
        drive?.getFile
      ) {
        const attachments = threadData.data.welcomeAttachment
          .map(f => drive.getFile(f, "stream"));

        const results = await Promise.allSettled(attachments);

        form.attachment = results
          .filter(x => x.status === "fulfilled")
          .map(x => x.value);
      }

      try {
        await message.send(form);
      } finally {
        if (welcomeImagePath) {
          setTimeout(() => {
            fs.remove(welcomeImagePath).catch(() => {});
          }, 10000);
        }
      }
    }
  }
};
