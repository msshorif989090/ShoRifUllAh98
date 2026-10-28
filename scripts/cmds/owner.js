const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.3.0",
    author: "Muhammad Shoriful Islam",
    role: 0,
    shortDescription: "Owner information with image",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText = 
 `
╭━━━〔 👑 OWNER INFO 👑 〕━━━╮

│ 👤 Name      : Muhammad Shoriful Islam
│ 😎 Nickname  : SHORIF
│ 🌍 Current   : Chandpur
│ 🏡 Home Town : Sylhet

├━━━〔 🔗 CONTACT ZONE 〕━━━

│ 📘 Facebook  : https://www.facebook.com/profile.php?id=61594814459802

│ 📩 Gmail     : Gmail কি তোমার দরকার? 
│               দরকার হলে আমার মালিকের ইনবক্সে লাড়া দাও,
│               মালিকই ব্যবস্থা করে দেবে! 

│ 📱 WhatsApp  : WhatsApp নাম্বার লাগবে তোমার! 
│               যাও আমার মালিকের ইনবক্সে গুতা দাও,
│               তারপর আমার মালিকেও তোমাকে গুতা দিয়া দিয়ে দিবে! 😂

╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner.jpg");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgLink = "https://kommodo.ai/i/hvi3yBqDAU0Y0eRyLN1N";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};
