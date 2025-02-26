import type { Context } from 'grammy';
import { model } from '@/utils/gemini';
import { escapeMarkdownV2 } from '@/utils/markdown';

export class GeminiController {

    static async main(ctx: Context) {

        const body = ctx.message?.text?.split(" ").slice(1).join(" ");
        if (!body) {
            return ctx.reply("❌ Tolong masukkan teks setelah /say!");
        }

        const [message, result] = await Promise.all([
            ctx.reply("generate response..."),
            model.generateContent(body)
        ])

        console.log(`gemini usage by ${ctx.from?.username}, ask: ${body}`)

        return await Promise.all([
            ctx.reply(result.response.text(), {
                parse_mode: "Markdown"
            }),
            ctx.api.deleteMessage(ctx.chatId!, message.message_id)
        ])
    }

}
