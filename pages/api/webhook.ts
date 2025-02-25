import { Bot, webhookCallback, InputMediaBuilder } from "grammy";

const bot = new Bot(process.env["TELEGRAM_TOKEN"] as string)

bot.api.setMyCommands([
    { command: "start", description: "bot description" }
])

bot.command("start", (c) => {
    c.reply("hello🤖,\ni am a telegram bot\nmade by t.me/iwanSlebew to convert tiktok links to video/photos.\n")
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

    c.reply(JSON.stringify(data))

    if (data.msg) {
        return c.reply(`Oops ${data.msg}`)
            .then(() => c.api.deleteMessage(c.chatId as number, message.message_id));
    }

    if (data.data.images) {
        return c.replyWithMediaGroup(data.data.images.map((image: string) => {
            return InputMediaBuilder.photo(image)
        })).then(async () => {
            await c.reply("completed! ✅, type:photo")
            await c.api.deleteMessage(c.chatId as number, message.message_id)
        })
    }

    if ((data.data.play as string).includes(".mp4")) {
        return c.api.sendVideo(c.chatId as number, data.data.play, {
            caption: "completed! ✅, type:video"
        }).then(() => c.api.deleteMessage(c.chatId as number, message.message_id))
    }

})

bot.catch((error) => {
    console.log(error.message)
})

export default webhookCallback(bot, 'next-js')
