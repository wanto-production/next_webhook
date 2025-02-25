import { Bot, webhookCallback, InputMediaPhoto } from "grammy";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TELEGRAM_TOKEN = process.env["TELEGRAM_TOKEN"];
const GEMINI_APIKEY = process.env["GEMINI_APIKEY"];
const RAPIDAPI_KEY = process.env["RAPIDAPI_KEY"];

if (!TELEGRAM_TOKEN || !GEMINI_APIKEY || !RAPIDAPI_KEY) {
    throw new Error("❌ Missing environment variables! Please set TELEGRAM_TOKEN, GEMINI_APIKEY, and RAPIDAPI_KEY.");
}

const genAI = new GoogleGenerativeAI(GEMINI_APIKEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const bot = new Bot(TELEGRAM_TOKEN);

bot.api.setMyCommands([
    { command: "start", description: "Bot description" },
    { command: "gemini", description: "Ask Gemini AI" }
]);

// 📌 START COMMAND
bot.command("start", (c) => {
    return c.reply("🤖 Hello,\nI am a Telegram bot\nMade by @iwanSlebew to convert TikTok links to video/photos.");
});

// 📌 GEMINI COMMAND
bot.command("gemini", async (c) => {
    const body = c.message?.text?.split(" ").slice(1).join(" ");
    if (!body) return c.reply("❌ Message cannot be empty!");

    const message = await c.reply("⏳ Waiting for response...");

    try {
        const { response } = await model.generateContent(body);
        const answer = response.candidates[0]?.content?.parts[0]?.text || "I don't know the answer. 😕";

        await c.api.deleteMessage(c.chat.id, message.message_id);
        return c.reply(answer);
    } catch (error) {
        console.error(error);
        return c.reply("❌ Error while processing Gemini AI.");
    }
});

// 📌 HANDLE TIKTOK LINKS
bot.on("message", async (c) => {
    if (!c.message.text) return;

    const tiktokRegex = /https?:\/\/(www\.)?(vt|vn|vm|tiktok)\.com\/.*/;
    if (!tiktokRegex.test(c.message.text)) return c.reply("❌ Invalid TikTok link!");

    const message = await c.reply("⏳ Processing your TikTok link...");

    try {
        const res = await fetch(`https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${c.message.text}&hd=0`, {
            headers: {
                "x-rapidapi-key": RAPIDAPI_KEY,
                "x-rapidapi-host": "tiktok-download-without-watermark.p.rapidapi.com"
            }
        });

        const data = await res.json();

        if (!data.data) {
            await c.api.deleteMessage(c.chat.id, message.message_id);
            return c.reply(`❌ Error: ${data.msg || "Unknown error occurred."}`);
        }

        if (data.data.images) {
            await c.replyWithMediaGroup(
                data.data.images.map((image: string) => new InputMediaPhoto(image))
            );
            await c.api.deleteMessage(c.chat.id, message.message_id);
            return c.reply("✅ Completed! Type: Photo");
        }

        if (data.data.play && (data.data.play as string).includes(".mp4")) {
            await c.api.sendVideo(c.chat.id, data.data.play, {
                caption: "✅ Completed! Type: Video"
            });
            await c.api.deleteMessage(c.chat.id, message.message_id);
            return;
        }

        await c.reply("❌ No media found in the TikTok link.");

    } catch (error) {
        console.error("❌ Error fetching TikTok API:", error);
        return c.reply("❌ Failed to process TikTok link.");
    }
});

// 📌 ERROR HANDLING
bot.catch((error) => {
    console.error("Bot error:", error.message);
});

// ✅ EXPORT WEBHOOK
export default webhookCallback(bot, "next-js");
