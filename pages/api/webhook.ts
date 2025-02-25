import { Bot, webhookCallback, InputMediaBuilder } from "grammy";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env["GEMINI_APIKEY"] as string)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const bot = new Bot(process.env["TELEGRAM_TOKEN"] as string)

bot.api.setMyCommands([
    { command: "start", description: "bot description" },
    { command: "gemini", description: "for ask gemini ai" }
])


bot.command("start", (c) => {
    return c.reply("hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n")
})

bot.command("gemini", async (c) => {
    const body = c.message?.text?.split(' ').slice(1).join(' ')

    if (!body) return c.reply("Oops message cannot empty!")

    const message = await c.reply("waiting for response...")

    const { response } = await model.generateContent(body)

    await c.api.deleteMessage(c.chatId, message.message_id)

    return c.reply(response.text())
})

bot.on("message", async (c) => {
    if (
        c.message.text &&
        !RegExp('https?:\/\/(vt|vn|vm)\.tiktok\.com\/[a-zA-Z0-9]+').test(c.message.text)
    ) return c.reply("Oops wrong format!");

    const message = await c.reply("wait🕛...")

    const res = await fetch(`https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${c.message.text}&hd=0`, {
        headers: {
            'x-rapidapi-key': process.env["RAPIDAPI_KEY"] as string,
            'x-rapidapi-host': 'tiktok-download-without-watermark.p.rapidapi.com'
        },
    })



    const data = await res.json()

    if (!data.msg) {
        return c.reply(`Oops ${data.msg}`)
            .then(async () => await c.api.deleteMessage(c.chatId as number, message.message_id));
    }

    if (data.data.images) {
        return await c.replyWithMediaGroup(data.data.images.map((image: string) => {
            return InputMediaBuilder.photo(image)
        })).then(async () => {
            await c.reply("completed! ✅, type:photo")
            await c.api.deleteMessage(c.chatId as number, message.message_id)
        })
    }

    if ((data.data.play as string).includes(".mp4")) {
        return await c.api.sendVideo(c.chatId as number, data.data.play, {
            caption: "completed! ✅, type:video"
        }).then(async () => await c.api.deleteMessage(c.chatId as number, message.message_id))
    }

})

bot.catch((error) => {
    console.log(error.message)
})


export default webhookCallback(bot, 'next-js')
