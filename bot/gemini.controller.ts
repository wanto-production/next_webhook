import { bot } from "@/pages/api/webhook";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env["GEMINI_APIKEY"] as string)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

bot.command("gemini", async (c) => {
    const body = c.message?.text

    c.reply(body!)
})
