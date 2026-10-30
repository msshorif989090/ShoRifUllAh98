module.exports = {
  config: {
    name: "adminmention",
    version: "1.3.2",
    author: "SHORIF",
    countDown: 0,
    role: 0,
    shortDescription: "Replies angrily when someone tags admins",
    longDescription: "If anyone mentions an admin, bot will angrily reply with random messages.",
    category: "system"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const adminIDs = [
  "61594814459802",
  "100078049308655",
  "100090071683807",
  "100092480994957"
].map(String);

    // Skip if sender is admin
    if (adminIDs.includes(String(event.senderID))) return;

    // যদি কেউ মেনশন দেয়
    const mentionedIDs = event.mentions ? Object.keys(event.mentions).map(String) : [];
    const isMentioningAdmin = adminIDs.some(id => mentionedIDs.includes(id));

    if (!isMentioningAdmin) return;

    // র‍্যান্ডম রাগী রিপ্লাই
    const REPLIES = [
      " boss ওরে মেনশন দিস না বউ নিয়া চিপায় গেছে 😩🐸",
      "আরে বোকাচোদা mantion দিয়ে লাভ নেই শরিফ bo‌ss এখন প্রেমের class এ বেসতো 🥱",
  "শরীফ বস কে খোঁজস কেন  প্রেম করবি নাকি ব্যবস্থা করে দিবি প্রেম করার জন্য ? 😀",
  "Arehh আবাল tor কোন কাজ নাই ShoRif BoSs কে সারাদিন শুধু mantion মারস ?😒🤌",
  "ShoRif BoSs কে  mantion দেওয়ার আগে আমার Kache  অনুমতি নেস ken  আবাল 😎",
      "বস এক আবাল তুমারে ডাকতেছে 😂😏",
      " বুকাচুদা তুই মেনশন দিবি না আমার বস রে 🥹",
      "মেনশন দিছস আর বেচে যাবি? দারা বলতাছি 😠",
      "Boss এখন বিজি আছে 😌🥱"
    ];

    const randomReply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    return message.reply(randomReply);
  }
};
