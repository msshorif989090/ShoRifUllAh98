const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");

const CACHE_DIR = path.join(__dirname, "cache");
const SONG_API_BASE = "https://eryxenx.agi.bd/api/song";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getError(err) {
    const data = err.response?.data;

    if (typeof data === "string") return data.slice(0, 300);

    return data?.error ||
        data?.message ||
        err.message ||
        "Unknown error";
}

async function requestWithRetry(request, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await request();
        } catch (err) {
            const status = err.response?.status;

            const retryable =
                !status ||
                [408, 429, 500, 502, 503, 504].includes(status);

            if (!retryable || i === retries) {
                throw err;
            }

            console.log(
                `[sing] Retry ${i + 1}/${retries}: ${getError(err)}`
            );

            await sleep(2000 * (i + 1));
        }
    }
}

function createCache() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

function tempFilePath() {
    createCache();

    return path.join(
        CACHE_DIR,
        `song_${Date.now()}_${Math.floor(Math.random() * 9999)}.mp3`
    );
}

async function fetchSongInfo(videoUrl) {
    const response = await requestWithRetry(() =>
        axios.get(SONG_API_BASE, {
            params: { url: videoUrl },
            timeout: 60000
        })
    );

    const data = response.data;

    if (!data?.success || !data?.downloadUrl) {
        throw new Error(
            data?.error || "Song API download URL dey nai."
        );
    }

    return data;
}

async function downloadSong(url, filePath) {
    if (!url || !/^https?:\/\//i.test(url)) {
        throw new Error("Invalid download URL.");
    }

    const response = await requestWithRetry(() =>
        axios.get(url, {
            responseType: "stream",
            timeout: 300000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        })
    );

    const contentType =
        response.headers["content-type"] || "";

    if (
        contentType &&
        !/audio|video|octet-stream/i.test(contentType)
    ) {
        response.data.destroy();

        throw new Error(
            `Invalid audio file. Content-Type: ${contentType}`
        );
    }

    try {
        await pipeline(
            response.data,
            fs.createWriteStream(filePath)
        );

        const stats = fs.statSync(filePath);

        if (stats.size < 1024) {
            throw new Error("Downloaded file is too small.");
        }

    } catch (err) {
        try {
            fs.unlinkSync(filePath);
        } catch (_) {}

        throw err;
    }
}

async function sendSong(message, data) {
    for (let i = 0; i < 3; i++) {
        try {
            return await message.reply(data);
        } catch (err) {
            console.error("[sing] Send error:", err.message);

            if (i === 2) throw err;

            await sleep(2000);
        }
    }
}

function react(api, messageID, emoji) {
    try {
        api.setMessageReaction(
            emoji,
            messageID,
            () => {},
            true
        );
    } catch (_) {}
}

module.exports.config = {
    name: "sing",
    aliases: ["song"],
    version: "3.0.0",
    author: "ShoRif",
    countDown: 5,
    role: 0,

    shortDescription: "YouTube song search and download",

    longDescription: "Search songs and send audio",

    category: "media",

    guide: {
        en: "{pn} <song name>\nExample: {pn} mann mera"
    }
};

module.exports.onStart = async function ({
    api,
    event,
    args,
    message
}) {
    const { messageID } = event;

    const query = args.join(" ").trim();

    if (!query) {
        return message.reply(
            "❌ Song name den.\nExample: sing mann mera"
        );
    }

    let file;

    let stage = "YouTube Search";

    react(api, messageID, "⏳");

    try {
        console.log("[sing] Searching:", query);

        const search = await yts(query);

        const video = search.videos?.[0];

        if (!video) {
            throw new Error("No song found.");
        }

        stage = "Song API";

        console.log("[sing] Found:", video.title);

        const info = await fetchSongInfo(video.url);

        stage = "Song Download";

        file = tempFilePath();

        await downloadSong(info.downloadUrl, file);

        stage = "Messenger Upload";

        await sendSong(message, {
            body:
                `🎵 ${info.title || video.title}\n` +
                `⏱ ${video.timestamp || "Unknown"}`,
            attachment: fs.createReadStream(file)
        });

        react(api, messageID, "✅");

        console.log("[sing] Success:", video.title);

    } catch (err) {
        console.error(
            `[sing] ${stage} Error:`,
            err.response?.status || "",
            getError(err)
        );

        react(api, messageID, "❌");

        let errorMessage = getError(err);

        if (err.response?.status === 503) {
            errorMessage =
                "Server temporarily unavailable (503). Please try again later.";
        }

        return message.reply(
            `❌ ${stage} Failed:\n${errorMessage}`
        );

    } finally {
        if (file && fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
            } catch (_) {}
        }
    }
};
