import { defineMethod } from "@/utils/decorators/defineMethod";
import { tiktokFormatMiddleware } from "@/utils/middleware/tiktok_format";
import type { Context } from "grammy";
import { InputMediaBuilder } from "grammy";

export class MessageController {

    @defineMethod({ middlewares: [tiktokFormatMiddleware] })
    static async main(c: Context): Promise<void> {
        try {
            const message = await c.reply("wait🕛...");

            const res = await fetch(`https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${c.message?.text}&hd=0`, {
                headers: {
                    'x-rapidapi-key': process.env["RAPIDAPI_KEY"] as string,
                    'x-rapidapi-host': 'tiktok-download-without-watermark.p.rapidapi.com'
                },
            });

            const data = await res.json();
            console.log(`Download completed from: ${c.from?.username}`);

            if (data.code < 0) {
                await c.reply(`Oops ${data.msg}`);
                c.api.deleteMessage(c.chatId as number, message.message_id);
                return;
            }

            if (data.data.images) {
                await Promise.all([
                    c.replyWithMediaGroup(data.data.images.map((image: string) => InputMediaBuilder.photo(image))),
                    c.reply(`${c.message?.text}\n\n @TiktokConverterRobot\nCompleted! ✅`)
                ])

                c.api.deleteMessage(c.chatId as number, message.message_id);
                return;
            }

            if ((data.data.play as string).includes("mp4")) {
                await c.api.sendVideo(c.chatId as number, data.data.play, { caption: `${c.message?.text}\n\n @TiktokConverterRobot\nCompleted! ✅` });
                c.api.deleteMessage(c.chatId as number, message.message_id);
                return;
            }
        } catch (error) {
            console.error("Error processing request:", error);
            await c.reply("An error occurred while processing your request.");
        }
    }
}

