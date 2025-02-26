import type { Context } from "grammy";
import { InputMediaBuilder } from "grammy";

export class MessageController {

    static async main(c: Context) {
        if (
            c.message?.text &&
            !RegExp('https?:\/\/(vt|vn|vm)\.tiktok\.com\/[a-zA-Z0-9]+').test(c.message.text)
        ) return c.reply("Oops wrong format!");

        const message = await c.reply("wait🕛...")

        const res = await fetch(`https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${c.message?.text}&hd=0`, {
            headers: {
                'x-rapidapi-key': process.env["RAPIDAPI_KEY"] as string,
                'x-rapidapi-host': 'tiktok-download-without-watermark.p.rapidapi.com'
            },
        })

        const data = await res.json()

        console.log(`download completed from: ${c.from?.username}`)

        if (data.code < 0) {
            return await Promise.all([
                c.reply(`Oops ${data.msg}`),
                c.api.deleteMessage(c.chatId as number, message.message_id)
            ])
        }

        if (data.data.images) {
            return await Promise.all([
                c.replyWithMediaGroup(data.data.images.map((image: string) => InputMediaBuilder.photo(image))),
                c.reply(`${c.message?.text}\n\n @TiktokConverterRobot\ncompleted! ✅`),
                c.api.deleteMessage(c.chatId as number, message.message_id),
            ])
        }

        if ((data.data.play as string).includes("mp4")) {
            return await Promise.all([
                c.api.sendVideo(c.chatId as number, data.data.play, { caption: `${c.message?.text}\n\n @TiktokConverterRobot\ncompleted! ✅` }),
                c.api.deleteMessage(c.chatId as number, message.message_id),
            ])
        }

    }

}
