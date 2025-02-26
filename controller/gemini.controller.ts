import type { Context } from "grammy";
import { model } from "@/utils/gemini";
import { getSession, saveSession } from "@/utils/database";

export class GeminiController {
    static async main(ctx: Context) {
        // Pastikan update berisi pesan teks
        const userMessage = ctx.message?.text?.split(' ').slice(1).join(' ')!
        const userId = ctx.from?.id

        if (!userMessage) return ctx.reply("please fill text after /gemini");

        let chatHistory = await getSession(userId) || []

        const chat = model.startChat({ history: chatHistory })

        try {
            const [message, result] = await Promise.all([
                ctx.reply("generate response..."),
                chat.sendMessage(userMessage)
            ])

            const response = result.response.text()

            chatHistory.push({ role: "user", parts: [userMessage] });
            chatHistory.push({ role: "model", parts: [response] });
            await saveSession(userId, chatHistory);

            return ctx.reply(response, {
                parse_mode: "Markdown"
            })
                .then(() => ctx.api.deleteMessage(ctx.chatId!, message.message_id));

        } catch (err) {
            //@ts-ignore
            return c.reply(`Oops something wrong: ${err.message}`)
        }
    }
}


